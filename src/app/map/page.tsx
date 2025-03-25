"use client";

import { POIMarker } from "@/types/marker";
import { useEffect, useState } from "react";

export default function Page() {
    
    /** Markers visible on the map */
    const [poiMarkers, setPoiMarkers] = useState<POIMarker[]>([]);

    // Load markers during component load
    useEffect(() => {
        const fetchData = async () => {
        const ms = await getMarkers();
        console.info(ms);
        setPoiMarkers(ms);
        }
        fetchData();
    }, [])

    return (
      <>
        Map View
        <div id="map"></div>
      </>
    );

}

async function getMarkers(): Promise<POIMarker[]> {

  return Promise.resolve<POIMarker[]>([
    {
      id: "aaa",
      location_lat: 23.777,
      location_long: 61.4999,
      description: "sada",
      created_by: 1,
      created_at: new Date(), 
      updated_at:  new Date(), 
    }
  ]);

}