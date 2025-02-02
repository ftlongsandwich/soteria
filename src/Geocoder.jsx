import {useState} from 'react'
import { useRef, useEffect } from 'react'
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

const provider = new OpenStreetMapProvider();


async function search(query) {
    const results = await provider.search({ query: query });
}

function Geocoder(props) {
    const [address, setAddress] = useState("Venice");
    return(
        <>
        <form>
            <label>
                <input type="text" name="name" onChange={e => {setAddress(e.target.value); search(address)}} placeholder={props.name}/>
            </label>
        </form>
        </>
    )
}

export default Geocoder