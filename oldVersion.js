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