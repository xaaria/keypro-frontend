"use client";

import { POIMarker, POIMarkerUnmanaged } from "@/types/marker";
import { CSSProperties, useContext, useEffect, useRef, useState } from "react";
import L, { LatLngExpression } from "leaflet";
import { v4 as uuidv4 } from 'uuid';
import { API_URL } from "../../../utils";
import Link from "next/link";
import AuthContext, { AuthUser } from "@/AuthContext";

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

    const auth: AuthUser = useContext(AuthContext);

    const mapDivRef = useRef<HTMLDivElement>(null);

    // The actual map reference
    const mapRef = useRef<L.Map | null>(null);

    const markerGroupRef = useRef<L.LayerGroup>(null);

    const [activeMarker, setActiveMarker] = useState<L.Marker | null>(null);
    const [activeMarkerPOI, setActiveMarkerPOI] = useState<POIMarkerUnmanaged | null>(null);

    // Form fields
    const [markerDesc, setMarkerDesc] = useState<string>("");

    // Array of markers IDs not yet stored to back end
    const unsavedMarkers = useRef<string[]>([]);


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

        }
    }, []);


    useEffect(() => {
        if(auth.id && mapRef.current) {
            mapRef.current.addEventListener('click', (e: L.LeafletMouseEvent) => {
                e.originalEvent.preventDefault();
                // Do no add new marker if we are still in editing mode
                // ** Does not work? **
                if(activeMarker == null) {
                    const newMarker: L.Marker = getNewMarker(e.latlng);
                    markerGroupRef?.current?.addLayer(newMarker);
                    setActiveMarker(newMarker);
                }
            })
        }
    }, [auth, mapRef])

    useEffect(() => {
        console.info("View updated. Got props:", markers);
        console.info("CTX", auth)
        // Clear all and add as new ones
        markerGroupRef.current?.clearLayers();
        markers.map(m => addMarker(m));
        
        setActiveMarker(null);
        setMarkerDesc("");

    }, [markers])

    useEffect(() => {
        console.info(auth);
    }, [auth])

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
        unsavedMarkers.current = ([...unsavedMarkers.current, id]); // NOT WORKING???

        // Create marker and add custom property poi with our data
        const m = new L.Marker(location, {
            title: "Unsaved " + id,
            opacity: 0.5,
            poi: {
                id,
                location_lat: location.lat,
                location_long: location.lng,
                description: "",
                created_by: auth.id
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
        setActiveMarkerPOI(getPOI(m));
    }

    function onClickSave() {
        
        // POST
        if(unsavedMarkers.current.includes(activeMarkerPOI!.id)) {
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

            const poi = (activeMarker.options as { poi: any }).poi;
            // Overwrite object values with new ones
            const poiWithFormValues = {...poi, description: markerDesc }
            const body: string = JSON.stringify(poiWithFormValues);
            
            const resp = await fetch(`${API_URL}/api/pois`, {
                method: 'POST', // TODO: add support for PUT,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${auth?.token}`,
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

            const poi = getPOI(activeMarker);
            // Overwrite object values with new ones
            const poiWithFormValues = {...poi, description: markerDesc }
            const body: string = JSON.stringify(poiWithFormValues);
            
            const resp = await fetch(`${API_URL}/api/pois/${poi.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${auth?.token}`,
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
                'Authorization': `Token ${auth!.token}`,
            },
        });
        if(resp.ok) { reloadMap(); }
    }

    function canEdit(created_by: POIMarker['created_by']): boolean {
        return !!auth && created_by === auth.id;
    }

    // Gets POI object assigned to a Marker
    function getPOI(m: L.Marker): POIMarkerUnmanaged | POIMarker {
        return (m.options as OptionsWithPOI)!.poi;
    }

    const markerEditStyle: CSSProperties  = {
        display: 'flex',
        flexDirection: 'column',
        gap: ".5em",
        padding: '2em'
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
                            <h3>Edit marker [#{activeMarkerPOI?.id}]</h3>
                            <hr/>
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
                                    (activeMarkerPOI && !unsavedMarkers.current.includes(activeMarkerPOI!.id)) && (
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