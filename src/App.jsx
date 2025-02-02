import { useState } from 'react'
import './App.css'

import settings_img from './assets/settings.png'

import { useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css';

import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import axios from 'axios';

const INITIAL_CENTER = [
  -80.427248,
  37.231479
]

const DEFAULT_SRC = [-79.370209, 43.794179]; // 33 Singer Court
const DEFAULT_DST = [-79.319519, 43.809521]; // 50 Francine Drive
const DUMMY_ROADS = [
  [-79.365, 43.795],
  [-79.355, 43.800],
  [-79.345, 43.805],
  [-79.335, 43.810],
];

const INITIAL_ZOOM = 26.13

function App() {
  
  const mapRef = useRef()
  const mapContainerRef = useRef()
  // console.log(import.meta.env.MAPBOX_API_KEY)
  
  const [src, setSrc] = useState(INITIAL_CENTER)
  const [dst, setDst] = useState(INITIAL_CENTER)

  const [crim_coords, setCrimCoords] = useState([])


  const [center, setCenter] = useState(INITIAL_CENTER)
  const [zoom, setZoom] = useState(INITIAL_ZOOM)

  
  useEffect(() => {
    // mapboxgl.accessToken = import.meta.env.MAPBOX_API_KEY;
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY//change to dotenv if have time
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current
    });
    
    // const search = new MapboxGeocoder({
    //   accessToken: mapboxgl.accessToken,
    //   mapboxgl: mapboxgl
    // })

    mapRef.current.on('move', () => {

      // get the current center coordinates and zoom level from the map

      const mapCenter = mapRef.current.getCenter()

      const mapZoom = mapRef.current.getZoom()


      // update state

      setCenter([ mapCenter.lng, mapCenter.lat ])

      setZoom(mapZoom)

    })

    mapRef.current.addControl(new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl,
      }).on('result', (selected) => {
        console.log(selected.result)
        setSrc(selected.result.geometry.coordinates)
        // setRegion(selected.result.)
        console.log(1)
        
      mapRef.current.addControl(new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl,
      }).on('result', (selected) => {
        console.log(selected.result.geometry.coordinates)
        setDst(selected.result.geometry.coordinates)
        // drawRoute(src,DUMMY_ROADS,dst)
        console.log(2)
        console.log(src)
        console.log(dst)
      })
    );
      })
    );
    
    return () => {
      mapRef.current.remove()
    }
  }, [])
  useEffect(() => {
    
    const drawRoute = async (start, waypoints, end) => {
      // if (start == undefined || end == undefined) {
      //   drawRoute(src, DUMMY_ROADS, dst)
      // }
      // else {
        try {
          const waypointsStr = waypoints.map(coord => `${coord[0]},${coord[1]}`).join(';');
          const routeQuery = waypoints.length > 0
            ? `${start[0]},${start[1]};${waypointsStr};${end[0]},${end[1]}`
            : `${start[0]},${start[1]};${end[0]},${end[1]}`;
    
          const query = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${routeQuery}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`
          );
          
          if (!query.ok) {
            throw new Error(`API request failed with status ${query.status}`);
          }
    
          const json = await query.json();
          if (!json.routes || json.routes.length === 0) {
            throw new Error('No routes found');
          }
    
          const routeGeoJSON = {
            type: 'Feature',
            properties: {},
            geometry: json.routes[0].geometry,
          };
    
          if (mapRef.current.getLayer('route')) {
            mapRef.current.removeLayer('route');
          }
          if (mapRef.current.getSource('route')) {
            mapRef.current.removeSource('route');
          }
    
          mapRef.current.addSource('route', {
            type: 'geojson',
            data: routeGeoJSON,
          });
    
          mapRef.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#ff0000',
              'line-width': 6,
              'line-opacity': 0.75,
            },
          });
        } catch (error) {
          console.error('Error drawing route:', error);
        }
      // }
    };
    drawRoute(src, DUMMY_ROADS, dst);
  }, [dst]);

  return (
    <>
      <div className="sidebar">
        <img src={settings_img} width={26} height={26} alt="settings" onClick={()=>(alert(1))} onMouseOver={() => {cursor: pointer}}/>
        |  Longitude: {src[0].toFixed(4)} | Latitude: {src[1].toFixed(4)}
        |  Longitude: {dst[0].toFixed(4)} | Latitude: {dst[1].toFixed(4)}
        {/* <Geocoder name="Location"/>
        <Geocoder name="Destination"/> */}
      </div>
      
      <div id='map-container' ref={mapContainerRef}/>
    </>
  )
}

export default App
