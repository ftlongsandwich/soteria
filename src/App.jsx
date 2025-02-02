import { useState } from 'react'
import './App.css'

import settings_img from './assets/settings.png'

import { useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css';

import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

const INITIAL_CENTER = [
  -80.427248,
  37.231479
]

const INITIAL_ZOOM = 26.13

function App() {
  
  const mapRef = useRef()
  const mapContainerRef = useRef()
  // console.log(import.meta.env.MAPBOX_API_KEY)
  
  const [src, setSrc] = useState([])
  const [dst, setDst] = useState([])

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
        console.log(selected.result.geometry.coordinates)
        setSrc(selected.result.geometry.coordinates)
        console.log(1)
        
      mapRef.current.addControl(new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl,
      }).on('result', (selected) => {
        console.log(selected.result.geometry.coordinates)
        setDst(selected.result.geometry.coordinates)
        console.log(2)
      })
    );
      })
    );
    
    return () => {
      mapRef.current.remove()
    }
  }, [])

  return (
    <>
      <div className="sidebar">
        <img src={settings_img} width={26} height={26} alt="settings" onClick={()=>(alert(1))} onMouseOver={() => {cursor: pointer}}/>
        {/* |  Longitude: {src[0].toFixed(4)} | Latitude: {center[1].toFixed(4)} */}
        {/* <Geocoder name="Location"/>
        <Geocoder name="Destination"/> */}
      </div>
      
      <div id='map-container' ref={mapContainerRef}/>
    </>
  )
}

export default App
