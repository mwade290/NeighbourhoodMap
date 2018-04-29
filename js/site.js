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
var fourSquareClientID = 'NSBLVQNWYH4BDXJVWJ2MSVK5PBBGASYVH4ZIYEBWULSG14MI';
var fourSquareClientSecret = 'WKQOSQDLDMZUUPSL45NTQ2P3XSYRDHB1XNDN1YMSQ52GRJNS';

function reformatUndefined(input) {
  return input != null ? input : '';
}

function getFourSquareContent(item) {
    
    var URL = '';
    var street = '';
	var city = '';
    var content = '';
    
    var fourSquareURL = 'https://api.foursquare.com/v2/venues/search?ll=';
    fourSquareURL += item.location.lat;
    fourSquareURL += ',';
    fourSquareURL += item.location.lng;
    fourSquareURL += '&client_id=';
    fourSquareURL += this.fourSquareClientID;
    fourSquareURL += '&client_secret=';
    fourSquareURL += this.fourSquareClientSecret;
    fourSquareURL += '&v=20180428&query=';
    fourSquareURL += item.title;
    
    $.ajax({
        async: false,
        url: fourSquareURL,
        dataType: 'JSON',
        success: function(data) {
            var result = data.response.venues[0];
            URL = reformatUndefined(result.URL);
            street = reformatUndefined(result.location.formattedAddress[0]);
            city = reformatUndefined(result.location.formattedAddress[1]);
            content = '<div class="marker markerTitle">'
            content += item.title;
            content += '</div><div class="marker">';
            content += URL;
            content += '</div><div class="marker">';
            content += street;
            content += '</div><div class="marker">';
            content += city;
            content += '</div>';
            return content;
        },
        error: function() {
            alert("Error loading FourSquare API. Try refreshing the page.");
        }
    });
    
    return content;
}

function siteViewModel() {
    
    var self = this;
    this.locations = ko.observableArray();
    this.filterInput = ko.observable('');
    
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 41.898824, lng: 12.476775},
        zoom: 14
    });

	defaultLocations.forEach(function(item){
		self.locations.push(new Location(item));
	});

	this.filteredLocations = ko.computed( function() {
		var filter = self.filterInput().toLowerCase();
		if (filter) {
			return ko.utils.arrayFilter(self.locations(), function(item) {
				var title = item.title.toLowerCase();
				var result = title.search(filter) >= 0;
				item.visible(result);
				return result;
			});
		} else {
            self.locations().forEach(function(item){
				item.visible(true);
			});
			return self.locations();
		}
	}, self);
    
}

var Location = function(item) {
    
    var self = this;
    this.title = item.title;
    this.lat = item.location.lat;
    this.lng = item.location.lng;
    this.visible = ko.observable(true);
    this.content = getFourSquareContent(item);
    
    this.infoWindow = new google.maps.InfoWindow();

	this.marker = new google.maps.Marker({
			position: new google.maps.LatLng(this.lat, this.lng),
			map: map,
			title: this.title,
            animation: google.maps.Animation.DROP
	});
    
    this.marker.setMap(map);
    
    this.marker.addListener('click', function() {
        self.infoWindow.setContent('<div>' + self.content + '</div>');
        self.infoWindow.open(map, this);
    });
    
    this.showMarker = ko.computed(function() {
		if(self.visible() === true) {
			this.marker.setMap(map);
		} else {
			self.marker.setMap(null);
		}
		return true;
	}, this);
    
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