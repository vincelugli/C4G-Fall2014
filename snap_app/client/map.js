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
					var center = new google.maps.LatLng(p.latitude, p.longitude);
					if(p){

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

				    var markerArray = [];
				    var infoWindowArray = [];
				    var currLocation = null; 
				    var currActiveWindow = null;   
					var pts = Points.find().fetch();

					for(var i = 0; i < pts.length; i++){
						var pt = pts[i];

						var isTF1 = (TwoForOne.find({address: pt.attributes.ADDRESS}).count() >  0);

						var marker = new google.maps.Marker({
							position: new google.maps.LatLng(pt.attributes.latitude, pt.attributes.longitude),
							map: gmap,
							animation: google.maps.Animation.DROP,
							title: pt.attributes.STORE_NAME
						});

						var contentString = '<div id="content">'+
							'<div id="siteNotice">'+
							'</div>'+
							'<div id="bodyContent">'+
							'<p><b>' + pt.attributes.STORE_NAME + '</b></p>'+
							'<p>Store Hours: [STORE HOURS HERE]</p>' +
							'<p>Get Directions</p>'+
							'</div>'+
							'</div>';

						var infoWindow = new google.maps.InfoWindow({
							maxWidth: 320,
							content: contentString
						})

						markerArray.push(marker);
						infoWindowArray.push(infoWindow);

						(function () {
			            	var currMarker = markerArray[i];
			            	var currInfoWindow = infoWindowArray[i];
			            	google.maps.event.addListener(marker, 'click', function () {
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
							});
						})();

						placeSearch(pt.attributes.STORE_NAME, pt.attributes.latitude, pt.attributes.longitude);
			      	}
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

	function placeSearch(storeName, lat, lng) {
		var key = 'AIzaSyCRFZgO_pGDpo4PKnxSjC0Pch-DuE3z9qM';
		var queryUrl = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + 
			lat + "," + lng + 
			"rankby=distance&" + 
			"name=" + storeName;
		HTTP.get(queryUrl, {}, getStoreHours);
	}

	function getStoreHours(error, result) {
		console.log("got here?");
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