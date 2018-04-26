var defaultLocations = [
    
    {title: 'St. Peter\'s Basilica', location: {lat: 41.902365, lng: 12.453937}},
    {title: 'Sistine Chapel', location: {lat: 41.902998, lng: 12.454655}},
    {title: 'The Colosseum', location: {lat: 41.890452, lng: 12.492242}},
    {title: 'Fontana della Barcaccia', location: {lat: 41.906057, lng: 12.482267}},
    {title: 'Spanish Steps', location: {lat: 41.906050, lng: 12.482793}},
    {title: 'Obelisk', location: {lat: 41.910919, lng: 12.479737}},
    {title: 'Fiumi Fountain', location: {lat: 41.899168, lng: 12.473111}}
    
];

var map;

//function initMap() {
//    
//    map = new google.maps.Map(document.getElementById('map'), {
//        center: {lat: 41.898824, lng: 12.476775},
//        zoom: 14
//    });
//
//    var markers = [];
//    var position;
//    var title;
//    var marker;
//    var largeInfowindow = new google.maps.InfoWindow();
//    var bounds = new google.maps.LatLngBounds();
//
//    for (var i = 0; i < locations.length; i++) {
//        position = locations[i].location;
//        title = locations[i].title;
//        marker = new google.maps.Marker({
//            map: map,
//            position: position,
//            title: title,
//            animation: google.maps.Animation.DROP,
//            id: i
//        });
//        markers.push(marker);
//        bounds.extend(marker.position);
//        marker.addListener('click', function() {
//            populateInfoWindow(this, largeInfowindow)
//        });
//        map.fitBounds(bounds);
//    }
//    
//};

function populateInfoWindow(marker, infowindow) {
    
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      infowindow.setContent('<div>' + marker.title + '</div>');
      infowindow.open(map, marker);

      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });
    }
    
}

function siteViewModel() {
    
    var self = this;
    this.locations = ko.observableArray();
    this.filter = ko.observable('');
    
    defaultLocations.forEach(function(item) {
        self.locations.push(new Location(item));
    });
    
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 41.898824, lng: 12.476775},
        zoom: 14
    });
    
}

var Location = function(item) {
    
    var self = this;
    this.title = item.title;
    this.lat = item.location.lat;
    this.lng = item.location.lng;
    
};

function initMap() {
    ko.applyBindings(new siteViewModel());
}

$(document).ready(function () {

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
        $('#map').toggleClass('active');
        $('.collapse.in').toggleClass('in');
        google.maps.event.trigger(map, 'resize');
    });
    
});