/*
    var fs = require('fs');
    var json = JSON.stringify(response,null,2);
    fs.writeFile("pokemonExample.json",json);
*/
// Dependencies =========================
var
    twit = require('twit'),
    config = require('./config'),
    Pokedex = require('pokedex-promise-v2'),
    fs = require('fs');

var P = new Pokedex();
var Twitter = new twit(config);

// Initialize ==========================
console.log("Bot is starting...");
//all the pokemon in the poke API
var maxPokeRange = 721;
//For favoriting
var recentPokemon= '';
//Set up a user stream
var stream = Twitter.stream('user');


//POKEMON ======================================
tweetRandomPokemon(getRandomPokeNum(maxPokeRange));

function tweetRandomPokemon(num) {

    P.getPokemonSpeciesByName(num) // with Promise
        .then(function(response) {
            var obj = {};
            console.log("getting poke name and flavor text..");
            obj.name = response.name;
            //get the flavor text, remove the newlines in it
            obj.flavorText = response.flavor_text_entries[1].flavor_text.replace(/\r?\n|\r/g, " ");
            obj.num = num;
            console.log(obj.num);
            return obj;
        })
        .catch(function(error) {
            console.log('There was an error getting by species name ');
        })
        .then(buildTweet).catch(function(error) {
            console.log('There was an error building the tweet ');
        })
        .then(uploadImage).catch(function(error) {
            console.log('There was an error uploading the image ');
        })
        .then(sendTweet).catch(function(error) {
            console.log('There was an error sending the tweet '+ error);
        })
        .catch(function(error) {
            console.log('There was an ERROR: ', error);
        });
}

function buildTweet(pokeObj) {
    console.log("building tweet...");
    pokeObj.name = pokeObj.name.charAt(0).toUpperCase() + pokeObj.name.slice(1);
    var tweet = "#" + pokeObj.name + "\n" + pokeObj.flavorText;

    if (tweet.length > 140) {

        var numberOfTweets = Math.ceil(tweet.length / 135);
        var tweetParts = [];
        var start = 0;

        for (var i = 0; i < numberOfTweets; i++) {
            var tweetPart = getTweetPart(tweet, start);
            start += tweetPart.length;

            //add in the tweet number
            tweetPart += "(" + (i + 1) + "/" + numberOfTweets + ")";

            tweetParts.push(tweetPart);
        }
        pokeObj.tweetParts = tweetParts;
        return pokeObj;

    } else {
        pokeObj.tweetParts = [tweet];
        return pokeObj;
    }
}

function uploadImage(pokeObj) {
    console.log("uploading image... ");
    var filePath = "./sprites/pokemon" + pokeObj.num + ".jpg";
    var params = {
        encoding: 'base64'
    };

    var b64 = fs.readFileSync(filePath, params);
    var promise = new Promise(function(resolve, reject) {
        Twitter.post("media/upload", {
            media_data: b64
        }, function(err, data, response) {
            pokeObj.imgId = data.media_id_string;
            resolve(pokeObj);
        });
    });
    return promise;
}

function sendTweet(pokeObj) {
    console.log("sending tweet...");
    for (var i = 0; i <= pokeObj.tweetParts.length; i++) {
        var tweet = {
            status: pokeObj.tweetParts[i],
            media_ids: [pokeObj.imgId]
        };

    //Crumby hack to prevent just images going out, h as in "http://imagepath.png"
        if(tweet.status.substring(0,3) !== "http"){
            console.log("Tweet: "+tweet.status);
            Twitter.post('statuses/update', tweet, tweeted);
        }
    }

}

function tweeted(error, tweet, response) {
    if (error) {
        console.log("Error trying to tweet: " + error);
    } else {
        console.log("Successful Tweet! " + tweet.text); // Tweet text.
    }
}
// REPLY BOT ==========================

//anytime someone tweets
stream.on('tweet', tweetEvent);

function tweetEvent(eventMsg) {
    console.log("listening...");
    //console.log(recentPokemon);
    var replyTo = eventMsg.in_reply_to_screen_name;
    var text = eventMsg.text;
    var from = eventMsg.user.screen_name;

    if (replyTo == 'carl_semken') {
        var newTweet = "@" + from + ' thanks for tweeting me';
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


var favoriteTweet = function(recentPokemon) {
    var params = {
        q: '#'+recentPokemon, // REQUIRED
        result_type: 'recent',
        lang: 'en'
    };

    Twitter.get('search/tweets', params, function(err, data) {
        var tweet = data.statuses;
        //pick a random tweet
        var randomTweet = randomizer(tweet);

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
setInterval(function() {
    favoriteTweet();
}, 3600000);

//Tweet a pokemon every 4 hours
setInterval(function() {
    tweetRandomPokemon(getRandomPokeNum(maxPokeRange));
}, 3600000 * 4);


//Utils ================================

function randomizer(arr) {
    var index = Math.floor(Math.random() * arr.length);
    return arr[index];
}


function getTweetPart(str, beg) {
    var index = 0;

    str = str.substr(beg, 135);
    //if the str part is less than 135 characters, return it
    if (str.length < 135) {
        return str;
    }
    //find the last space and break there
    index = str.lastIndexOf(' ');
    str = str.substr(0, index);

    return str;
}

function getRandomPokeNum(max) {
    var randomNum = 0;
    randomNum = Math.floor(Math.random() * max);
    return randomNum;
}