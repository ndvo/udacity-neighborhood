var initialNeighborhood = 'Taguatinga Sul Setor Primavera';
Model = {
    keyring: {
        google: {
            main: 'AIzaSyA4URcI5aWH3KTq8Fvn-PZeUJD-8mSg1l0'
        }
    },
    initialNeighborhood: initialNeighborhood,
    remove: function (type, name) {
        var items = Model[ViewModel.neighborhood.address()][type]['items'];
        console.log(items);
        for (var i = 0; i < items.length; i++) {
            if (items[i]['name'] && items[i]['name'] == name) {
                delete items[i];
                return true;
            }
        }
        return false;
    },
    add: function (type, obj) {
        Model[ViewModel.neighborhood.address()][type]['items'].push(obj);
    },
    replace: function (type, name, obj) {
        var items = Model[ViewModel.neighborhood.address()][type]['items'];
        for (var i = 0; i < items.length; i++) {
            if (items[i]['name'] && items[i]['name'] == name) {
                items[i] = obj
            }
        }
        return false;
    }
};

Model[initialNeighborhood]= {
        places: {
            meta: {},
            items: [
                {
                    name: 'Flying Kites zone',
                    description: 'A place for kids to fly kites and have fun',
                    category: 'fun',
                    lat: -15.809131,
                    lng: -48.058253,
                    type: 'places'
                },
                {
                    name: 'Futsal court', description: 'A court for playing futsal, an indoors soccer', category: 'fun',
                    lat: -15.806432, lng: -48.058767, type: 'places'
                },
                {
                    name: 'School', description: 'A public school', category: 'education',
                    lat: -15.808881, lng: -48.063317, type: 'places'
                },
                {
                    name: 'Panificadora', description: 'Bakery and convenience store', category: 'food',
                    lat: -15.810954, lng: -48.062591, type: 'places'
                }
            ]
        },
        events: {
            meta: {},
            items: [
                {
                    name: 'Feira do Bicalho',
                    description: 'A fair that each sunday sells all kind of stuff, including pastels and kites',
                    category: 'food',
                    frequency: 'weekly',
                    lat: -15.809774,
                    lng: -48.062340,
                    type: 'events'
                },
                {
                    name: 'Torneio do Bicalho',
                    description: 'Neighborhood amateur soccer championship',
                    category: 'fun',
                    frequency: 'yearly',
                    lat: -15.808779,
                    lng: -48.062944,
                    type: 'events'
                },
                {
                    name: 'Festa Junina',
                    description: 'June party (St John\'s celebration )',
                    category: 'tradition',
                    frequency: "yearly",
                    lat: -15.807674,
                    lng: -48.063276,
                    type: 'events'
                }
            ]
        }
};
