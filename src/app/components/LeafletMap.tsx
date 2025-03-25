"use client";

import { POIMarker } from "@/types/marker";
import { useEffect, useRef, useState } from "react";
import L, { LatLngExpression } from "leaflet";

type Props = {
    markers: POIMarker[],
}

/**
 * LeafletMap Component (since Map is JS reserved word)
 * 
 * Receives marker data from props
 */
export default function LeafletMap({ markers }: Props) {

    const defaultCoordinates: LatLngExpression = [60.166245, 24.901596];

    const mapRef = useRef<L.Map | null>(null);

    const [markerGroup, setMarkerGroup] = useState<L.LayerGroup | null>(null);

    const mapDivRef = useRef<HTMLDivElement>(null);

    useEffect( () => {

        if (mapDivRef.current !== null && mapRef.current == null) {
            console.info(mapDivRef.current)
            
            // Init map
            mapRef.current = L.map(mapDivRef.current, {
                // ...
            }).setView(defaultCoordinates, 13);

            // Add markers here!
            setMarkerGroup( L.layerGroup() );
            markerGroup?.addTo(mapRef.current);

            // Add default layer
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(mapRef.current);


            mapRef.current.addEventListener('click', (e: L.LeafletMouseEvent) => {
                console.info(e.latlng)
            })


        }
    }, []);

    useEffect(() => {
        console.info("props", markers);
        markers.map(m => addMarker(m));
    }, [markers])

    function addMarker(m: POIMarker) {
        // mapRef.current.has
        // mapRef.current?.addLayer( new L.Marker([m.location_lat, m.location_long]));
    }

    return (
        <>
            <div id="map" ref={mapDivRef} style={{ border: '1px solid blue', height: '500px' }}></div>
        </>
    );

}