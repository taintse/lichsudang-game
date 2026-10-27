import { project } from './vietnam';

/** Answer coordinates for the host only. Do not import this file from player UI. */
export const PLACE_IDS = ['pacBo', 'tanTrao', 'baDinh', 'hue', 'saiGon', 'dienBien'] as const;
export type PlaceId = (typeof PLACE_IDS)[number];

export const PLACES: Record<PlaceId, { lat: number; lng: number; name: string }> = {
  pacBo: { lat: 22.94, lng: 106.06, name: 'Pác Bó' },
  tanTrao: { lat: 21.678, lng: 105.392, name: 'Tân Trào' },
  baDinh: { lat: 21.037, lng: 105.835, name: 'Ba Đình' },
  hue: { lat: 16.47, lng: 107.58, name: 'Huế' },
  saiGon: { lat: 10.777, lng: 106.701, name: 'Sài Gòn' },
  dienBien: { lat: 21.386, lng: 103.023, name: 'Điện Biên Phủ' },
};

export function placePoint(id: PlaceId): { x: number; y: number; name: string } {
  const p = PLACES[id];
  const xy = project(p.lat, p.lng);
  return { x: xy.x, y: xy.y, name: p.name };
}
