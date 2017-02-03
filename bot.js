// Dependencies =========================
var
    twit = require('twit'),
    config = require('./config'),
    quotes = require('./quotes');

var Twitter = new twit(config);

// Initialize ==========================
console.log("Bot is starting...");
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

// FOLLOW BOT ======================

// Anytime someone follows me
stream.on('follow', followed);

function followed(eventMsg) {
  console.log("Follow event!");
  var name = eventMsg.source.name;
  var screenName = eventMsg.source.screen_name;
  sendTweet('.@' + screenName + " I'm a robot");
}

// RETWEET BOT ==========================
/*
// find latest tweet according the query 'q' in params
var retweet = function() {
    var params = {
        q: '#carlSemken', // passes all of these into the get
        result_type: 'recent',
        lang: 'en'
    };
    Twitter.get('search/tweets', params, function(err, data) {
        // if there no errors
        if (!err) {

            // grab ID of tweet to retweet
            var retweetId = data.statuses[0].id_str;
            // Tell TWITTER to retweet
            Twitter.post('statuses/retweet/:id', {
                id: retweetId
            }, function(err, response) {
                if (response) {
                    console.log('Retweeted!!!');
                }
                // if there was an error while tweeting
                if (err) {
                    console.log('Something went wrong while RETWEETING... Duplication maybe...');
                }
            });
        }
        // if unable to Search a tweet
        else {
            console.log('Something went wrong while SEARCHING...Maybe no tweets to be found within params');
        }
    });
};

*/

// Fav BOT ==========================

var favoriteTweet = function() {
    var params = {
        q: '#carlSemken, #carlsemken', // REQUIRED
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


/*
// SEND a Tweet -------------------
var sendTweet = function() {
	var randomQuote = ranDom(quotes);
	var param = {
		status : randomQuote
	};

	Twitter.post('statuses/update', param,  function(error, tweet, response){
	  if(error){
	    console.log(error);
	  }
	  console.log(tweet.text);  // Tweet body.
	  console.log(response);  // Raw response object.
	});
};
*/

// grab & retweet as soon as program is running...
//retweet();

//setInterval(retweet, 300000);

// grab & 'favorite' as soon as program is running...
//favoriteTweet();
// 'favorite' a tweet in every  minutes
//setInterval(favoriteTweet, 360000);

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