// The ProfilesDriver which handles all functionality on the public profiles page

const ProfilesDriver = {
  // Initialize the profiles page by getting the items from firebase for the movies and favourites
  init() {
    const that = this;

    FirebaseConfigDriver.getAllFromFirebase(SYSTEM_CONFIG.MOVIE_COLLECTION, function(movieResultsFromFirebase){
      console.log("Got data from movies...");
      FirebaseConfigDriver.getAllFromFirebase(SYSTEM_CONFIG.FAVOURITES_COLLECTION, function(resultsFromFirebase){
        console.log("Got data from favourites...");
        that.buildPublicProfilesPage(movieResultsFromFirebase, resultsFromFirebase.docs);
      });
    });

  },

  // Then build the profiles page and turn the loading spinner off
  buildPublicProfilesPage(movieResultsFromFirebase, resultsFromFirebase) {
    let thisItem = null;
    let thisMovieItem = null;
    let count = 0;

    let builder = '<ul>';
    // Go through the favourites results
    resultsFromFirebase.forEach((incomingDocument) => {
      thisItem = incomingDocument.data();
      builder += '<li data-id="'+thisItem.uid+'">';
      builder += '<div class="button-type">Movie Member # '+count+'</div>';
      count++;

      // Go through the movies results for each favourite item to pull out the one with the same movieId
      movieResultsFromFirebase.forEach((incomingMovie) => {
        thisMovieItem = incomingMovie.data()

        for (let favouritesItemIndex = 0; favouritesItemIndex < thisItem.favourites.length; favouritesItemIndex++) {
          if (incomingMovie.id == thisItem.favourites[favouritesItemIndex].movieId) {
            builder += '<div class="public-titles"><span>&#x2605;' + thisItem.favourites[favouritesItemIndex].likeCount + '</span> ' + thisMovieItem.show.name + '</div>';
          }
        }
      });

      builder += '</li>';
    });
    builder += '</ul>';

    // Populate the list with the constructed builder
    q("#profiles-list").innerHTML = builder;
    // Turn the loader off
    FirebaseConfigDriver.loadingOff();
  }
};
