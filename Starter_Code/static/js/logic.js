// URL for earthquake data
const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
 
// Create base layers
const street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
 
const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.opentopomap.org/copyright">OpenTopoMap</a> contributors'
});
 
// Create baseMaps object
const baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
};
 
// Initialize map
let map = L.map("map", {
    center: [37.09, -95.71],
    zoom: 3,
    layers: [street]
});
 
// Function to determine marker color based on depth
function getColor(depth) {
    if (depth > 90) return '#FF0000';  // Red
    if (depth > 70) return '#FF6B00';  // Orange-Red
    if (depth > 50) return '#FFB400';  // Orange
    if (depth > 30) return '#FFE000';  // Yellow
    if (depth > 10) return '#B6FF00';  // Light Green
    return '#4FFF00';                  // Green
}
 
// Create legend
function createLegend() {
    let legend = L.control({ position: "bottomright" });
 
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        let depths = [-10, 10, 30, 50, 70, 90];
        let labels = [];
 
        div.innerHTML = '<h4>Depth (km)</h4>';
 
        // Create legend items
        for (let i = 0; i < depths.length; i++) {
            labels.push(
                '<li>' +
                '<span class="color-box" style="background:' + getColor(depths[i] + 1) + '"></span>' +
                depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] : '+') + ' km' +
                '</li>'
            );
        }
 
        div.innerHTML += '<ul>' + labels.join('') + '</ul>';
        return div;
    };
 
    legend.addTo(map);
}
 
// Create earthquake layer
function createFeatures(earthquakeData) {
    // Create a layer group for earthquakes
    let earthquakes = L.layerGroup();
 
    // Loop through earthquake data
    earthquakeData.forEach(feature => {
        let coordinates = feature.geometry.coordinates;
        let magnitude = feature.properties.mag;
        let depth = coordinates[2];
 
        // Create circle marker
        let circle = L.circle([coordinates[1], coordinates[0]], {
            fillOpacity: 0.75,
            color: getColor(depth),
            fillColor: getColor(depth),
            radius: magnitude * 20000
        }).bindPopup(`
            <h3>${feature.properties.place}</h3>
            <hr>
            <p>Magnitude: ${magnitude}</p>
            <p>Depth: ${depth} km</p>
            <p>Coordinates: [${coordinates[1].toFixed(2)}, ${coordinates[0].toFixed(2)}]</p>
        `);
 
        earthquakes.addLayer(circle);
    });
 
    // Add earthquake layer to map
    earthquakes.addTo(map);
 
    // Create overlay maps object
    let overlayMaps = {
        "Earthquakes": earthquakes
    };
 
    // Add layer control
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map);
}
 
// Fetch and process data
d3.json(url).then(function(data) {
    createLegend();
    createFeatures(data.features);
}).catch(function(error) {
    console.error("Error loading the earthquake data:", error);
});