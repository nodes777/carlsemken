/*
    var fs = require('fs');
    var json = JSON.stringify(response,null,2);
    fs.writeFile("pokemonExample.json",json);
*/

// Dependencies =========================
var
    twit = require('twit'),
    config = require('./config'),
    quotes = require('./quotes'),
    Pokedex = require('pokedex-promise-v2'),
    fs = require('fs');

var P = new Pokedex();
var Twitter = new twit(config);

// Initialize ==========================
console.log("Bot is starting...");
var maxPokeRange = 721;
//Set up a user stream
var stream = Twitter.stream('user');


//POKEMON ======================================
getPokemonPromise(getRandomPokeNum(maxPokeRange));

function getPokemonPromise(num){
    //var pokeObj = {};
(function getDescriptionAndImage(num){
    var p1 = P.getPokemonSpeciesByName(num) // with Promise
        .then(function(response) {
        var obj = {};
        console.log("getting poke name and flavor text..");
        obj.name = response.name;
        //get the flavor text, remove the newlines in it
        obj.flavorText = response.flavor_text_entries[1].flavor_text.replace(/\r?\n|\r/g, " ");

        return obj;
    })
    .catch(function(error) {
            console.log('There was an error getting by species name ');
         });

   var p2 = P.getPokemonByName(num) // with Promise
        .then(function(response) {
        console.log("Getting poke image...");
        var imgUrl = response.sprites.front_default;
        return imgUrl;
        })
        .catch(function(error) {
            console.log('There was an error getting the poke image: ');
         });

    return Promise.all([p1, p2]);
    }(num))
    .then(mergePokeObj)
    .then(buildTweet)
    .then(uploadImage)
    .then(sendTweet)
    .catch(function(error) {
      console.log('There was an ERROR: ', error);
    });
}

function mergePokeObj(pokeParts){
    var pokeObj= {};
    pokeObj.name = pokeParts[0].name;
    pokeObj.flavorText = pokeParts[0].flavorText;
    pokeObj.imgUrl = pokeParts[1];
    return pokeObj;
}

function buildTweet(pokeObj){
    console.log("building tweet...");
    pokeObj.name = pokeObj.name.charAt(0).toUpperCase() + pokeObj.name.slice(1);
    var tweet = "#"+pokeObj.name + "\n"+ pokeObj.flavorText;

        if(tweet.length>140){

            var numberOfTweets =  Math.ceil(tweet.length/135);
            var tweetParts = [];
            var start = 0;
            var distance = 135;

            //console.log("Number of tweets needed: "+numberOfTweets+"\n");
            for(var i = 0; i<numberOfTweets; i++){
                tweetPart =  getTweetPart(tweet, start);
                start += tweetPart.length;

                //add in the tweet number
                tweetPart += "("+(i+1)+"/"+numberOfTweets+")";

                tweetParts.push(tweetPart);
            }
            pokeObj.tweetParts = tweetParts;
            return pokeObj;

        } else {
            pokeObj.tweetParts = [tweet];
            return pokeObj;
        }
}


function uploadImage(pokeObj){
    console.log("uploading image... ");
    var filePath = pokeObj.imgUrl;
    var params = {
        encoding: 'base64'
    };

    var b64 = fs.readFileSync(filePath, params);
    Twitter.post("media/upload", {media_data: b64}, function (err, data, response) {
        //console.log("data..."+data.errors);
        console.log(err);
        console.log(pokeObj);
        pokeObj.imgId =  data.media_id_string;
    });
}



function sendTweet(pokeObj){
    console.log("sending tweet...");
    for(var i = 0; i<=pokeObj.tweetParts.length; i++){
        //console.log("media id: "+ pokeObj.imgId );
        var tweet = {
        status: pokeObj.tweetParts[i],
        media_ids: [pokeObj.imgId]
    };
        Twitter.post('statuses/update', tweet, postCallBack);
    }

}
// REPLY BOT ==========================

//anytime someone tweets
stream.on('tweet', tweetEvent);

function tweetEvent(eventMsg){
    console.log("listening...");
    var replyTo = eventMsg.in_reply_to_screen_name;
    var text = eventMsg.text;
    var from = eventMsg.user.screen_name;

    if(replyTo == 'carl_semken'){
        var newTweet = "@"+from+' thanks for tweeting me';
        sendTweet([newTweet]);
    }
}

// FOLLOW BOT ======================

// Anytime someone follows me
stream.on('follow', followed);

function followed(eventMsg) {
  console.log("Follow event!");
  var name = eventMsg.source.name;
  var screenName = eventMsg.source.screen_name;
  sendTweet(['.@' + screenName + " I'm a robot"]);
}

// Fav BOT ==========================

var favoriteTweet = function() {
    var params = {
        q: '#pokemon', // REQUIRED
        result_type: 'recent',
        lang: 'en'
    };

    Twitter.get('search/tweets', params, function(err, data) {
        var tweet = data.statuses;
        //pick a random tweet
        var randomTweet = ranDom(tweet); //ranDom is defined below

        if (typeof randomTweet != 'undefined') {
            Twitter.post('favoites/create', {
                id: randomTweet.id_str
            }, function(err, response) {
                if (err) {
                    console.log('CANNOT BE FAVORITED... Error');
                } else {
                    console.log('FAVORITED... Success!!!');
                }
            });
        }
    });
};



// favorite a tweet in every hour, just offset it by 15 mins
//setTimeOut(function(){setInterval(favoriteTweet, 3600000);}(360000/4));
//setInterval(favoriteTweet, 3600000);
//Tweet a pokemon every 6 hours
setInterval(function(){getPokemonPromise(getRandomPokeNum(maxPokeRange));}, 3600000*6);


//Utils ================================



function postCallBack (error, tweet, response){
          if(error){
            console.log("Error trying to tweet: "+ error);
          } else {
                console.log("Successful Tweet! " + tweet.text);  // Tweet text.
            }
        }

function ranDom(arr) {
    var index = Math.floor(Math.random() * arr.length);
    return arr[index];
}


function getTweetPart(str, beg){
    var index = 0;

    str = str.substr(beg, 135);
    //if the str part is less than 135 characters, return it
        if(str.length<135){
            return str;
        }
    //find the last space and break there
    index = str.lastIndexOf(' ');
    str = str.substr(0, index);

    return str;
}

function getRandomPokeNum(max){
    var randomNum = 0;
    randomNum = Math.floor(Math.random() * max);
    return randomNum;
}