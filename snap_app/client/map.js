if(Meteor.isClient){
	var mapRendered = false;

	Template.map.rendered = function(){
		
		console.log("running map script");
		var locationName = decodeURIComponent(Router.current().data()["location"]);
		var searchLat = decodeURIComponent(Router.current().data()["latitude"]);
		var searchLng = decodeURIComponent(Router.current().data()["longitude"]);
		console.log("Lat long "+searchLat + ", "+searchLng);
		if(!mapRendered){
			GoogleMaps.init(
				{
				  'sensor': true, //optional
				  //key': 'MY-GOOGLEMAPS-API-KEY', //optional
				  'language': 'en' //optional
				}, 
				function(){
				console.log("Starting map init function");
				  var mapOptions = {
				      zoom: 13,
				      mapTypeId: google.maps.MapTypeId.MAP
				  };
				  gmap = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
				  var p = Session.get("pos");
				  if(p){

				  	gmap.setCenter(new google.maps.LatLng(p.latitude, p.longitude));
				  	
				  } 

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
			/*
			if(locationName !== 'undefined'){//Weird IR thing??
				//manually entered location
				console.log("Manually locating");
				searchAddress(locationName);
			}
			*/
			if(searchLat !== 'undefined'){
				var pos = {coords: {latitude: searchLat, longitude: searchLng}};
				setMapCenter(pos);
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
		//gmap.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
		Session.set("pos", {latitude: position.coords.latitude, longitude: position.coords.longitude});
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

Template.map.helpers({
	'pos' : function(){
		console.log("positioning function")
		if(gmap){
			var pos = Session.get("pos");
			gmap.setCenter(new google.maps.LatLng(pos.latitude, pos.longitude));
		}
	},
});