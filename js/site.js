var defaultLocations = [
    
    {title: 'St. Peter\'s Basilica', location: {lat: 41.902365, lng: 12.453937}, url: 'https://foursquare.com/v/basilica-di-san-pietro-in-vaticano/4adcdac6f964a520105321e3'},
    {title: 'Sistine Chapel', location: {lat: 41.902998, lng: 12.454655}, url: 'https://foursquare.com/v/cappella-sistina/4bd6f610637ba593c5f7f870'},
    {title: 'The Colosseum', location: {lat: 41.890452, lng: 12.492242}, url: 'https://foursquare.com/v/colosseo/4adcdac6f964a520355321e3'},
    {title: 'Fontana della Barcaccia', location: {lat: 41.906057, lng: 12.482267}, url: 'https://foursquare.com/v/fontana-della-barcaccia/4adcdac9f964a520355421e3'},
    {title: 'Spanish Steps', location: {lat: 41.906050, lng: 12.482793}, url: 'https://foursquare.com/v/spanish-steps/56ae63d2498ebc7219c2cd3f'},
    {title: 'Obelisk', location: {lat: 41.910919, lng: 12.479737}, url: 'https://foursquare.com/v/obelisco-flaminio/4e9474c2775b564ca3221e61'},
    {title: 'Fiumi Fountain', location: {lat: 41.899168, lng: 12.473111}, url: 'https://foursquare.com/v/piazza-navona/4adcdac6f964a520285321e3'}
    
];

var map;
var redMarker = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
var greenMarker = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
var fourSquareClientID = 'NSBLVQNWYH4BDXJVWJ2MSVK5PBBGASYVH4ZIYEBWULSG14MI';
var fourSquareClientSecret = 'WKQOSQDLDMZUUPSL45NTQ2P3XSYRDHB1XNDN1YMSQ52GRJNS';

$(document).ready(function () {

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
        $('#map').toggleClass('active');
        $('.collapse.in').toggleClass('in');
        
    });
    
});

function googleError() {
    alert("Could not connect to the Google Maps API.");
    $('#map').html('Error loading maps. Try refreshing the page.');
}

// Starting point for JS
function initMap() {
    ko.applyBindings(new siteViewModel());
}

function siteViewModel() {
    
    var self = this;
    self.locations = ko.observableArray();
    self.filterInput = ko.observable('');
    
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 41.898824, lng: 12.476775},
        zoom: 14
    });

	defaultLocations.forEach(function(item){
		self.locations.push(new Location(item));
	});

	self.filteredLocations = ko.computed( function() {
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
    this.windowOpen = false;
    this.content = getFourSquareContent(item);
    
    this.infoWindow = new google.maps.InfoWindow();

	this.marker = new google.maps.Marker({
        
			position: new google.maps.LatLng(this.lat, this.lng),
			map: map,
			title: this.title,
            animation: google.maps.Animation.DROP,
            icon: redMarker
        
	});
    
    // Handle the click event of a marker
    this.marker.addListener('click', function() {
        
        if (self.windowOpen){
            self.infoWindow.close();
            self.marker.setIcon(redMarker);
            self.windowOpen = false;
        } else {
            self.infoWindow.setContent('<div>' + self.content + '</div>');
            self.infoWindow.open(map, this);
            self.marker.setIcon(greenMarker);
            self.windowOpen = true;
        }
        
    });
    
    // Handle when the user presses the 'x' in an infoWindow
    google.maps.event.addListener(self.infoWindow, 'closeclick', function() {
        
        self.marker.setIcon(redMarker);
        
    });
    
    this.showMarker = ko.computed(function() {
        
        self.marker.setVisible(self.visible());
		return true;
        
	}, this);
    
    this.highlight = function(place) {
        
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        // Sets the amount of time to bounce for
        // 2130 looks about right to end at the bottom of a bounce
        setTimeout(function() {
            
            self.marker.setAnimation(null);
            
        }, 2130);
		google.maps.event.trigger(self.marker, 'click');
        
	};
    
};

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
    
    // Call to FourSquare API
    // Needs to be called synchronously otherwise you get undefined values
    $.ajax({
        async: false,
        url: fourSquareURL,
        dataType: 'JSON'
    })
        .done(function(data) {
            var result = data.response.venues[0];
            URL = result.URL || '';
            street = result.location.formattedAddress[0] || '';
            city = result.location.formattedAddress[1] || '';
            content = '<div class="marker markerTitle"><a href="'
            content += item.url;
            content += '" target="_blank">';
            content += item.title;
            content += '</a></div><div class="marker">';
            content += street;
            content += '</div><div class="marker">';
            content += city;

            if (URL != ''){
                content += '</div><div class="marker"><a href="';
                content += URL;
                content += '" target="_blank">Website URL</a>';
            }
            
            content += '</div>';

            return content;
        })
        .fail(function() {
            alert("Error loading FourSquare API. Try refreshing the page.");
        });

    return content;
}