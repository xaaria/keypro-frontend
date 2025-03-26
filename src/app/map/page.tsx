"use client";

import { POIMarker } from "@/types/marker";
import { useEffect, useState } from "react";
import LeafletMap from "../components/LeafletMap";
import { PaginatedResp } from "@/types/http";

export default function Page() {
    
    /** Markers visible on the map */
    const [poiMarkers, setPoiMarkers] = useState<POIMarker[]>([]);

    // Load markers during component load
    useEffect(() => {
        const fetchData = async () => {
          const resp = await getMarkers();
          if(resp.ok) {
            const json: PaginatedResp<POIMarker> = await resp.json();
            setPoiMarkers(json.results);
          }
          // TODO: handle errors?
        }
        fetchData();
    }, [])

    return (
      <>
        <h1>Map View</h1>
        <LeafletMap markers={poiMarkers} />
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