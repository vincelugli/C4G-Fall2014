
var mapRendered = false;
gmap = undefined;
var subscriptionHandle = null;
var center = null;
var markerArray = [];
var infoWindowArray = [];

Template.map.rendered = function(){
	
	console.log("running map script");
	var locationName = decodeURIComponent(Router.current().data()["location"]);
	var searchLat = decodeURIComponent(Router.current().data()["latitude"]);
	var searchLng = decodeURIComponent(Router.current().data()["longitude"]);
	console.log("Lat long "+searchLat + ", "+searchLng);

	var mapDiv = document.createElement("div");
	//mapDiv.style.height = "100%";
	//mapDiv.style.width = "100%";
	mapDiv.classname="span12";
	//mapDiv.style.position = "absolute";
	mapDiv.id = "map_canvas";

	var hdr = document.getElementById("HEADER"), ftr = document.getElementById("FOOTER");

	var body = document.body,
    html = document.documentElement;

	var height = Math.max( body.scrollHeight, body.offsetHeight, 
                       html.clientHeight, html.scrollHeight, html.offsetHeight );
	//http://stackoverflow.com/questions/1145850/how-to-get-height-of-entire-document-with-javascript

	height -= (hdr.clientHeight + ftr.clientHeight + (2 * 22));//subtract to allow for header, footer, and two padding areas
	mapDiv.style.height = height+"px";

	document.getElementById("outer").appendChild(mapDiv);


	if(searchLat !== 'undefined'){
		var pos = {coords: {latitude: searchLat, longitude: searchLng}};
		setMapCenter(pos);
		MAP_INIT_WRAPPER();
	}
	else{
		//auto-locate
		console.log("Auto-locating");
		navigator.geolocation.getCurrentPosition(/*setMapCenter*/ function(position){
			/*
			console.log("Callback");
			debugger;
			if(gmap){
				gmap.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
				//google.maps.event.trigger("resize", gmap);
			}
			*/
			Session.set("pos", {latitude: position.coords.latitude, longitude: position.coords.longitude});
			MAP_INIT_WRAPPER();
		});
		console.log("Should be done auto-locating");
	}


	if(/*!mapRendered*/ true){
		//alert("RENDERING MAP");
		// MAP_INIT_WRAPPER();
		
	}
	else{
		//alert("MAP RENDERED");
	}



};

function MAP_INIT_WRAPPER(){
	if (subscriptionHandle) {
		subscriptionHandle.stop();
	}

	// Might need to wait until this is ready to get the proper data. Currently working though.

	// setTimeout(function () {
	subscriptionHandle = Meteor.subscribe("stores", parseFloat(Session.get("pos").latitude), parseFloat(Session.get("pos").longitude), parseInt(document.getElementById("radius").value));
	// }, 1000);
	
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
			  mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			gmap = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
			var p = Session.get("pos");
			if(p){
				center = new google.maps.LatLng(p.latitude, p.longitude);
				gmap.setCenter(center);
			} 

			var marker = new google.maps.Marker({
				position: center,
				map: gmap
			});

			directionsDisplay = new google.maps.DirectionsRenderer();
			directionsService = new google.maps.DirectionsService();
			var renderOptions = {
				"preserveViewport": true
			};
			directionsDisplay.setOptions(renderOptions);
			directionsDisplay.setMap(gmap);

		    setMarkers();
		}
	);
}

function clearMarkers() {
	for (var i = 0; i < markerArray.length; i++) {
		markerArray[i].setMap(null);
	}
}

