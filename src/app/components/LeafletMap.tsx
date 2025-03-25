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
    const mapDivRef = useRef<HTMLDivElement>(null);

    useEffect( () => {

        if (mapDivRef.current !== null && mapRef.current == null) {
            console.info(mapDivRef.current)
            
            // Init map
            mapRef.current = L.map(mapDivRef.current, {
                // ...
            }).setView(defaultCoordinates, 13);

            // Add default layer
            L.tileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                }
            ).addTo(mapRef.current);

        }
    }, []);

    useEffect(() => {
        console.info("props", markers);
    }, [markers])


    return (
        <div id="map" ref={mapDivRef} style={{ border: '1px solid blue', height: '500px' }}></div>
    );

}