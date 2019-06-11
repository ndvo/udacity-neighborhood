
// Global scope

var map;

// Initialize the map before KnockOut takes over
async function initMap() {
    console.log(ViewModel.neighborhood);
    map = new google.maps.Map(document.getElementById('map'), {
        center: ViewModel.neighborhood,
        zoom: 16
    });
    console.log(map);
    ViewModel.updateNeighborhood();
}


var ajax = {
    json: function (url, success, fail){
            var request = new XMLHttpRequest();
            request.onreadystatechange = function() {
                if (request.readyState === 4) {
                    if (request.status >= 200 && request.status < 300) {
                        success(JSON.parse(request.responseText));
                    } else {
                        if (fail !== undefined) {
                            fail(request.status);
                        }
                        console.log(request);
                    }
                }
            };
            request.open("GET", url);
            request.send();
        }
};


// Model

var Model = {
    keyring : {
        google: {
            main: 'AIzaSyA4URcI5aWH3KTq8Fvn-PZeUJD-8mSg1l0'
        }
    },
};


// ViewModel
var ViewModel = {
    neighborhood: {
        address: ko.observable('Taguatinga Sul Setor Primavera'),
        lat: 0,
        lng: 0,
        zoom: 16
    },
    fetcher: {
        map: {
            url: `https://maps.googleapis.com/maps/api/js?key=${Model.keyring.google.main}&callback=initMap`,
        },
        geocode: {
            url: `https://maps.googleapis.com/maps/api/geocode/json?key=${Model.keyring.google.main}&address=`,
            success: function(response){
                ViewModel.neighborhood.lat = response.results[0].geometry.location.lat;
                ViewModel.neighborhood.lng = response.results[0].geometry.location.lng;
                map.setCenter(ViewModel.neighborhood);
            }
                ,
            fail: function(e){
                console.log('Error geocoding:', e);
                this.message.push("It was not possible to retrieve data for this neighborhood")}
        },
    },
    updateNeighborhood: function(){
        ajax.json(this.fetcher.geocode.url+this.neighborhood.address(), this.fetcher.geocode.success, this.fetcher.geocode.fail);
    },
    message: []
};



ko.applyBindings(ViewModel);
