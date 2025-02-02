const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');
require('dotenv').config()
const axios = require('axios').default;


const express = require('express');
const corsOptions = require('./config/cors.config');
const app = express()
const port = 3000


app.use(helmet());
app.use(compression());
app.use(bodyParser());

app.use(cors(corsOptions));

require('dotenv').config();

async function getStreets(start, end) {
    let roads = {};
    let regions = [];
    let promises = [];

    const distance = Math.sqrt((start.latitude - end.latitude) ** 2 + (start.longitude - end.longitude) ** 2);

    for (let i = 0; i < distance; i += 0.013) {
        const params = {
            lat: start.latitude + (i * Math.sqrt(1 - ((end.longitude - start.longitude) / distance) ** 2)),
            lng: start.longitude + (i * Math.sqrt(1 - ((end.latitude - start.latitude) / distance) ** 2)),
            username: process.env.GEONAMES_USERNAME
        };

        const url = `http://api.geonames.org/findNearbyStreetsJSON?lat=${params.lat}&lng=${params.lng}&username=${params.username}`;

        promises.push(
            axios.get(url).then((response) => {
                // console.log(response.data); // Log the response to debug
                if (response.data.streetSegment != null && response.data.streetSegment != undefined) {
                    for (var j = 0; j < response.data.streetSegment.length; j++) {
                      exists = false;
                      if (regions.indexOf(response.data.streetSegment[j].placename) == -1 && response.data.streetSegment[j].placename != "") {
                        regions.push(response.data.streetSegment[j].placename);
                      }
                      for (var name in roads) { // simply iterate over the keys in the first object
                          if (Object.hasOwnProperty.call(response.data.streetSegment[j].name, name)) { // and check if the key is in the other object, too
                              exists = true;
                              break;
                          }
                      }
        
                      if (!exists) {
                        temporary = response.data.streetSegment[j].line.split(',')[0];
                        roads[response.data.streetSegment[j].name] = {latitude: parseFloat(temporary.split(' ')[0]), longitude: parseFloat(temporary.split(' ')[1])}
                      }
                    }
                }
            }).catch(error => {
                console.error('Error fetching street data:', error);
            })
        );
    }

    await Promise.all(promises);
    return [regions, Object.keys(roads).map(name => ({
        name,
        ...roads[name]
    }))];
}

app.get('/dummy', (req, res) => {
    console.log("reached")
    return [
        [-79.365, 43.795],
        [-79.355, 43.800],
        [-79.345, 43.805],
        [-79.335, 43.810],
      ]
})

app.get('/', (req, res) => {
    const start = { latitude: parseFloat(req.query.start_lat), longitude: parseFloat(req.query.start_lng) };
    const end = { latitude: parseFloat(req.query.end_lat), longitude: parseFloat(req.query.end_lng) };

    
    getStreets(start, end).then(results => {
        console.log(results);
        let streets = [];
        results[1].forEach(item => {streets.push(item.name)})
        
        axios.post('http://127.0.0.1:5000/', 
            {
                regions: results[0],
                streets: streets
            })
            .then((response) => {
            console.log(response.data);
            res.send(response.data);
        }).catch(error => {
            console.error('Error:', error);
            res.status(500).send('Internal Server Error');
        });
        
    }).catch(error => {
            console.error('Error:', error);
            res.status(500).send('Internal Server Error');
        });
});

app.listen(port, () => {
    console.log(`hotwheels listening on port ${port}`)
});

module.exports = { getStreets };