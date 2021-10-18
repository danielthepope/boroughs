/**
 * Converts the london_boroughs.geojson into an encoded version, saving a lot of data!
 */
function encodeBoroughs() {

    let boroughs = [];

    fetch('/data/london_boroughs.geojson')
        .then(r => r.json())
        .then(data => data.features.forEach(borough => {
            const name = borough.properties.name;
            const coordinates = borough.geometry.coordinates[0].map(p => [p[1], p[0]]);

            const region = L.polygon(coordinates, {
                color: 'black',
                fillColor: '#000',
                fillOpacity: 0
            });
            region.bindPopup(name);
            region.addTo(mymap);
            const line = L.polyline(coordinates).encodePath();
            boroughs.push({
                name: name,
                region: line
            })
        }))
        .then(() => console.log(boroughs));
}