function setMarkers() {
    var currLocation = null; 
    var currActiveWindow = null;
	var pts = Stores.find().fetch();
	clearMarkers();
	markerArray = [];
	infoWindowArray = [];

	for(var i = 0; i < pts.length; i++){
		var pt = pts[i];

		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(pt.geolocation.latitude, pt.geolocation.longitude),
			map: gmap,
			animation: google.maps.Animation.DROP,
			title: pt.storeName,
			icon: pt.is2for1 ? "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|0000FF" : null
		});

		var contentString = '<div id="content">'+
			'<div id="siteNotice">'+
			'</div>'+
			'<div id="bodyContent">'+
			'<p><b>' + pt.storeName + '</b></p>'+
			'<p id="storeHours">Store Hours: [STORE HOURS HERE]</p>' +
			'<button class="dir_btn btn btn-default"\>Get Directions</button>'+
			'</div>'+
			'</div>';

		var infoWindow = new google.maps.InfoWindow({
			maxWidth: 320,
			content: contentString
		});

		markerArray.push(marker);
		infoWindowArray.push(infoWindow);

		(function () {
			mapRendered = true;
        	var currMarker = markerArray[i];
        	var currInfoWindow = infoWindowArray[i];
        	google.maps.event.addListener(marker, 'click', function () {
        		Session.set("destPos", {name: this.title, latitude: this.position.k, longitude: this.position.B});
        		currInfoWindow.open(gmap, currMarker);
				if (currLocation != null) {
					currLocation.setVisible(true);
					currActiveWindow.close();
				}
				currLocation = currMarker;
				currActiveWindow = currInfoWindow;
				currLocation.setVisible(false);

				var selectedMode = google.maps.TravelMode.DRIVING; // document.getElementById("mode").value;

				var request = {
					origin: center,
					destination: currMarker.getPosition(),
					travelMode: selectedMode
				};
				directionsService.route(request, function(result, status) {
					if (status == google.maps.DirectionsStatus.OK) {
						directionsDisplay.setDirections(result);
					}
				});
				//placeSearch(this.title, this.position.k, this.position.B);
				Meteor.call("checkStoreHours",{storeName: this.title.split(" ")[0], lat: this.position.k, lng: this.position.B}, function(error, res){
					console.log(res);
					if(res){
						var bestResult = res.data.results[0];
						var hoursText = document.getElementById("storeHours");
						if(bestResult && bestResult.opening_hours){
							if(bestResult.opening_hours.open_now){
								hoursText.innerText = "Open Now";
								hoursText.style.color = "green";
							}
							else{
								hoursText.innerText = "Closed";
								hoursText.style.color = "red";
							}
						}
						else{
							hoursText.innerText = "Couldn't get store hours";
						}
						
					}
				});
			});
		})();
  	}
}

function setMapCenter(position){
	console.log("Setting center");
	debugger;
	if(gmap){
		gmap.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
	}
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

function placeSearch(storeName, lat, lng) {
	var key = 'AIzaSyCRFZgO_pGDpo4PKnxSjC0Pch-DuE3z9qM';
	var queryUrl = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + 
		lat + "," + lng + 
		"&rankby=distance&" + 
		"name=" + encodeURIComponent(storeName) +
		"&key=" + key;
	HTTP.get(queryUrl, getStoreHours);
}

function getStoreHours(error, result) {
	console.log("got here?");
	debugger;
}

Template.map.helpers({
	'pos' : function(){
		console.log("positioning function");
		if(gmap){
			var pos = Session.get("pos");
			gmap.setCenter(new google.maps.LatLng(pos.latitude, pos.longitude));
		}
	},
});

Template.map.events({
	'click .dir_btn': function() { 
		//debugger; 
		var pos = Session.get("pos"); //current position
		var dest = Session.get("destPos"); //destination position
		Router.go("directions", {}, {query:{fromLatitude: pos.latitude, toLatitude: dest.latitude, fromLongitude:pos.longitude, toLongitude:dest.longitude, storeName:dest.name}});
	},

	'change .dir_radius' : function () {
		if (subscriptionHandle) {
			subscriptionHandle.stop();
		}
		subscriptionHandle = Meteor.subscribe("stores", parseFloat(center.lat()), parseFloat(center.lng()), parseInt(document.getElementById("radius").value));

		setTimeout(function () {setMarkers();}, 500);
	}
});