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
    Pokedex = require('pokedex-promise-v2');

var P = new Pokedex();
var Twitter = new twit(config);

// Initialize ==========================
console.log("Bot is starting...");
var maxPokeRange = 721;
//Set up a user stream
var stream = Twitter.stream('user');


//POKEMON ======================================
//getPokemon(getRandomPokeNum(maxPokeRange));
//var pokemon = getPokemonPromise(getRandomPokeNum(maxPokeRange));
//returns undefined because it hasn't gotten an answer back from Pokemon' API
//console.log(pokemon);

//getPokemonPromise(getRandomPokeNum(maxPokeRange));

//501 for Oshwott<140
//1 for Bulbasaur>140
getPokemonPromise(1);

function getPokemonPromise(num){
    P.getPokemonSpeciesByName(num) // with Promise
    .then(function(response) {
      var pokeObj = {
            //upperCase the first letter
            name: response.name.charAt(0).toUpperCase() + response.name.slice(1),
            //get the flavor text, remove the newlines in it
            flavorText: response.flavor_text_entries[1].flavor_text.replace(/\r?\n|\r/g, " ")
        };
        return pokeObj;
    })
    .then(buildTweet)
    .then(sendTweet)
    .catch(function(error) {
      console.log('There was an ERROR: ', error);
    });
}


function buildTweet(pokemon){
    var tweet = "#"+pokemon.name + "\n"+ pokemon.flavorText;
    //var tweet = "It hides in shadows. It is said that if Gengar is hiding, it cools the area by nearly 10 degrees F. Lurking in the shadowy corners of rooms, it awaits chances to steal its prey's life force. The leer that floats in darkness belongs to a Gengar delighting in casting curses on people.";

        if(tweet.length>140){
            //console.log("Tweet longer than 140: " + tweet.length);
            var numberOfTweets =  Math.ceil(tweet.length/135);
            var tweetParts = [];
            var start = 0;
            var distance = 135;

            console.log("Number of tweet needed: "+numberOfTweets+"\n");
            for(var i = 0; i<numberOfTweets; i++){
                tweetPart =  getTweetPart(tweet, start);
                start += tweetPart.length;
                //console.log("tweetPart length: "+start);
                //add in the tweet number
                tweetPart += "("+(i+1)+"/"+numberOfTweets+")";

                tweetParts.push(tweetPart);
            }
            //console.log("tweetParts: " + tweetParts+"\n");
            return tweetParts;

        } else {
            return(tweet);
        }
}


function getTweetPart(str, beg){
    var index = 0;

    str = str.substr(beg, 135);
        if(str.length<135){
            return str;
        }
    index = str.lastIndexOf(' ');
    str = str.substr(0, index);

    return str;
}

function getRandomPokeNum(max){
    var randomNum = 0;
    randomNum = Math.floor(Math.random() * max);
    return randomNum;
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
        sendTweet(newTweet);
    }
}

// FOLLOW BOT ======================

// Anytime someone follows me
stream.on('follow', followed);

function followed(eventMsg) {
  console.log("Follow event!");
  var name = eventMsg.source.name;
  var screenName = eventMsg.source.screen_name;
  sendTweet('.@' + screenName + " I'm a robot");
}

// Fav BOT ==========================

var favoriteTweet = function() {
    var params = {
        q: '#reality', // REQUIRED
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
                    console.log('CANNOT BE FAVORITE... Error');
                } else {
                    console.log('FAVORITED... Success!!!');
                }
            });
        }
    });
};



// favorite a tweet in every  minutes
setInterval(favoriteTweet, 360000);

//sendTweet();
//setInterval(sendTweet, 60000* 600);

//Utils ================================

function sendTweet(txt){
    console.log("sending tweet...");
    var tweet = {
        status: txt
    };

    Twitter.post('statuses/update', tweet, function(error, tweet, response){
      if(error){
        console.log("error! "+ error);
      } else {
            console.log("Success! " + tweet.text);  // Tweet text.
      }
    });
}

// function to generate a random tweet tweet
function ranDom(arr) {
    var index = Math.floor(Math.random() * arr.length);
    return arr[index];
}