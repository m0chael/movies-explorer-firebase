// The FirebaseConfigDriver which handles all the firebase related commands for the web app

class FirebaseConfigDriver {
  // Init for user which handles generic logged in processing and uses waitForUser since it takes time to return back the user
  static initForUser() {
    this.waitForUser();

    const user = firebase.auth().currentUser;
    if (user) {
      this.processLoggedInUser();
    }
  };

  // Generic helper function for checking when user is logged in and returns the callback that requested it
  static async checkIfIsLoggedIn(callback) {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        callback(user);
      } else {
        callback(false);
      }
    });
  };

  //Wait for user function which is similar to the above but just processes the user, so it is like a failsafe if the initForUser doesn't detect the user right away
  static waitForUser() {
    const that = this;
    this.checkIfIsLoggedIn(function(incomingUser){
      if (incomingUser) {
        that.processLoggedInUser();
      } else {
        console.log("User is not signed in...");
      }
    });
  };

  // Handle the logged in user which is a generic function that applies on all pages, switches the menu titles and adds logout event
  static processLoggedInUser() {
    const that = this;

    function signOutFromLoginLink() {
      firebase.auth().signOut()
      that.processSignedOut();
      document.querySelector("#login-link").removeEventListener("click", signOutFromLoginLink);
    };

    q("#login-link").innerText = "Logout";
    q("#login-link").href = SYSTEM_CONFIG.NULL_PAGE_LINK;
    q("#user-link").classList.remove("hide");
    q("#login-link").addEventListener("click", signOutFromLoginLink);
  };

  // Process for signout which switches the link back, and updates the href
  static processSignedOut() {
    q("#login-link").innerText = "Login";
    q("#login-link").href = SYSTEM_CONFIG.LOGIN_PAGE_LINK;
  };

  // Gets all items from firebase generic function which gets a collection of documents and goes to the callback, otherwise throws an error screen
  static getAllFromFirebase(incomingCollection, callback) {
    let docs = db.collection(incomingCollection);

    docs.get().then((success) => {
      callback(success);
    }).catch((error) => {
      this.throwErrorNotice(error);
    });
  };

  // Clear the error notices on the screen
  static clearError() {
    let theseErrors = document.querySelectorAll(".error-notice");

    for (let someError = 0; someError < theseErrors.length; someError++) {
      theseErrors[someError].remove();
    }
  };

  // Throws a successful notice which turns off the loaders as a failsafe
  static throwSuccessNotice(successMessage) {
    let successNotice = document.createElement("div");
    successNotice.innerHTML = ':) ' + successMessage + '</span><button class="button" onclick="FirebaseConfigDriver.clearError()">Clear</button>';
    successNotice.classList.add("success-notice");
    successNotice.classList.add("error-notice");
    document.body.appendChild(successNotice);
    this.loadingOff();
  };

  // Throws an error notice which turns off the loaders as a failsafe
  static throwErrorNotice(error) {
    let errorNotice = document.createElement("div");
    errorNotice.innerHTML = 'Something went wrong...<span>' + error + '</span><button class="button" onclick="FirebaseConfigDriver.clearError()">Clear</button>';
    errorNotice.classList.add("error-notice");
    document.body.appendChild(errorNotice);
    this.loadingOff();
  };

  // Updates the movie likes on firebase for the incoming movieId
  static async updateMovieLikesInFirebase(incomingId) {
    console.log("Searching for item to update likes: " + incomingId);
    let thisDocument = await db.collection(SYSTEM_CONFIG.MOVIE_COLLECTION).doc(incomingId).get();
    db.collection(SYSTEM_CONFIG.MOVIE_COLLECTION).doc(incomingId).update({likes: thisDocument.data().likes + 1});
  };

  // Updates the favourites item to the favourites collection for the uid of the user, depends on the initialization of the favourites collection on signup!
  static async updateFavouritesItem(incomingUid, incomingFavouritesObject) {
    console.log("Updated favourites item for this user...");
    let thisDocument = await db.collection(SYSTEM_CONFIG.FAVOURITES_COLLECTION).where("uid", "==", incomingUid);

    thisDocument.get().then((doc) => {
      console.log("Updating this favourite document...");
        if (doc.docs[0].exists) {
          console.log("Doc exists...");
          let wasFound = false;
          let thisIndexFound = -1;
          let thisFavourites = doc.docs[0].data();

          for (let favouriteItem = 0; favouriteItem < thisFavourites.favourites.length; favouriteItem++) {
            if (thisFavourites.favourites[favouriteItem].movieId == incomingFavouritesObject.movieId) {
              wasFound = true;
              thisIndexFound = favouriteItem;
           }
          }

          if (wasFound) {
            // It the favourites item was already found, then increase the like count on it
            thisFavourites.favourites[thisIndexFound].likeCount = parseInt(thisFavourites.favourites[thisIndexFound].likeCount) + 1;
            db.collection(SYSTEM_CONFIG.FAVOURITES_COLLECTION).doc(doc.docs[0].id).update({favourites: thisFavourites.favourites });
          } else {
            // Otherwise push this new favourite item into the favourites collection for the uid of the user
            thisFavourites.favourites.push(incomingFavouritesObject);
            db.collection(SYSTEM_CONFIG.FAVOURITES_COLLECTION).doc(doc.docs[0].id).update({favourites: thisFavourites.favourites});
          }

          console.log("Updated favourites...");
        } else {
          // Then the signup call to initialize the favourites didn't work succesfully and there was no favourites item, shouldn't ever happen
          this.throwErrorNotice("no document to update for this uid.");
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
  };

  // Create the user on firebase for the email and password and initiate the callback to go back to the LoginPage component
  static async createUserOnFirebase(incomingEmail, incomingPassword, callback) {
    firebase.auth().createUserWithEmailAndPassword(incomingEmail, incomingPassword)
    .then((userOutput) => {
      that.initializeUserFavourites(userOutput);
      callback(userOutput);
    }).catch((error) => {
      callback(error);
    });
  };

  // Login the user on firebase generic with a callback to the LoginPage component
  static async loginUserOnFirebase(incomingEmail, incomingPassword, callback) {
    firebase.auth().signInWithEmailAndPassword(incomingEmail, incomingPassword)
    .then((userOutput) => {
      callback([true, userOutput]);
    }).catch((error) => {
      this.throwErrorNotice(error);
      callback([false, error]);
    });
  };

  // Initialize the user favourites for the uid of the user
  static initializeUserFavourites(resultingUser) {
    console.log("Resulting user to initialize favourites...");

    let newUserFavourite = {uid: resultingUser.user.uid, favourites:[] };

    db.collection(SYSTEM_CONFIG.FAVOURITES_COLLECTION).doc().set(newUserFavourite).then(() => {
      console.log("Favourites document Successfully intialized!");
    }).catch((error) => {
        this.throwErrorNotice(error);
    });
  };

  // Get a single document out of the favourites collection for this user id with a callback internally when succesful, otherwise throw an error notice
  static getSingleFavouritesDoc(incomingUid, callback) {
    let docRef = db.collection(SYSTEM_CONFIG.FAVOURITES_COLLECTION).where("uid", "==", incomingUid);

    docRef.get().then((doc) => {
        if (doc.docs[0].exists) {
            callback(doc.docs[0]);
        } else {
            this.throwErrorNotice("No document created for this favourites uid.");

        }
    }).catch((error) => {
        console.log("Error getting document:", error);
        this.throwErrorNotice(error);
    });
  };

  // Get a single movie document from the collection, used in series by the ProfilePage
  static getSingleMovieDoc(incomingId, callback) {
    let docRef = db.collection(SYSTEM_CONFIG.MOVIE_COLLECTION).doc(incomingId);

    docRef.get().then((doc) => {
      if (doc.exists) {
          callback(doc.data());
      } else {
          this.throwErrorNotice("No document created for this favourites uid.");

      }
    }).catch((error) => {
        console.log("Error getting document:", error);
        this.throwErrorNotice(error);
    });
  };

  // Turn off the loading spinner
  static loadingOff() {
    q("#loading").classList.add("opacity-off");
  };
};
