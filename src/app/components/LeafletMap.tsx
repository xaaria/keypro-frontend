"use client";

import { POIMarker, POIMarkerUnmanaged } from "@/types/marker";
import { CSSProperties, useEffect, useRef, useState } from "react";
import L, { LatLngExpression, marker } from "leaflet";
import { v4 as uuidv4 } from 'uuid';
import { API_URL } from "../../../utils";
import Link from "next/link";

type Props = {
    markers: POIMarker[],
    reloadMap: Function,
}

type OptionsWithPOI = L.MarkerOptions & { poi: POIMarkerUnmanaged };

/**
 * LeafletMap Component (since Map is JS reserved word)
 * 
 * Receives marker data from props
 */
export default function LeafletMap({ markers, reloadMap }: Props) {

    const DEFAULT_COORDS: LatLngExpression = [60.166245, 24.901596];
    const DESC_MAXLEN: number = 5000;

    // Mock auth, TODO
    const [authToken, setAuthToken] = useState<string>("3ff8616716573b8ba3cbf1c56dae47b091d83c64");

    const mapDivRef = useRef<HTMLDivElement>(null);

    // The actual map reference
    const mapRef = useRef<L.Map | null>(null);

    const markerGroupRef = useRef<L.LayerGroup>(null);

    const [activeMarker, setActiveMarker] = useState<L.Marker | null>(null);
    const [activeMarkerPOI, setActiveMarkerPOI] = useState<POIMarkerUnmanaged | null>(null);

    // Form fields
    const [markerDesc, setMarkerDesc] = useState<string>("");

    // Array of markers IDs not yet stored to back end
    const [unsavedMarkers, setUnsavedMarkers] = useState<string[]>([]);

    useEffect(() => {
        if(activeMarker) {
            const poi = (activeMarker?.options as any).poi;
            setActiveMarkerPOI(poi);
        }
    }, [activeMarker])

    useEffect( () => {
        if (mapDivRef.current !== null && mapRef.current == null) {
            
            // Init map
            mapRef.current = L.map(mapDivRef.current, {
                // ...
            }).setView(DEFAULT_COORDS, 15);

            
            // Add default layer
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(mapRef.current);
            
            // Add markers here!
            const mg = L.layerGroup();
            markerGroupRef.current = mg;
            markerGroupRef.current?.addTo(mapRef.current);

            // On click: create a new Marker if no editing in progress
            mapRef.current.addEventListener('click', (e: L.LeafletMouseEvent) => {
                e.originalEvent.preventDefault();
                // Do no add new marker if we are still in editing mode
                if(activeMarker === null /* DOES NOT WORK??? */) {
                    const newMarker: L.Marker = getNewMarker(e.latlng);
                    markerGroupRef?.current?.addLayer(newMarker);
                    setActiveMarker(newMarker);
                }
            })


        }
    }, []);

    useEffect(() => {
        console.info("View updated. Got props:", markers);
        
        // Clear all and add as new ones
        markerGroupRef.current?.clearLayers();
        markers.map(m => addMarker(m));
        
        setActiveMarker(null);
        setMarkerDesc("");
    }, [markers])

    function addMarker(poi: POIMarker) {

        const m = new L.Marker([poi.location_lat, poi.location_long], {
            poi: poi,
            bubblingMouseEvents: false,
        } as OptionsWithPOI)

        m.addEventListener('click', getMarkerOnClickEvent(m));

        markerGroupRef.current?.addLayer(m);
    }

    function getNewMarker(location: L.LatLng): L.Marker {

        const id: string = uuidv4();
        setUnsavedMarkers([...unsavedMarkers, id]); // NOT WORKING???

        // Create marker and add custom property poi with our data
        const m = new L.Marker(location, {
            riseOnHover: true,
            title: "Unsaved " + id,
            opacity: 0.6,
            poi: {
                id,
                location_lat: location.lat,
                location_long: location.lng,
                description: "",
                created_by: 1, // TODO: get real id 
            },
            bubblingMouseEvents: false,
        } as OptionsWithPOI);

        m.openPopup();
        m.addEventListener('click', getMarkerOnClickEvent(m));
        return m;
    }

    function startMarkerEdit(m: L.Marker): void {
        setMarkerDesc(getPOI(m).description);
        setActiveMarker(m);
    }

    function onClickSave() {
        
        // POST
        if(unsavedMarkers.includes(activeMarkerPOI!.id)) {
            saveMarker();
        } else {
            // PATCH
            updateMarker();
        }
    }

    /**
     * Performs POST
     */
    async function saveMarker() {

        if(activeMarker) {

            // TODO: use real data
            const poi = (activeMarker.options as { poi: any }).poi;
            // Overwrite object values with new ones
            const poiWithFormValues = {...poi, description: markerDesc }
            const body: string = JSON.stringify(poiWithFormValues);
            
            const resp = await fetch(`${API_URL}/api/pois`, {
                method: 'POST', // TODO: add support for PUT,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${authToken}`,
                },
                body
            });
            
            if(resp.ok) {
                const id = (await resp.json()).id;
                reloadMap();
                alert(`Marker was saved successfully! ID ${id}`);
            } else {
                alert('fail!')
            }
        
            setActiveMarker(null);
        }

    }

    /**
     * Performs PATCH
     */
    async function updateMarker() {
        if(activeMarker) {

            // TODO: use real data
            const poi = getPOI(activeMarker);
            // Overwrite object values with new ones
            const poiWithFormValues = {...poi, description: markerDesc }
            const body: string = JSON.stringify(poiWithFormValues);
            
            const resp = await fetch(`${API_URL}/api/pois/${poi.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token 3ff8616716573b8ba3cbf1c56dae47b091d83c64`,
                },
                body
            });

            if(resp.ok) {
                alert(`Marker was updated successfully`);
                reloadMap();
            } else {
                alert('fail!')
            }

        }
    }

    function getMarkerOnClickEvent(m: L.Marker) {
        return (e: L.LeafletMouseEvent) => {
            e.originalEvent.preventDefault();
            startMarkerEdit(m);
        };
    }

    /** 
     * Performs DELETE
     * */
    async function deleteMarker(id: POIMarker['id']) {
        const resp = await fetch(`http://localhost:8000/api/pois/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${authToken}`,
            },
        });
        if(resp.ok) { reloadMap(); }
    }

    function canEdit(created_by: POIMarker['created_by']): boolean {
        const auth_id = 1; // TODO:
        return authToken.length > 0 && created_by === auth_id;
    }

    // Gets POI object assigned to a Marker
    function getPOI(m: L.Marker): POIMarkerUnmanaged | POIMarker {
        return (m.options as OptionsWithPOI)!.poi;
    }

    const markerEditStyle: CSSProperties  = {
        display: 'flex',
        flexDirection: 'column',
        gap: ".5em",
    };

    function isManagedMarker(m: Partial<POIMarker> | null): m is POIMarker {
        return (m?.created_at !== undefined);
    }

    return (
        <>
            <div id="map" ref={mapDivRef} style={{ border: '1px solid blue', height: '450px' }}></div>

            { activeMarker && (
                <>
                    { canEdit(activeMarkerPOI?.created_by) ? (

                        <div id="markerEdit" style={markerEditStyle}>
                            <hr/>
                            <h3>Edit marker [#{activeMarkerPOI?.id}]</h3>
                            <div>Location: ({ activeMarker?.getLatLng().lat }, { activeMarker?.getLatLng().lng })</div>
                            <div>{ isManagedMarker(activeMarkerPOI) && <>Created: { activeMarkerPOI.created_at }</>}</div>
                            <div>
                                <div><label htmlFor="markerDesc">Description ({ DESC_MAXLEN - markerDesc.length } / {DESC_MAXLEN})</label></div>
                                <div>
                                    <textarea 
                                        onChange={(e)=> setMarkerDesc(e.target.value)}
                                        value={markerDesc}
                                        name="markerDesc"
                                        rows={5}
                                        cols={70} 
                                        maxLength={DESC_MAXLEN} 
                                        required
                                        placeholder="...">
                                    </textarea>
                                </div>
                            </div>
                            <div id="actions" style={{ display:'flex', 'gap': '1em' }}>
                                <button onClick={(e) => onClickSave()}>Save</button>
                                { 
                                    (!unsavedMarkers.includes(activeMarkerPOI!.id)) && (
                                        <button onClick={(e) => {deleteMarker(activeMarkerPOI!.id)} } className="danger">Remove</button>
                                    )
                                }
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h2>Cant' edit. This marker is owned by user #{activeMarkerPOI?.created_by}</h2>
                            <h3>If it is yours please <Link href="/login">login</Link></h3>
                            <div>ID: {activeMarkerPOI?.id}</div>
                            <div>Description: {markerDesc}</div>
                        </div>
                    )}
                </>
            )}
        </>
    );

}