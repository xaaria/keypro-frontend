"use client";

import { POIMarker, POIMarkerUnmanaged } from "@/types/marker";
import { useEffect, useRef, useState } from "react";
import L, { LatLngExpression } from "leaflet";
import { v4 as uuidv4 } from 'uuid';

type Props = {
    markers: POIMarker[],
}

type OptionsWithPOI = L.MarkerOptions & { poi: POIMarkerUnmanaged };

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
    const [activeMarkerPOI, setActiveMarkerPOI] = useState<POIMarkerUnmanaged | null>(null);

    // Form fields
    const [markerDesc, setMarkerDesc] = useState<string>("");

    // Array of markers IDs not yet stored to back end
    const [unsavedMarkers, setUnsavedMarkers] = useState<string[]>([]);

    useEffect(() => {
        if(activeMarker) {
            const poi = (activeMarker?.options as any).poi;
            console.info(poi)
            setActiveMarkerPOI(poi);
        }
    }, [activeMarker])

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

            // On click: create a new Marker if no editing in progress
            mapRef.current.addEventListener('click', (e: L.LeafletMouseEvent) => {
                console.info(e.latlng)
                e.originalEvent.preventDefault();
                // Do no add new marker if we are still in editing mode
                console.info( activeMarker === null )
                if(activeMarker === null) {
                    const newMarker: L.Marker = getNewMarker(e.latlng);
                    markerGroupRef?.current?.addLayer(newMarker);
                    setActiveMarker(newMarker);
                }
            })


        }
    }, []);

    useEffect(() => {
        console.info("props", markers);
        markers.map(m => addMarker(m));
    }, [markers])

    function addMarker(poi: POIMarker) {

        const m = new L.Marker([poi.location_lat, poi.location_long], {
            poi: poi,
            bubblingMouseEvents: false,
        } as OptionsWithPOI)

        m.addEventListener('click', (e) => {
            e.originalEvent.preventDefault();
            if(activeMarker === null) {
                setActiveMarker(m);
            }
        });

        markerGroupRef.current?.addLayer(m);
    }

    function getNewMarker(location: L.LatLng): L.Marker {

        const id = uuidv4();
        setUnsavedMarkers([...unsavedMarkers, id]);

        // Create marker and add custom property poi with our data
        const m = new L.Marker(location, {
            poi: {
                id,
                location_lat: location.lat,
                location_long: location.lng,
                description: "",
                created_by: 1, // TODO: get real id 
            },
            bubblingMouseEvents: false,
        } as OptionsWithPOI);

        m.addEventListener('click', (e) => {
            e.originalEvent.preventDefault();
            console.info("Marker clicked!", e, "active", activeMarker);
            // DOES NOT WORK????
            if(activeMarker === null) {
                setActiveMarker(m);
            }
        });
        return m;
    }

    /** save or update? */
    async function saveMarker() {

        if(activeMarker) {

            // TODO: use real data
            const poi = (activeMarker.options as { poi: any }).poi;
            // Overwrite object values with new ones
            const poiWithFormValues = {...poi, description: markerDesc }
            const body: string = JSON.stringify(poiWithFormValues);
            
            const resp = await fetch(`http://localhost:8000/api/pois`, {
                method: 'POST', // TODO: add support for PUT,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token 3ff8616716573b8ba3cbf1c56dae47b091d83c64`,
                },
                body
            });
            
            if(resp.ok) {
                const id = (await resp.json()).id;
                alert(`Marker was saved successfully! ID ${id}`);
            } else {
                alert('fail!')
            }
        
            setActiveMarker(null);
        }

    }

    /** Performs DELETE request */
    async function deleteMarker(id: POIMarker['id']) {
        await fetch(`http://localhost:8000/api/pois/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token 3ff8616716573b8ba3cbf1c56dae47b091d83c64`,
            },
        })
    }

    function isOwnMarker(created_by: POIMarker['created_by']): boolean {
        const auth_id = 1; // TODO:
        return auth_id && created_by === auth_id;
    } 


    return (
        <>
            <div id="map" ref={mapDivRef} style={{ border: '1px solid blue', height: '500px' }}></div>

            { activeMarker && (
                <>
                    { isOwnMarker(activeMarkerPOI?.created_by) ? (

                        <div id="markerEdit">
                            <h3>Edit marker [#{activeMarkerPOI?.id}]</h3>
                            ({ activeMarker?.getLatLng().lat }, { activeMarker?.getLatLng().lng })
                            <div>
                                <div><label htmlFor="markerDesc">Description</label></div>
                                <div>
                                    <textarea 
                                    onChange={(e)=> setMarkerDesc(e.target.value)}
                                    defaultValue={markerDesc}
                                    name="markerDesc" maxLength={5000} required placeholder="...">
                                    </textarea>
                                </div>
                            </div>
                            <div>
                            <button onClick={(e) => saveMarker()}>Save</button>
                            { 
                                !(unsavedMarkers.includes(activeMarkerPOI!.id)) && (
                                    <button onClick={(e) => {deleteMarker(activeMarkerPOI!.id)} } className="danger">Remove</button>
                                )
                            }
                            </div>
                        </div>
                    ) : (<h3>Cant' edit: This marker is owned by user #{activeMarkerPOI?.created_by}</h3>) }
                </>
            )}
        </>
    );

}