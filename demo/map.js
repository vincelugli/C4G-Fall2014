if (Meteor.isClient) {




  Template.MapTemp.rendered = function(){
    var mapRendered = false;
    var pointsRenderd = false;
    var context = famous.core.Engine.createContext(document.getElementById("famousDiv"));

    var surface = new famous.core.Surface({
        size: [400, 400],
        content: '<h1 id="hEl">Submit Location</h1> <div id="map-canvas" style="height:100%; width: 100%"></div>'
    });
    context.add(surface);


    
    surface.on("click", function() {
      console.log("LOad callback");
      if (! mapRendered) {
        mapRendered = true;


        GoogleMaps.init(
          {
              'sensor': true, //optional
              //key': 'MY-GOOGLEMAPS-API-KEY', //optional
              'language': 'en' //optional
          }, 
          function(){
              var mapOptions = {
                  zoom: 13,
                  mapTypeId: google.maps.MapTypeId.MAP
              };
              map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions); 
              map.setCenter(new google.maps.LatLng(33.7550, -84.3900));
          }
        );
        navigator.geolocation.getCurrentPosition(setMapCenter);

      }
      else if((!pointsRenderd) && mapRendered) {
        pointsRenderd = true;
        var pts = Points.find().fetch();
        for(var i = 0; i < pts.length; i++){
          var pt = pts[i];

          var isTF1 = (TwoForOne.find({address: pt.attributes.ADDRESS}).count() >  0);

          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(pt.attributes.latitude, pt.attributes.longitude),
            map: map,
            title: pt.attributes.STORE_NAME,
            icon: isTF1 ? "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|0000FF" : null 
          });

        }
      }
    });
  }

  function setMapCenter(position){
    console.log("Setting center");
    map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
    document.getElementById("hEl").innerText = "List Stores";
  }
}

