Session.set("resultsArr", [])

Template.search.events({
	'click .search_btn' : searchLocations,

	'click .search_result' : function(){
		//debugger;
		Router.go("map", {}, {query: {latitude: this.geometry.location.lat, longitude: this.geometry.location.lng}});
	},	
});

Template.search.helpers({
	results: function(){ return Session.get("resultsArr");},
});

function searchLocations(){
	var locText = document.getElementById("inputLocation").value;
	var queryUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" + encodeURIComponent(locText);
	HTTP.get(queryUrl, populateSearchResults);
}

function populateSearchResults(error, result){
	//TODO - error handling
	/*
	debugger;
	var locations = result.data.results;
	var list = document.getElementById("resultsBox");
	for(var i = 0; i < locations.length; i++){
		var listItem = Template["searchResult"]();
		//listItem.className = "search_result list-group-item";
		listItem.innerText = locations[i].formatted_address;
		//listItem.fullResult = locations[i];
		list.appendChild(listItem);
	}
	*/
	Session.set("resultsArr", result.data.results);
}