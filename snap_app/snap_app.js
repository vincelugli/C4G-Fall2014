Points = new Mongo.Collection("points");
TwoForOne = new Mongo.Collection("twoForOne");

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
	});
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    var result = HTTP.get("http://snap-load-balancer-244858692.us-east-1.elb.amazonaws.com/ArcGIS/rest/services/retailer/MapServer/find?f=json&searchText=Atlanta&layers=0");
    var items = JSON.parse(result.content).results;
    //console.log(result);
    if (Points.find().count() === 0){
      console.log("Repopulating database");
      Points.remove({});
      for(var i = 0; i < items.length; i++){
        Points.insert(items[i]);
      }  
    }

    if(TwoForOne.find().count() === 0){
      TwoForOne.insert({address: "86 5th St NW"});
      TwoForOne.insert({address: "950 W PEACHTREE ST NW"});
    }
    
    // code to run on server at startup
  });
}
