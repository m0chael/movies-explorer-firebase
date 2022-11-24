// The ProfileDriver which handles all functionality on user's profile page

class ProfileDriver {
  // Empty constructor
  // Initialize the profile page checking to make sure the user is logged in to process the profile page
  async init() {
    const that = this;

    await FirebaseConfigDriver.checkIfIsLoggedIn(function(resultingUser){
      if (!resultingUser) {
        window.location.href = SYSTEM_CONFIG.LOGIN_PAGE_LINK;
      } else {
        console.log("Detected login successful");
        that.processProfilePage(resultingUser);
      }
    });
  };

  // Start the processing of the profile page by grabbing the favourites item for that user based on the uid
  processProfilePage(resultingUser) {
    const that = this;

    q("#user-email-span").innerText = resultingUser.email;
    FirebaseConfigDriver.getSingleFavouritesDoc(resultingUser.uid, function(incomingDoc){
      that.buildFavouritesItems(incomingDoc.data());
    });
  };

  // Build the list of favourites items, by grabbing each movie doc that matches with the movieId from firebase and list the item on the page as a favourited one
  async buildFavouritesItems(incomingDocument) {
    if (incomingDocument.favourites.length == 0) {
      q("#user-sub-text").innerText = "Start liking movies for them to show up here!";
    } else {
      q("#user-sub-text").innerText = "These are your liked movies: "
      q("#favourites-list").innerHTML = '<ul></ul>';

      for (let index = 0; index < incomingDocument.favourites.length; index++) {
        await FirebaseConfigDriver.getSingleMovieDoc(incomingDocument.favourites[index].movieId, function(thisResult){
          console.log("Received result");
          let thisNewElement = document.createElement("li");
          thisNewElement.innerHTML += '<div class="titles">' + thisResult.show.name + '</div>';
          thisNewElement.innerHTML += '<img src="'+thisResult.show.image.medium+'">';
          thisNewElement.innerHTML += '<div class="likes-section"><span>&#x2605;' + incomingDocument.favourites[index].likeCount + '</span></div>';

          q("#favourites-list ul").appendChild(thisNewElement);
        });
      }
    }
    FirebaseConfigDriver.loadingOff();
  };
};
