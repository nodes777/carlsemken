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

//POKEMON ======================================
function getPokemon(num){
    P.getPokemonSpeciesByName(num)
    .then(function(response) {
        var pokeObj = {
            name: response.name,
            flavorText: response.name
        };
        console.log(pokeObj.name);
        sendTweet(pokeObj.name);


    })
    .catch(function(error) {
      console.log('There was an error  getting the pokemon: ', error);
    });
}

function getRandomPokeNum(max){
    var randomNum = 0;
    randomNum = Math.floor(Math.random() * max);
    return randomNum;
}

getPokemon(getRandomPokeNum(maxPokeRange));



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