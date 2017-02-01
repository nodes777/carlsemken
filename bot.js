// Dependencies =========================
var
    twit = require('twit'),
    config = require('./config'),
    quotes = require('./quotes');

var Twitter = new twit(config);

// RETWEET BOT ==========================

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

// function to generate a random tweet tweet
function ranDom(arr) {
    var index = Math.floor(Math.random() * arr.length);
    return arr[index];
}

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
	  console.log(tweet);  // Tweet body.
	  console.log(response);  // Raw response object.
	});
};


// grab & retweet as soon as program is running...
retweet();

setInterval(retweet, 300000);

// grab & 'favorite' as soon as program is running...
favoriteTweet();
// 'favorite' a tweet in every  minutes
setInterval(favoriteTweet, 360000);

sendTweet();

