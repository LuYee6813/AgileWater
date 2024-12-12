export interface WaterDispenserParams {
  offset?: number;
  limit?: number;
  lat: number;
  lng: number;
  radius?: number;
  iced?: boolean;
  cold?: boolean;
  warm?: boolean;
  hot?: boolean;
  name?: string;
  sort?: string;
}

interface Location {
  lng: number;
  lat: number;
}

interface Review {
  sn: number;
  username: string;
  cmntImg?: string; // optional
  star: number;
  content: string;
  time: string; // ISO 8601 format
  stolen: boolean;
}

export interface WaterDispenserResponse {
  sn: number;
  type: string;
  location: Location;
  name: string;
  addr?: string; // optional
  iced: boolean;
  cold: boolean;
  warm: boolean;
  hot: boolean;
  openingHours?: string; // optional
  description: string;
  rate: number;
  photos: string[]; // array of image URLs
  path: string; // additional resource path
  reviews: Review[];
  distance?: number; // optional, only present when lat/lng are provided
}

export interface UserData {
  username: string;
  nickname: string;
  admin: boolean;
}
