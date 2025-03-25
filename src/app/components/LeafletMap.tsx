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

    const markerGroupRef = useRef<L.LayerGroup>(null);

    const mapDivRef = useRef<HTMLDivElement>(null);

    const [activeMarker, setActiveMarker] = useState<L.Marker | null>(null);

    useEffect( () => {

        if (mapDivRef.current !== null && mapRef.current == null) {
            console.info(mapDivRef.current)
            
            // Init map
            mapRef.current = L.map(mapDivRef.current, {
                // ...
            }).setView(defaultCoordinates, 13);

            
            // Add default layer
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(mapRef.current);
            
            // Add markers here!
            const mg = L.layerGroup();
            markerGroupRef.current = mg;
            markerGroupRef.current?.addTo(mapRef.current);

            mapRef.current.addEventListener('click', (e: L.LeafletMouseEvent) => {
                console.info(e.latlng)
                markerGroupRef.current?.addLayer(getNewMarker(e.latlng));
            })


        }
    }, []);

    useEffect(() => {
        console.info("props", markers);
        markers.map(m => addMarker(m));
    }, [markers])

    function addMarker(m: POIMarker) {
        markerGroupRef.current?.addLayer( new L.Marker([m.location_lat, m.location_long]));
    }

    function getNewMarker(location: L.LatLng): L.Marker {
        const m = new L.Marker(location);
        m.addEventListener('click', (e) => {
            console.info("clicked!", e);
        });
        setActiveMarker(m);
        return m;
    }

    return (
        <>
            <div id="map" ref={mapDivRef} style={{ border: '1px solid blue', height: '500px' }}></div>

            { activeMarker && (
                <div id="markerEdit">
                    <h3>Edit marker</h3>
                    ({ activeMarker.getLatLng().lat }, { activeMarker.getLatLng().lng })

                    <label htmlFor="markerDesc">Description</label>
                    <input name="markerDesc" type="text" maxLength={5000} />

                    <button onClick={(e) => {} }>Save</button>
                </div>
            )}
        </>
    );

}