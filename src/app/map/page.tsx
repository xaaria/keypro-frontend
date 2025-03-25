"use client";

import { POIMarker } from "@/types/marker";
import { useEffect, useState } from "react";
import LeafletMap from "../components/LeafletMap";

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
        <LeafletMap markers={poiMarkers} />
      </>
    );

}

async function getMarkers(): Promise<POIMarker[]> {

  return Promise.resolve<POIMarker[]>([
    {
      id: "aaa",
      location_lat: 60.166245, 
      location_long: 24.901596,
      description: "sada",
      created_by: 1,
      created_at: new Date(), 
      updated_at:  new Date(), 
    }
  ]);

}