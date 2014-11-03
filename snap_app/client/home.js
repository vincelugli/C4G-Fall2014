Template.home.events({
		
		'click .manual_loc' : function manual_loc(){
			/*
			var location = encodeURIComponent($.trim($("#location_field").val()));
			if(location == ""){
				Router.go("map");
			}
			else{
				console.log("Going to " + location);
				Router.go("map", {}, {query: {"location" : location}});
			}
			*/
			alert("Still working on this one");

		},
		'click .auto_loc' : function auto_loc(){
			console.log("Auto-locate");
			Router.go("map");
		},
		
	}
);