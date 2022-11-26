// The LoginDriver which handles all functionality on the login page

class LoginDriver {
  constructor() {
    this.isInProgress = false;
  }
  // Initialization function which handles the tabbing functionality event listeners and checks if already logged in, so it will redirect if necessary
  init() {
    const that = this;

    q("#signupButton").addEventListener("click", function(event) {
      event.preventDefault();
      that.signupUser();
    });

    q("#loginButton").addEventListener("click", function(event) {
      event.preventDefault();
      that.loginUser();
    });

    FirebaseConfigDriver.checkIfIsLoggedIn(function(resultingUser){
      if (resultingUser && !that.isInProgress) {
       window.location.href = SYSTEM_CONFIG.PROFILE_PAGE_LINK;
      }
    });
  };

  // Login user function which gets called on the login form, authenticating a user with firebase
  async loginUser() {
    this.isInProgress = true;
    let thisEmail = q("#loginEmail");
    let thisPassword = q("#loginPassword");

    if (thisEmail.value == "") {
      // Handles missing values and throws an error notice
      FirebaseConfigDriver.throwErrorNotice("Please enter a value for email and password")
    } else if (thisPassword == "") {
      // Handles missing values and throws an error notice
      FirebaseConfigDriver.throwErrorNotice("Please enter a value for email and password")
    } else {
      await FirebaseConfigDriver.loginUserOnFirebase(thisEmail.value, thisPassword.value, async function(resultsFromFirebase){
        if (resultsFromFirebase[0]) {
          // Login in the user and go to the profile page
          window.location.href = SYSTEM_CONFIG.PROFILE_PAGE_LINK;
        } else {
          FirebaseConfigDriver.throwErrorNotice("Login unsuccesful: " + resultsFromFirebase[1])
        }
        thisEmail.value = "";
        thisPassword.value = "";
      })
    }
  };

  // Sign in the user functionality which handles missing inputs
  async signupUser() {
    const that = this;

    this.isInProgress = true;
    let thisEmail = q("#signupEmail");
    let thisPassword = q("#signupPassword");

    if (thisEmail.value == "") {
      // Handles missing values and throws an error notice
      FirebaseConfigDriver.throwErrorNotice("Please enter a value for email and password")
    } else if (thisPassword.value == "") {
      // Handles missing values and throws an error notice
      FirebaseConfigDriver.throwErrorNotice("Please enter a value for email and password")
    } else {
      // Create the user fully on firebase which also initializes the favourites object for that user in that collection
      await FirebaseConfigDriver.createUserOnFirebase(thisEmail.value, thisPassword.value, async function(resultsFromFirebase){
        if (typeof resultsFromFirebase.message != 'undefined') {
          FirebaseConfigDriver.throwErrorNotice(resultsFromFirebase.message);
        } else {
          FirebaseConfigDriver.throwSuccessNotice("Signup Successful!");
          that.hideAllFormsAndDisplayNext();
        }
      }).catch((error)=>{
        FirebaseConfigDriver.throwErrorNotice(error.message);
      });

      // Reset the form
      thisEmail.value = "";
      thisPassword.value = "";
    }
  };

  // Hide all forms and display the next button, this gives enough time for the initialization of the favourites object
  hideAllFormsAndDisplayNext() {
    q("#loginForm").classList.add("hide");
    q("#signupForm").classList.add("hide");
    q("#showLoginForm").classList.add("hide");
    q("#showSignupForm").classList.add("hide");
    q("#next-progress-button").classList.remove("hide");
  };

  // Show the login form functionality
  static showLoginForm() {
    q("#loginForm").classList.remove("hide");
    q("#signupForm").classList.add("hide");
    q("#showLoginForm").disabled = true;
    q("#showSignupForm").disabled = false;
  };

  // Show the signup form functionality
  static showSignupForm() {
    q("#loginForm").classList.add("hide");
    q("#signupForm").classList.remove("hide");
    q("#showLoginForm").disabled = false;
    q("#showSignupForm").disabled = true;
  };
};
