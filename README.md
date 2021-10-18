# Boroughs
Or "Which London Borough am I in?"

Tap somewhere on the map or use your device's location.

# Datasources
- London_Boroughs.gpkg is from https://data.london.gov.uk/dataset/london_boroughs, and is free to use. Open Government Licence v3.0
- london_boroughs.geojson was converted from the GeoPackage format using https://ngageoint.github.io/geopackage-js/
- london_boroughs_encoded.json uses some Google magic because the file size is <10% of the GeoJSON data. It was converted with help from the function inside helpers.js

# References
- I made an account with MapBox. Tokens can be limited to specific URLs, and I should probably do that if I want to release this: https://account.mapbox.com/access-tokens
- Geolocation API docs https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
- I'm using Leaflet.js for the map rendering

# To do
- Search box?
