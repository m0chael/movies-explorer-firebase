// The SyncFirebaseDriver which handles the actual syncing function in conjunction with the MovieBrowser for the admin page

class SyncFirebaseDriver {
  // Empty constructor
  // Initialize it by asserting if logged in and is the ADMIN_USER from the config
  async init() {
    await FirebaseConfigDriver.checkIfIsLoggedIn(function(resultingUser){
      if (!resultingUser) {
        window.location.href = "login.html";
      } else {
        console.log("Detected login successful");
        if (resultingUser.uid == SYSTEM_CONFIG.ADMIN_USER) {
          console.log("Detected login successful");
          q("#admin-main").classList.remove("hide");
        } else {
          window.location.href = "profile.html";
        }
      }
    });
  };

  // Actual syncing of current items from the api into the movies collection on firebase
  static async syncMovieBrowserCurrentItems() {
    await FirebaseConfigDriver.getAllFromFirebase(SYSTEM_CONFIG.MOVIE_COLLECTION, async function(resultsFromFirebase){

      // Set a default value if the collection is starting from scratch and is empty
      if (resultsFromFirebase.length == 0) {
        resultsFromFirebase = [{show:{id:-1}}];
      }

      let wasFound = false;
      for (let index = 0; index < movieBrowser.dataBundle.length; index++) {
        wasFound = false;

        resultsFromFirebase.forEach((incomingDocument) => {
          // Ensure the show wasn't previously synced to avoid duplciates
          if (incomingDocument.data().show.id == movieBrowser.dataBundle[index].show.id) {
            console.log(movieBrowser.dataBundle[index] + " - This show already synced!");
            wasFound = true;
          }
        });

        if (!wasFound) {
          // Then create the item into the database, forces this loop to go gradually and slowly with a time delay
          console.log(movieBrowser.dataBundle[index]);
          // Displaying the progress of syncing gently
          document.querySelector("#main-title").innerText = "Syncing: " + (index + 1) + "...";
          await SyncFirebaseDriver.saveWithTimeDelay(movieBrowser.dataBundle[index], index);
        }
      }

      FirebaseConfigDriver.throwSuccessNotice("Successful sync!");
    });
  };

  // Save movie into the database with a gradual time delay to avoid spamming the database
  static async saveWithTimeDelay(incomingDataBundle, index) {
    return new Promise((resolve, reject)=> {
      setTimeout(function(){
        if (index == movieBrowser.dataBundle.length - 1) {
          FirebaseConfigDriver.throwSuccessNotice("Synced items successfully");
        }
        SyncFirebaseDriver.saveMovieIntoFirebaseSingleDoc(incomingDataBundle);
        resolve();
      },1000);
    });
  };

  // Saves the movie into the database collection, syncing from the API
  static saveMovieIntoFirebaseSingleDoc(incomingBundle) {
    let newIncomingBundle = incomingBundle;
    newIncomingBundle.likes = 0;
    db.collection(SYSTEM_CONFIG.MOVIE_COLLECTION).doc().set(newIncomingBundle).then(() => {
        console.log("Movie Document Successfully written!");
    }).catch((error) => {
        console.error("Error writing document: ", error);
        FirebaseConfigDriver.throwErrorNotice("Error writing document - " + error);
    });
  };
};
