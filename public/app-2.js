var map = L.map('map').setView([51.5035837, -0.1198196411], 11);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    minZoom: 10,
    id: 'danielthepope/cksngvt2heugi17pjtw3lk2xv',
    // id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZGFuaWVsdGhlcG9wZSIsImEiOiJja3NtZzY4bnMwZXQxMnFwN2ppamExdWIyIn0.iVnNGWspmUggOEuR3THlYg'
}).addTo(map);

let boroughs = [];

fetch('./data/london_boroughs_encoded.json')
    .then(r => r.json())
    .then(data => {
        boroughs = [];
        return data;
    })
    .then(data => data.forEach(borough => {
        const region = L.Polygon.fromEncoded(borough.region, {
            color: '#333',
            fillColor: '#000',
            fillOpacity: 0,
            weight: 2
        });
        // region.bindPopup(borough.name);
        region.addTo(map);
        boroughs.push({
            name: borough.name,
            region: region
        });
    }));

let locationCircle = null;
let locationMarker = null;
let navigationWatcher = null;

// https://leafletjs.com/reference.html#popup-option
const popup = L.popup({
    closeButton: false,
    closeOnEscapeKey: false,
});

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
        locationCircle.removeFrom(map);
    }
    if (locationMarker) {
        locationMarker.removeFrom(map);
    }
    if (accuracy) {
        locationCircle = L.circle(latLong, {
            color: '#07f',
            fillColor: '07f',
            fillOpacity: 0.1,
            radius: accuracy
        });
        locationCircle.addTo(map);
        locationMarker = L.circleMarker(latLong, {
            color: '#fff',
            fillColor: '#07f',
            fillOpacity: 1
        });
        map.panTo(latLong);
        locationMarker.addTo(map);
    } else {
        // The popup is enough, nothing else to render here
    }
}

function getMessage(latLong, isTracked) {
    const latLongObj = 'lat' in latLong ? latLong : { lat: latLong[0], lng: latLong[1] };
    const borough = boroughs.find(b => b.region.contains(latLongObj));
    let message = '';
    if (borough && borough.name) {
        const prefix = isTracked ? "You're in" : "You've selected";
        message = `${prefix} ${borough.name}.`;
    } else {
        const prefix = isTracked ? "You're" : "Your selection is";
        message = `${prefix} outside of London.`;
    }
    return message;
}

function watchLocation() {
    trackLocation((err, latLong, accuracy) => {
        if (err) console.warn(err);
        else {
            const message = getMessage(latLong, true);
            drawLocation(latLong, accuracy);
            popup.setLatLng(latLong)
                .setContent(message)
                .openOn(map);
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
    const message = getMessage(e.latlng, false);
    drawLocation(e.latlng);
    popup.setLatLng(e.latlng)
        .setContent(message)
        .openOn(map);
}

map.on('click', onMapClick);

// Postcodes
function postcodeUpdate(e) {
    if (e.code === 'Enter') {
        document.getElementById('postcode-box').blur();
    }

    const search = e.target.value.replaceAll(' ', '').toUpperCase();
    if (search.length > 4) {
        const shard = search.substring(0,3);
        fetch(`./data/postcodes/${shard}.csv`)
            .then(r => r.text())
            .then(s => {
                const results = s.split('\n').filter(l => l.split(',')[0] == search);
                if (results.length == 1) {
                    const latlng = {
                        lat: results[0].split(',')[1],
                        lng: results[0].split(',')[2]
                    }
                    drawLocation(latlng);
                    popup.setLatLng(latlng)
                        .setContent(`${e.target.value.toUpperCase()} is in ${results[0].split(',')[3]}.`)
                        .openOn(map);
                    map.panTo(latlng);
                } else {
                    // alert('Invalid postcode');
                }
            })
            .catch(r => {
                // alert('Invalid postcode');
            })
    }
}

const postcodeBox = document.getElementById('postcode-box');
postcodeBox.onkeyup = postcodeUpdate;
