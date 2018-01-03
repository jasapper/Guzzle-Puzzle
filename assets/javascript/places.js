var script = $('<script>')
  .attr('src', "https://maps.googleapis.com/maps/api/js?key=AIzaSyALcSlmfH1nlwlbe7YGvb0SQu7mn_f2i2s&libraries=places&callback=initMap")
  .attr('async','').attr('defer','');
script.appendTo($('body'));

// Declaring global variable
var infoWindow = null;
var searchResults = [];
var myPosition = null;
var lowestRating = 2;
var directionsDisplay;
var directionsService;
var map;

function initMap() {

  directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true,  preserveViewport: true});
  directionsService = new google.maps.DirectionsService();

  var ucf = {lat: 28.6024, lng: -81.2001};

  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16,
    center: ucf,
    streetViewControl: false,
    mapTypeControl: false
  });
  
  directionsDisplay.setMap(map);

  infoWindow = new google.maps.InfoWindow({content: "Holding..."});

  // Try to locate user via HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      myPosition = pos;

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      map.setCenter(pos);

      var marker = new google.maps.Marker({
        position: pos,
        map: map,
        //icon: ""
      });

      var request = {
        location: pos,
        radius: '500',
        types: ['bar']
      };

      service = new google.maps.places.PlacesService(map);
      service.nearbySearch(request, callback);

    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ? 'Error: The geolocation service has failed.' : 'Error: Your browser doesn\'t support geolocation.');
  }

  function showDirections(place) {
    // console.log(this);
    index = this.dataset.index;
    // console.log(searchResults[index].position);
    google.maps.event.trigger(searchResults[index], 'click');
  }

  function calcRoute(dest) {
    var request = {
      origin: myPosition,
      destination: dest,
      travelMode: google.maps.TravelMode.WALKING
    };
    directionsService.route(request, function(result, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(result);
      }
    });
  }

  function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {

      // Filters results to only display locations with minimum (default: 3)
      results = results.filter(function(result){
        return result.rating > lowestRating;
      });

      results = results.sort(function(a,b){
        return b.rating - a.rating;
      });

      // for each place in result, create an <a> tag and a marker.
      results.forEach(function(place, i){
        var element = document.createElement("a");
        element.setAttribute('href', '#');
        element.setAttribute('data-index', i);
        element.setAttribute('class', "list-group-item");
        element.addEventListener("click", showDirections);
        var node = document.createTextNode(place.name + " - " + place.rating + " / 5");
        element.appendChild(node);
        document.getElementById('list').appendChild(element);
        createMarker(place);
      });

    }
  }

  function createMarker (place) {
    var marker = new google.maps.Marker({
      position: place.geometry.location,
      map: map,
      title: place.name,
      rating: place.rating,
      icon: 'http://maps.google.com/mapfiles/ms/icons/bar.png',
      address: place.vicinity
    });

    searchResults.push(marker);
    google.maps.event.addListener(marker, 'click', function(){
      windowContent = "<h5>"+this.title+"</h5>"+"<p>"+"Rating: "+"<strong>"+this.rating+"</strong>"+" / 5"+"</p>";
      calcRoute(this.position);
      infoWindow.setContent(windowContent);
      infoWindow.open(map, this);
    });
  }
}