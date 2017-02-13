var http = require('http'),
fs = require('fs'),
options;

var maxPokeRange = 721;
var image_downloader = require('image-downloader');

//if all are run at the same time error is: too many open files
for(var i = 1; i<maxPokeRange ; i++){
    var options = {
        url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+ i +'.png',
        dest: './sprites/pokemon'+i+'.jpg',
        done: function(err, filename, image) {
            if (err) {
                throw err;
            }
            console.log('File saved to', filename);
        },
    };
    image_downloader(options);
}

var backRange = 649
for(var i = 1; i<backRange ; i++){
    var options = {
        url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/'+ i +'.png',
        dest: './sprites/pokemon_back'+i+'.jpg',
        done: function(err, filename, image) {
            if (err) {
                throw err;
            }
            console.log('File saved to', filename);
        },
    };
    image_downloader(options);
}
for(var i = 1; i<backRange ; i++){
    var options = {
        url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/'+ i +'.png',
        dest: './sprites/pokemon_shiny'+i+'.jpg',
        done: function(err, filename, image) {
            if (err) {
                throw err;
            }
            console.log('File saved to', filename);
        },
    };
    image_downloader(options);
}
for(var i = 1; i<backRange ; i++){
    var options = {
        url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/'+ i +'.png',
        dest: './sprites/pokemon_back_shiny'+i+'.jpg',
        done: function(err, filename, image) {
            if (err) {
                throw err;
            }
            console.log('File saved to', filename);
        },
    };
    image_downloader(options);
}

