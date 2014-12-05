//Points = new Mongo.Collection("points");
//TwoForOne = new Mongo.Collection("twoForOne");


Stores = new Mongo.Collection("stores");
/*
Stores schema: MongoID, Geolocation (lat, long), address1, address 2, city, state, zip5, zip4, county, snap objectID
*/
Meta = new Mongo.Collection("meta");

if (Meteor.isClient) {
  // counter starts at 0
	Router.configure({
		layoutTemplate: 'layout',
		yieldTemplate: {
			header: {
				to: 'header'
			},
			footer: {
	 			to: 'footer'
			}
		}
	});
	Router.map(function(){
		this.route('home', {path: ['/','/home']});
		this.route('about', {path: "/about"});
		this.route('contact', {path: "/contact"});
    this.route('search', {path: "/search"});
		this.route('map', {path: "/map", data: function(){
      var query = this.params.query;
      console.log("QUERY " + query);
      return query;
    }});
    this.route('directions', {path: '/directions', data: function(){
      var query = this.params.query;
      console.log("directions query");
      console.log(query);
      return query;
    }});
	});
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    var SEARCH_CITY = "Atlanta"
    console.log("Server Startup");
    if (Stores.find().count() === 0){ //TODO - repopulate on schedule
      var result = HTTP.get("http://snap-load-balancer-244858692.us-east-1.elb.amazonaws.com/ArcGIS/rest/services/retailer/MapServer/find?f=json&searchText="+SEARCH_CITY+"&layers=0");
      var items = JSON.parse(result.content).results;
      console.log("Repopulating database");
      Stores.remove({});
      for(var i = 0; i < items.length; i++){
        if(items[i].foundFieldName === "CITY"){ //Only insert search results where "Atlanta" refers to City
          //MongoID, Geolocation (lat, long), address1, address 2, city, state, zip5, zip4, county, snap objectID
          var store = items[i].attributes;
          var storeObj = {
            storeName: store.STORE_NAME,
            geolocation: {
              longitude: parseFloat(store.longitude),
              latitude: parseFloat(store.latitude)
            },
            address1: store.ADDRESS,
            address2: store.ADDRESS2 == "Null"? "":store.ADDRESS2,
            city: store.CITY,
            state: store.STATE,
            zip5: store.ZIP5, 
            zip4: store.zip4 == "Null"?"":store.zip4,
            county: store.County,
            SNAPobjectId: store.OBJECTID,
            is2for1: false, //TODO - when updating, cache true values, don't change here
          };
          Stores.insert(storeObj);
          
        }
      }  
    }
    // This is currently a work around that is expected to change.
    Stores._ensureIndex({geolocation: "2d"});

    Meteor.publish("stores", function(lat, lon, miles){
      return Stores.find({geolocation: {$geoWithin: {$centerSphere: [[lon, lat], miles/3959]}}}); 
    });
    
  });
  Meteor.methods({
    checkStoreHours: function(obj){
      var key = 'AIzaSyCRFZgO_pGDpo4PKnxSjC0Pch-DuE3z9qM';
      var queryUrl = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + 
      obj.lat + "," + obj.lng + 
      "&rankby=distance&" + 
      "name=" + encodeURIComponent(obj.storeName) +
      "&key=" + key;
      console.log(queryUrl);
      this.unblock();
      var result = HTTP.get(queryUrl);
      //console.log(results);
      return result;
    },
  });
}

