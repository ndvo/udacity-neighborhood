// Global scope

var map;

// Initialize the map before KnockOut takes over
async function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 0, lng: 0},
        zoom: 16
    });
    ViewModel.updateNeighborhood();
}

var ajax = {
    json: function (url, success, fail, mediawiki=false) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
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
        if (mediawiki){
          //request.setRequestHeader("Origin", "http://localhost");
          request.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        }
        request.send();
    }
};



function categoryOptions(type){
    var localType = type;
    return function(){
        var categories = [''];
        var list = [];
        if (ViewModel === undefined) {
            list = Model[initialNeighborhood][localType].items;
        }else{
            list = Model[ViewModel.neighborhood.address()][localType].items;
        }
        for (var i=0; i<list.length; i++){
            categories.push(list[i].category);
        }
        return [...new Set(categories)];
    };
}

// ViewModel
var ViewModel = {
    message: [],
    testing: ko.observable(),
    currentItem: ko.observable({name: '', description: '', category: '', type: '', info: '', source: '', url:'' }),
    beforeEdit: ko.observable({name: '', description: '', category: '', type: '', info: '', source: '', url: ''}),
    editable: ko.observable(false),
    query: ko.observable({events: {name: '', description: '', category: ''}, places: {name: '', description: '', category: ''}}),
    markers: [],
    eventsCategories: ko.computed(categoryOptions('events')),
    placesCategories: ko.computed(categoryOptions('places')),
    filtering: ko.observable(false),
    clearCurrentItem: function(){
        ViewModel.currentItem({name: '', description: '', category: '', type: '', info: '', source: '', url: ''});
    },
    toggleEditable: function () {
        if (!ViewModel.editable()) {
            ViewModel.beforeEdit = ViewModel.currentItem;
        }
        ViewModel.editable(!ViewModel.editable())
    },
    toggleFilter: function(){
        ViewModel.filtering(!ViewModel.filtering());
    },
    saveData: function () {
        var curr = ViewModel.currentItem();
        Model.replace(
            ViewModel.beforeEdit().type,
            ViewModel.beforeEdit().name,
            ko.toJS(curr)
        );
        ViewModel.currentItem(ko.toJS(curr));
        ViewModel.toggleEditable();
    },
    cancelEdit: function () {
        ViewModel.currentItem = ViewModel.beforeEdit;
        ViewModel.toggleEditable();
    },
    neighborhood: {
        address: ko.observable(initialNeighborhood),
        lat: 0,
        lng: 0,
        zoom: 16
    },
    // Fetch data from APIS
    fetcher: {
        map: {
            url: `https://maps.googleapis.com/maps/api/js?key=${Model.keyring.google.main}&callback=initMap`,
        },
        geocode: {
            url: `https://maps.googleapis.com/maps/api/geocode/json?key=${Model.keyring.google.main}&address=`,
            success: function (response) {
                ViewModel.neighborhood.lat = response.results[0].geometry.location.lat;
                ViewModel.neighborhood.lng = response.results[0].geometry.location.lng;
                map.setCenter(ViewModel.neighborhood);
                ViewModel.updatepoints();
            }
            ,
            fail: function (e) {
                console.log('Error geocoding:', e);
                ViewModel.message.push("It was not possible to retrieve data for this neighborhood")
            }
        },
        mediawiki: {
          url: `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=`,
          success: function(response){
            console.log(response);
          },
          fail: function(e){console.log(e)}
        },
        duckDuckGo: {
          url: `https://api.duckduckgo.com/?format=json&q=$`,
          success: function(response){
            ViewModel.currentItem().info = response.AbstractText;
            ViewModel.currentItem().source = response.AbstractSource;
            ViewModel.currentItem().url = response.AbstractURL;
          },
          fail: function(e){
            console.log('Error fetching additional info:', e);
            ViewModel.message.push("It was not possible to retrieve data for this neighborhood")
          }
        }
    },
    // Fetch the mock database for new points using the proto querying language
    getPoints: function (queryObj) {
        map.setCenter(ViewModel.neighborhood);
        if (!(ViewModel.neighborhood.address() in Model)) {
            console.log("There is no ViewModel yet. Not possible to getPoints.");
            return [];
        }
        var types = [
            [Model[ViewModel.neighborhood.address()].events, queryObj.events],
            [Model[ViewModel.neighborhood.address()].places, queryObj.places]
        ];
        var points = [];
        for (var t = 0; t < types.length; t++) {
            if (types[t][1]) {
                var itemList = types[t][0].items;
                var q = types[t][1];
                // fill the points array if a filter is not set or if it matches
                for (var i = 0; i < itemList.length; i++) {
                    var curr = itemList[i];
                    if (q.name && curr.name.match(q.name) === null)
                        continue;
                    if (q.description && curr.description.match(q.description) === null)
                        continue;
                    if (q.category && curr.category !== q.category)
                        continue;
                    points.push(curr);
                }
            }
        }
        return points;
    },
    // Updates the markers on the map based on the ViewModel.query
    updatepoints: function (targetMap = map) {
        for (var i = 0; i < ViewModel.markers.length; i++) {
            ViewModel.markers[i].setMap(null);
        }
        ViewModel.markers = [];
        var bounds = new google.maps.LatLngBounds();
        var points = ViewModel.getPoints(ViewModel.query());
        if (points.length === 0) {
            return;
        }
        for (var i = 0; i < points.length; i++) {
          var p = points[i];
          var latLng = new google.maps.LatLng(p.lat, p.lng);
          var marker = new google.maps.Marker({
            position: latLng,
            title: p.name,
            map: targetMap,
          });
          ViewModel.markers.push(marker);
          bounds.extend(latLng);
          var closure = (function () {
            var local = p;
            return function(){
              console.log('io');
              ViewModel.currentItem(local);
              fetch( "http://api.duckduckgo.com/?format=json&q="+p.name )
                .then( function( res ){ res.json(); })
                .then( function( res ){ return res.json(); })
                .then( function( json ){ return ViewModel.fetcher.duckDuckGo.success(json); })
                .catch( function( json ){ ViewModel.fetcher.duckDuckGo.fail(); })
              };
          })();
          marker.addListener('click', closure);
        }
        map.fitBounds(bounds);
    },
    // Redraw the whole map with the new neighborhood
    updateNeighborhood: function () {
        if (!ViewModel.neighborhood.address() in Model) {
            Model[ViewModel.neighborhood.address()] = {places: {items: []}, events: {items: []}};
        }
        map.setCenter(ViewModel.neighborhood);
        ajax.json(ViewModel.fetcher.geocode.url + ViewModel.neighborhood.address(), ViewModel.fetcher.geocode.success, ViewModel.fetcher.geocode.fail);
    }
};


ko.applyBindings(ViewModel);
