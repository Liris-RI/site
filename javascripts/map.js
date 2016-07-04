$(function() {
    var map = L.map('map').fitWorld().setZoom(2);
    L.tileLayer('http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        minZoom: 2,
        maxZoom: 18,
    }).addTo(map);
    
    var clusters = L.markerClusterGroup({
        showCoverageOnHover: false
    }).addTo(map);
    
    var countries = {};
    
    function loadCountries(type) {
        $.get('data/countries.csv', {}, function(text) {
            var lines = text.split("\n");
            for (i in lines) {
                var line = lines[i];
                var fields = line.split(",");
                countries[fields[0]] = {
                    lat: parseFloat(fields[1]),
                    lng: parseFloat(fields[2]),
                    name: fields[3]
                };
            }
            loadMarkers(type);
        }, 'text');
    }
    
    function loadMarkers(type) {
        $.get('data/' + type + '.csv', {}, function(text) {
            clusters.clearLayers();
            var lines = text.split("\n");
            for (var i in lines) {
                var line = lines[i];
                var fields = line.split(",");
                
                if ('mobility' === type) {
                    if (fields.length != 3) {
                        console.error('Invalid line: ' + line);
                    } else if (!countries[fields[2]]) {
                        console.error('Unknown country ' + fields[2]);
                    } else {
                      var country = countries[fields[2]];
                      var content = '<b>Direction:</b> ' + (fields[1] === 'IN' ? 'incoming' : 'outgoing') + '<br><b>Team:</b> ' + fields[0];
                      clusters.addLayer(L.marker([country.lat, country.lng]).bindPopup(content));
                    }
                } else if ('publications' === type) {
                    for (i in fields) {
                      var field = fields[i].trim().toUpperCase();
                      if (field != "" && field != "FR" && field in countries) {
                          var country = countries[field];
                          clusters.addLayer(L.marker([country.lat, country.lng]));
                      }
                    }
                } else if ('collaborations' === type) {
                    if (fields.length != 2) {
                        console.error('Invalid line: ' + line);
                    } else if (!countries[fields[1]]) {
                        console.error('Unknown country ' + fields[1]);
                    } else {
                      var country = countries[fields[1]];
                      var content = '<b>Team :</b> ' + fields[0];
                      clusters.addLayer(L.marker([country.lat, country.lng]).bindPopup(content));
                    }
                }
            }
        }, 'text');
    }
    
    function onShowMap(e) {
        e.preventDefault();
        $('.show-map').removeClass('activelink');
        $(e.target).addClass('activelink');
    }
    
    loadCountries('mobility');
    
    $('#show-mobility-map').click(function(e) {
        onShowMap(e);
        loadMarkers('mobility');
    });
    $('#show-collaborations-map').click(function(e) {
        onShowMap(e);
        loadMarkers('collaborations');
    });
    $('#show-publications-map').click(function(e) {
        onShowMap(e);
        loadMarkers('publications');
    });
});