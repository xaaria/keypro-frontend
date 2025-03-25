import { UUID } from "crypto";

export type POIMarker = {
    id: UUID | string;
    location_lat: number;
    location_long: number;
    description: string;
    created_by: number;
    created_at: string | Date; // ISO Date with TZ
    updated_at: string | Date; // ISO Date with TZ
}

