"use client";

import { POIMarker } from "@/types/marker";
import { useEffect, useState } from "react";

type Props = {
    markers: POIMarker[],
}

/**
 * LeafletMap Component (since Map is JS reserved word)
 * 
 * Receives marker data from props
 */
export default function LeafletMap({ markers }: Props) {

    useEffect(() => {
        console.info("props", markers);
    }, [markers])

    return (<div id="map" style={{ border: '1px solid blue', }}>

    </div>);

}