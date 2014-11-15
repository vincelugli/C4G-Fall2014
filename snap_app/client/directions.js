gmap = undefined;



Template.directions.rendered = function(){

	var fromLat = decodeURIComponent(Router.current().data()["fromLatitude"]);
	var toLat = decodeURIComponent(Router.current().data()["toLatitude"]);
	var fromLng = decodeURIComponent(Router.current().data()["fromLongitude"]);
	var toLng = decodeURIComponent(Router.current().data()["toLongitude"]);
	var storeName = decodeURIComponent(Router.current().data()["storeName"]);
	
	//Do map stuff here



	GoogleMaps.init(
		{
		  'sensor': true, //optional
		  //key': 'MY-GOOGLEMAPS-API-KEY', //optional
		  'language': 'en' //optional
		}, 
		function(){
			console.log("Starting directions init function");
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

			directionsDisplay = new google.maps.DirectionsRenderer();
			directionsService = new google.maps.DirectionsService();
			var renderOptions = {
				"preserveViewport": true
			};
			directionsDisplay.setOptions(renderOptions);
			directionsDisplay.setMap(gmap);
			directionsDisplay.setPanel(document.getElementById("directions-panel"));

			var selectedMode = document.getElementById("mode").value;
			var request = {
				origin: new google.maps.LatLng(fromLat, fromLng),
				destination: new google.maps.LatLng(toLat, toLng),
				travelMode: selectedMode
			};

			directionsService.route(request, function(result, status) {
				if (status == google.maps.DirectionsStatus.OK) {
					directionsDisplay.setDirections(result);
				}
			});
		}
	);
}