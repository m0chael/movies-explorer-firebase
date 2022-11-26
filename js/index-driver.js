// The IndexDriver which handles all functionality on the landing page

class IndexDriver {
  // Slide show variables

  constructor() {
    this.slideShowBundle = [];
    this.slideShowIndex = 0;
    this.SLIDE_SHOW_DELAY = 1000;
  };

  // Initialize the index page by getting the movies from firebase to populate the slideshow images and keep things dynamic
  init() {
    const that = this;

    FirebaseConfigDriver.getAllFromFirebase(SYSTEM_CONFIG.MOVIE_COLLECTION, async function(resultsFromFirebase){
      that.buildIndexPage(resultsFromFirebase);
    });

    // Set the landing page specific button when the user is logged in
    FirebaseConfigDriver.checkIfIsLoggedIn(function(resultingUser){
      if (resultingUser) {
        q("#login-link-button").href = SYSTEM_CONFIG.PROFILE_PAGE_LINK;
        q("#login-link-button").innerText = "My profile";
      }
    });
  };

  // Build the index page using the movie results from firebase firestore
  buildIndexPage(resultsFromFirebase) {
    let thisItem = null;

    resultsFromFirebase.forEach((incomingDocument) => {
      thisItem = incomingDocument.data();
      if (thisItem.show.image != null) {
        this.slideShowBundle.push(thisItem.show.image.medium);
      }
    });

    q("#slideshow").src = this.slideShowBundle[this.slideShowIndex];
    q("#slideshow").classList.remove("hide");

    this.startSlideShow();
    FirebaseConfigDriver.loadingOff();
  };

  // Start the slideshow tiemout which calls itself to keep going
  startSlideShow() {
    const that = this;

    setTimeout(function(){
      that.slideShowIndex++;
      if (that.slideShowIndex == that.slideShowBundle.length - 1) {
        that.slideShowIndex = 0;
      }
      q("#slideshow").src = that.slideShowBundle[that.slideShowIndex];
      that.startSlideShow();
    }, this.SLIDE_SHOW_DELAY)
  };
};
