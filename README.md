# udacity-neighborhood


The goal is to build a interactive application that should display my neighborhood and provide filters for the user to
 select the points he is interested in seeing.
 
Using Knockout.js is a requirement.

## Installation

This project should be able to run directly from a folder. Download it, unpack it, and open the index.html file with a browser.

## Flow
The aplication first build a google maps object with a center in lat 0, lng 0.

Then, it checks the neighborhood variable within ViewModel and sets its latlong to be the center of the map.

Finally, it renders every point given by getPoints(query.)

## Model
### There is no persistance

Data is stored in an Object. Queries made to that object must observe a proto-querying language, as follows:

## Proto query language

To keep this project simple I avoided using server side persistence. To query the data a proto-query language was
devised that should be both easy to implement in this small scale and very easy to use.

Here it is:

1. Each query must be an Object.
1. The keys for the first level of this object must be the type of points to fetch.
    1. There are two possible types: events and places
    1. If the value of query.events is truthy events will be returned
1. If the value of query.events is an object
    1. The properties name and description will be interpreted as a regex filter
        1. if query.events.name is "Feira", only events with names matching "Feira" will be returned.
            1. this will have no effects on the other type, that is query.events do not affect query.places.
    1. The property category will be interpreted as an exact match filter
        1. if query.places.name is 'fun', only places with the exact category 'fun' will be ruturned.
1. Multiple values for the same type are ANDED together        

### Examples:

- <code>{events: 1}</code> should return all events
- <code>{places: 1}</code> should return all places
- <code>{events: {name: 'Feira'}}</code> should return all events with names matching Feira
- <code>{events: {name: 'Feira', description: 'nice'}}</code> should return all events with names matching Feira AND
 descriptions matching nice.1
