// The MovieBrowser which handles all functionality on the admin page

class MovieBrowser {
  // Variables for the API for syncing
  constructor() {
    this.dataBundle = null;
    this.personLookupBundle = null;
  }

  // Start the event listeners for the form on the admin page
  initLookups() {
    let that = this;

    q("#movie-lookup-submit").addEventListener("click", function(event){
      let thisMovieLookup = q("#movie-lookup").value;
      event.preventDefault();

      that.apiGetter(SYSTEM_CONFIG.API_BASE_MOVIES_URL+thisMovieLookup).then((incoming) => {
        // After receiving results from the api, build the mini list of items to be able to be synced
        that.dataBundle = incoming;
        that.buildMovieList();
        q("#movie-lookup").value = "";
        q("#sync-movies").disabled = false;
        q("#movie-lookup-submit").disabled = true;
      });
    });
  };

  // Build the movie list on the admin page (mini view)
  buildMovieList() {
    let incomingDataBundle = this.dataBundle;
    let imageCount = 0;

    let builder = "<ul>";
    for (var index = 0; index < incomingDataBundle.length; index++) {
      builder += '<li>';
        builder += '<div class="titles">' +incomingDataBundle[index].show.name + '</div>';
        if (incomingDataBundle[index].show.image != null) {
          imageCount++;
          builder += '<img class="movie-img" src="'+incomingDataBundle[index].show.image.medium+'">';
        }
      builder += '</li>';
    }
    builder += "</ul>";

    q("#movie-list").innerHTML = builder;
    q("#movie-count").innerHTML = imageCount + " images counted, compared to: " + incomingDataBundle.length + " items.";
    q("#movie-list").classList.remove("individual-list");
    q("#main-title").textContent = "Movie Browser";
  };

  // apiGetter functionality to pull the data as a generic function with the queryString
  async apiGetter(queryString) {
    const response = await fetch(queryString).then((response) => {
      return response.json();
    }).catch((err) => {
      throw new Error(
        `Oops! An error occurred as: ${err}`
      );
    });

    return response;
  };
};
