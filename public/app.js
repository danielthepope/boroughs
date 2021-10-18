var mymap = L.map('map').setView([51.5035837, -0.1198196411], 11);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    minZoom: 10,
    id: 'danielthepope/cksngvt2heugi17pjtw3lk2xv',
    // id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZGFuaWVsdGhlcG9wZSIsImEiOiJja3NtZzY4bnMwZXQxMnFwN2ppamExdWIyIn0.iVnNGWspmUggOEuR3THlYg'
}).addTo(mymap);

let boroughs = [];

fetch('/data/london_boroughs_encoded.json')
    .then(r => r.json())
    .then(data => {
        boroughs = [];
        return data;
    })
    .then(data => data.forEach(borough => {
        const region = L.Polygon.fromEncoded(borough.region, {
            color: '#333',
            fillColor: '#000',
            fillOpacity: 0
        });
        // region.bindPopup(borough.name);
        region.addTo(mymap);
        boroughs.push({
            name: borough.name,
            region: region
        });
    }));

let locationCircle = null;
let locationMarker = null;
let navigationWatcher = null;

function trackLocation(cb) {
    if ('geolocation' in navigator && navigationWatcher === null) {
        navigationWatcher = navigator.geolocation.watchPosition(l => {
            console.log(l);

            const latLong = [l.coords.latitude, l.coords.longitude];

            cb(null, latLong, l.coords.accuracy);
        }, e => {
            cb(e);
        });
        document.getElementById('location-button').innerText = 'Stop tracking';
        document.getElementById('location-button').onclick = e => stopTrackingLocation();
        console.log('Tracking location');
    }
    return cb('Location not available');
}

function drawLocation(latLong, accuracy) {
    if (locationCircle) {
        locationCircle.removeFrom(mymap);
    }
    if (locationMarker) {
        locationMarker.removeFrom(mymap);
    }
    if (accuracy) {
        locationCircle = L.circle(latLong, {
            color: '#07f',
            fillColor: '07f',
            fillOpacity: 0.1,
            radius: accuracy
        });
        locationCircle.addTo(mymap);
        locationMarker = L.circleMarker(latLong, {
            color: '#fff',
            fillColor: '#07f',
            fillOpacity: 1
        });
    } else {
        locationMarker = L.marker(latLong);
    }
    locationMarker.addTo(mymap);
    mymap.panTo(latLong);
}

let previousBorough = null;

function updateInfo(latLong, isTracked) {
    const latLongObj = 'lat' in latLong ? latLong : { lat: latLong[0], lng: latLong[1] };
    const borough = boroughs.find(b => b.region.contains(latLongObj));
    if (previousBorough !== borough) {
        previousBorough = borough;
        const prefix = isTracked ? "You're" : 'Selection';
        document.getElementById('info').innerHTML = '';
        if (borough && borough.name) {
            document.getElementById('info').innerText = `${prefix} in ${borough.name}.`;
        } else {
            document.getElementById('info').innerText = `${prefix} outside of London`;
        }
        setTimeout(() => { mymap.invalidateSize(); mymap.panTo(latLongObj) }, 100);
    }
}

function watchLocation() {
    trackLocation((err, latLong, accuracy) => {
        if (err) console.warn(err);
        else {
            drawLocation(latLong, accuracy);
            updateInfo(latLong, true);
        }
    });
}

function stopTrackingLocation() {
    if ('geolocation' in navigator && navigationWatcher !== null) {
        navigator.geolocation.clearWatch(navigationWatcher);
        navigationWatcher = null;
        document.getElementById('location-button').innerText = 'Use device location';
        document.getElementById('location-button').onclick = e => watchLocation();
        console.log('Tracking stopped');
    }
}

function onMapClick(e) {
    console.log(e.latlng);
    stopTrackingLocation();
    drawLocation(e.latlng);
    updateInfo(e.latlng, false);
}

mymap.on('click', onMapClick);
