import { UUID } from "crypto";

export type POIMarker = {
    id: UUID | string;
    location_lat: number;
    location_long: number;
    description: string;
    created_by: number | undefined;
    created_at: string | Date; // ISO Date with TZ
    updated_at: string | Date; // ISO Date with TZ
}

// Unmanaged marker is a marker without all the data back end generates
export type POIMarkerUnmanaged = Omit<POIMarker, | 'created_at' | 'updated_at'>

