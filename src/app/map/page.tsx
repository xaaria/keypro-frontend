"use client";

import { POIMarker } from "@/types/marker";
import { useContext, useEffect, useState } from "react";
import { PaginatedResp } from "@/types/http";
import Link from "next/link";
import AuthContext from "@/AuthContext";

import dynamic from 'next/dynamic'
 
const LeafletMap = dynamic(() => import('../components/LeafletMap'), {
  loading: () => <p>Loading...</p>,
  ssr: false
})

export default function Page() {
    
    /** Markers visible on the map */
    const [poiMarkers, setPoiMarkers] = useState<POIMarker[]>([]);

    const auth = useContext(AuthContext);

    // Load markers during component load
    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
      const resp = await getMarkers();
      if(resp.ok) {
        const json: PaginatedResp<POIMarker> = await resp.json();
        setPoiMarkers(json.results);
      }
      // TODO: handle errors?
    }

    function reloadMap() {
      fetchData();
    }

    return (
      <>
        <h1>Map View</h1>
        <span onClick={()=>reloadMap()}>Reload</span><br/>
        { auth.id === undefined && (
            <Link href="/login">Want to edit map? Login</Link>
          )
        }
        <LeafletMap markers={poiMarkers} reloadMap={reloadMap} />
      </>
    );

}

async function getMarkers(): Promise<Response> {
  return fetch(`http://localhost:8000/api/pois`, {
    headers: {
      'Accept': 'application/json'
    }
  });
}
