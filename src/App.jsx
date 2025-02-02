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

const CRIMES = [
  [37.207090,-80.394835],
[37.207899, -80.394088],
[37.22494138989071,-80.44604373815481],
[37.22468376238384, -80.44610477614287],
[37.24509082022556, -80.42251223196125],
[37.24289906394921, -80.42771029148672],
[37.203047936689295, -80.40043376079916],
[37.19997434720324, -80.40999703010999],
[37.2288970791743, -80.41421208592794],
[37.24209675809583, -80.43109071846982],
[37.23194618768775, -80.41423223381491],
[37.23053547434785, -80.41470473381497],
[37.223242045952574, -80.42073469429609],
[37.22318212044118, -80.42111206265142],
[37.22699908514492, -80.41764237428966],
[37.2338365225918, -80.42038367428937],
[37.20090307009028, -80.40951646079921],
[37.22464727527925, -80.41856958080412],
[37.226396986387485, -80.42061124545351],
[37.22954776773673, -80.41520614826047],
[37.227692482722716, -80.41672714545349],
[37.22871292232948, -80.4145114914874],
[37.235987648030395, -80.41844996079779],
[37.225370516722265, -80.42159370127271],
[37.2217283246874, -80.42371795709212],
[37.219532170724705, -80.41552117351739],
[37.22308154894083, -80.41895832907315],
[37.21681048848885, -80.41676211612015],
[37.22439756312956, -80.41933621476431],
[37.22461383187835, -80.41861249148756],
[37.23037758959702, -80.41981267773596],
[37.225378358850804, -80.4385608877813],
[37.228979155178585, -80.42700613196192],
[37.2301147208848, -80.41487015894488],
[37.23156414445456, -80.42481390312562],
[37.22980498775216, -80.41849426441897],
[37.22230413528011, -80.42545053196221],
[37.23115298785922, -80.42266211661722],
]

const INITIAL_ZOOM = 26.13

function App() {
  
  const mapRef = useRef()
  const mapContainerRef = useRef()
  // console.log(import.meta.env.MAPBOX_API_KEY)
  
  const [src, setSrc] = useState(INITIAL_CENTER)
  const [dst, setDst] = useState(INITIAL_CENTER)
  const [proxies, setProxies] = useState([
    [-79.365, 43.795],
    [-79.355, 43.800]
  ])

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
      }, 'top').on('result', (selected) => {
        console.log(selected.result)
        setSrc(selected.result.geometry.coordinates)
        // setRegion(selected.result.)
        console.log(1)
        CRIMES.forEach(item => new mapboxgl.Marker().setLngLat([item[1],item[0]]).addTo(mapRef.current))
        
      mapRef.current.addControl(new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl,
      }, 'top').on('result', (selected) => {
        console.log(selected.result.geometry.coordinates)
        setDst(selected.result.geometry.coordinates)
        // drawRoute(src,proxies,dst)
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
      //   drawRoute(src, proxies, dst)
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

    axios.get('http://127.0.0.1:3000/', {
      params: {
        start_lng: src[0],
        start_lat: src[1],
        end_lng: dst[0],
        end_lat: dst[1]
      },
      crossDomain:true
    }).then((res) => {
      setProxies(res.data)
    })
    drawRoute(src, proxies, dst);
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
