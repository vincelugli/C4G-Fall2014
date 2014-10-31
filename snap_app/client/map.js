if(Meteor.isClient){
	
	var mapRendered = false;

	Template.map.rendered = function(){
		
		console.log("running map script");
		var locationName = decodeURIComponent(Router.current().data()["location"]);
		console.log("Location: "+locationName);
		if(!mapRendered){
			GoogleMaps.init(
				{
				  'sensor': true, //optional
				  //key': 'MY-GOOGLEMAPS-API-KEY', //optional
				  'language': 'en' //optional
				}, 
				function(){
				  var mapOptions = {
				      zoom: 13,
				      mapTypeId: google.maps.MapTypeId.MAP
				  };
				  gmap = new google.maps.Map(document.getElementById("map-canvas"), mapOptions); 
				  gmap.setCenter(new google.maps.LatLng(33.7550, -84.3900));

				  directionsDisplay = new google.maps.DirectionsRenderer();
				  directionsService = new google.maps.DirectionsService();
				  var renderOptions = {
				    "preserveViewport": true
				  };
				  directionsDisplay.setOptions(renderOptions);
				  directionsDisplay.setMap(gmap);
				}
			);
			//debugger;
			if(locationName !== 'undefined'){//Weird IR thing??
				//manually entered location
				console.log("Manually locating");
				searchAddress(locationName);
			}
			else{
				//auto-locate
				console.log("Auto-locating");
        		navigator.geolocation.getCurrentPosition(setMapCenter);
			}
			mapRendered = true;
		}
	};

	function setMapCenter(position){
		console.log("Setting center");
		gmap.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
	}

	function searchAddress(addrString){
		var queryUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" + encodeURIComponent(addrString); //redundant ^^
		HTTP.get(queryUrl, {}, getSearchAddressLocation);
	}

	function getSearchAddressLocation(error, result){
		debugger;
		var loc = result.data.results[0].geometry.location;
		//gmap.setCenter(new google.maps.LatLng(loc.lat, loc.lang));
		//Wrong context, gmap variable doesn't exist.
		//probably fix with Session, but I'm too lazy right now
		alert("Not implemented (see comments)");
	}
}