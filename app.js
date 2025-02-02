require('dotenv').config()
const axios = require('axios').default;

const express = require('express')
const app = express()
const port = 3000

async function getStreets(start, end) {
    let roads = {};
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
                console.log(response.data); // Log the response to debug
                if (response.data && response.data.streetSegment) {
                    // Ensure streetSegment is an array
                    const segments = Array.isArray(response.data.streetSegment) ? response.data.streetSegment : [response.data.streetSegment];
                    segments.forEach(segment => {
                        if (segment && segment.name && !roads[segment.name]) {
                            const temporary = segment.line.split(',')[0];
                            roads[segment.name] = {
                                latitude: parseFloat(temporary.split(' ')[0]),
                                longitude: parseFloat(temporary.split(' ')[1])
                            };
                        }
                    });
                }
            }).catch(error => {
                console.error('Error fetching street data:', error);
            })
        );
    }

    await Promise.all(promises);
    return Object.keys(roads).map(name => ({
        name,
        ...roads[name]
    }));
}

app.get('/', (req, res) => {
    const start = { latitude: parseFloat(req.query.start_lat), longitude: parseFloat(req.query.start_lng) };
    const end = { latitude: parseFloat(req.query.end_lat), longitude: parseFloat(req.query.end_lng) };

    getStreets(start, end).then(streets => res.send(streets)).catch(error => {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    });
});

app.listen(port, () => {
    console.log(`hotwheels listening on port ${port}`)
});

module.exports = { getStreets };