// The DirectoryDriver component

const DirectoryDriver = {
  // The initialization function which grabs the movies from firebase and then builds the directory page
  init() {
    const that = this;
    FirebaseConfigDriver.getAllFromFirebase(SYSTEM_CONFIG.MOVIE_COLLECTION, function(resultsFromFirebase){
      that.buildDirectoryPage(resultsFromFirebase);
    });
  },

  // The liking functionality which ensures being logged in, and then increases the likes for the movie, as well as updating the favourites list of the user.
  likeItem(incomingEvent) {
    FirebaseConfigDriver.checkIfIsLoggedIn(function(resultingUser){
      if (resultingUser) {
        FirebaseConfigDriver.updateMovieLikesInFirebase(incomingEvent);
        let newFavouritesItem = {movieId: incomingEvent, likeCount: 1 };
        FirebaseConfigDriver.updateFavouritesItem(resultingUser.uid, newFavouritesItem);

        let theseItems = document.querySelectorAll("li");
        for (let index = 0; index < theseItems.length; index++) {
          let thisAttribute = theseItems[index].getAttribute("data-id");
          if (thisAttribute == incomingEvent) {
            theseItems[index].childNodes[2].childNodes[0].innerText = parseInt(theseItems[index].childNodes[2].childNodes[0].innerText) + 1;
          }
        }
      } else {
        FirebaseConfigDriver.throwErrorNotice("Sorry, need to be logged in first!")
      }
    })
  },

  // Builds the directory page from the results of movie objects from the firebase collection and turns off the loading spinner
  buildDirectoryPage(resultsFromFirebase) {
    let builder = '<ul>';
    let thisItem = null;
    resultsFromFirebase.forEach((incomingDocument) => {

      thisItem = incomingDocument.data();
      if (thisItem.show.image != null) {
        builder += '<li data-id="'+incomingDocument.id+'">';
          builder += '<div class="titles">' + thisItem.show.name + '</div>';
            builder += '<a data-lity data-lity-target="'+thisItem.show.image.medium+'"><img src="'+thisItem.show.image.medium + '"></a>';
          builder += '<div class="likes-section"><span>' + thisItem.likes + '</span><button class="likes" onclick="DirectoryDriver.likeItem(\''+incomingDocument.id+'\')">LIKE</button></div>';
        builder += '</li>';
      }
    });

    builder += '</ul>';
    document.querySelector("#movie-list").innerHTML = builder;
    FirebaseConfigDriver.loadingOff();
  }
};
