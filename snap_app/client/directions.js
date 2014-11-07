if(Meteor.isClient){

	var mapRendered = false;

	Template.directions.rendered = function(){
		if(!mapRendered){
			var fromLat = decodeURIComponent(Router.current().data()["fromLatitude"]);
			var toLat = decodeURIComponent(Router.current().data()["toLatitude"]);
			var fromLng = decodeURIComponent(Router.current().data()["fromLongitude"]);
			var toLng = decodeURIComponent(Router.current().data()["toLongitude"]);
			var storeName = decodeURIComponent(Router.current().data()["storeName"]);
			
			//Do map stuff here



			mapRendered = true;
		}
	}
}