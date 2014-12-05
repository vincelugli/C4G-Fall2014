gmap = undefined;
var fromLat;
var toLat;
var fromLng;
var toLng;
var storeName;

Template.directions.rendered = function(){

	fromLat = decodeURIComponent(Router.current().data()["fromLatitude"]);
	toLat = decodeURIComponent(Router.current().data()["toLatitude"]);
	fromLng = decodeURIComponent(Router.current().data()["fromLongitude"]);
	toLng = decodeURIComponent(Router.current().data()["toLongitude"]);
	storeName = decodeURIComponent(Router.current().data()["storeName"]);

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

			directionsDisplay = new google.maps.DirectionsRenderer({supressMarkers: true});
			directionsService = new google.maps.DirectionsService();
			var renderOptions = {
				"preserveViewport": true
			};
			directionsDisplay.setOptions(renderOptions);
			directionsDisplay.setMap(gmap);
			// directionsDisplay.setPanel(document.getElementById("directions-panel"));
			calcRoute();
		}
	);
};

function calcRoute () {
	var dirPanel = document.getElementById("directions-panel");
	dirPanel.innerHTML = '';

	var selectedMode = document.getElementById("mode").value;
	var request = {
		origin: new google.maps.LatLng(fromLat, fromLng),
		destination: new google.maps.LatLng(toLat, toLng),
		travelMode: selectedMode
	};

	directionsService.route(request, function(result, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(result);
			console.log(result);

			var dir = result.routes[0].legs[0];
			var output = '';

			output += '<div class="dir_start">' + dir.start_address + '</div>'
			output += '<div class="dir_summary silver">Travel: '+ dir.distance.text +' - about '+ dir.duration.text +'</div>';

			output += '<table>';

			for (i=0; i<dir.steps.length; i++){
				output += '<tr style="border-bottom: 1px solid silver;">';
				output += '<td class="dir_row"><span class="dir_sprite '+ dir.steps[i].maneuver +'"></span></td>';
				output += '<td class="dir_row">'+ (i+1) +'.</td>';
				output += '<td class="dir_row">'+ dir.steps[i].instructions +'</td>';
				output += '<td class="dir_row" style="white-space:nowrap;">'+ dir.steps[i].distance.text +'</td>';
				output += '</tr>';
			}			

			output += '</table>';

			output += '<div class="dir_end">'+ dir.end_address +'</div>';

			dirPanel.innerHTML += output;
		}
	});
}

Template.directions.events({
	'change .dir_mode' : function () {
		calcRoute();
	}
});