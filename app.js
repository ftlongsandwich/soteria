require('dotenv').config()
const axios = require('axios').default;

const express = require('express')
const app = express()
const port = 3000









app.get('/', (req, res) => {
    start = {latitude: parseFloat(req.query.start_lat), longitude: parseFloat(req.query.start_lng)};
    end = {latitude: parseFloat(req.query.end_lat), longitude: parseFloat(req.query.end_lng)};

    console.log(start)
    console.log(end)


    var distance = Math.sqrt((start.latitude-end.latitude)**2+(start.longitude-end.longitude)**2)
    if (start.latitude > end.latitude) {var temp = start.latitude; start.latitude = end.latitude; end.latitude = temp}
    if (start.longitude > end.longitude) {var temp = start.longitude; start.longitude = end.longitude; end.longitude = temp}


    var roads = {};
    var regions = [];
    var promises = [];
    console.log(distance)
    console.log(process.env.GEONAMES_USERNAME)
    for (var i = 0;i < distance; i+=0.013) {
      // console.log(start.latitude+(i*Math.sqrt(1-((end.longitude-start.longitude)/distance)**2)));
      params = {
        lat: start.latitude+(i*Math.sqrt(1-((end.longitude-start.longitude)/distance)**2)),
        lng: start.longitude+(i*Math.sqrt(1-((end.latitude-start.latitude)/distance)**2)),
        username: process.env.GEONAMES_USERNAME
      }
      url = "http://api.geonames.org/findNearbyStreetsJSON?lat=" + params.lat + "&lng=" + params.lng + "&username=" + params.username
      console.log(url)
      promises.push(
        axios({
          method: "get",
          url: url,
        }).then((response) => {
          if (response.data.streetSegment != null && response.data.streetSegment != undefined) {
            for (var j = 0; j < response.data.streetSegment.length; j++) {
              exists = false;
              if (regions.indexOf(response.data.streetSegment[j].placename) == -1) {
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
        })
      )
    }

    Promise.all(promises).then(() => res.send({regions: regions, roads: roads}));









})





app.listen(port, () => {
  console.log(`hotwheels listening on port ${port}`)
})