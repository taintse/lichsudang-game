import { describe, expect, it } from 'vitest';
import { CHALLENGES } from '../data/questions';
import { placePoint, PLACES } from './places';
import { ISLAND_LABELS, MAP_LAYOUT, SEA_LABELS, project, unproject } from './vietnam';

describe('sơ đồ Biển Đông', () => {
  it('khứ hồi kinh vĩ độ', () => {
    const point = project(16.47, 107.58);
    const back = unproject(point.x, point.y);
    expect(back.lat).toBeCloseTo(16.47, 4);
    expect(back.lng).toBeCloseTo(107.58, 4);
  });

  it('Hoàng Sa và Trường Sa nằm trong khung, phía Biển Đông', () => {
    const hue = project(PLACES.hue.lat, PLACES.hue.lng);
    const saiGon = project(PLACES.saiGon.lat, PLACES.saiGon.lng);
    const hoangSa = project(16.5, 112);
    const truongSa = project(9.5, 114);
    for (const point of [hoangSa, truongSa, hue, saiGon]) {
      expect(point.x).toBeGreaterThan(48);
      expect(point.y).toBeGreaterThan(36);
      expect(point.x).toBeLessThan(MAP_LAYOUT.viewW - 36);
      expect(point.y).toBeLessThan(MAP_LAYOUT.viewH - 36);
    }
    expect(hoangSa.x).toBeGreaterThan(hue.x + 80);
    expect(truongSa.y).toBeGreaterThan(hoangSa.y + 100);
    expect(truongSa.x).toBeGreaterThan(saiGon.x + 100);
    for (const label of ISLAND_LABELS) {
      expect(label.x).toBeGreaterThan(80);
      expect(label.x).toBeLessThan(MAP_LAYOUT.viewW - 80);
      expect(label.y).toBeGreaterThan(40);
      expect(label.y).toBeLessThan(MAP_LAYOUT.viewH - 48);
    }
  });

  it('mỗi câu bản đồ có bốn mốc đủ xa để chạm', () => {
    const maps = CHALLENGES.filter((challenge) => challenge.t === 'map');
    expect(maps.length).toBeGreaterThan(0);
    for (const challenge of maps) {
      expect(challenge.options).toHaveLength(4);
      expect(new Set(challenge.options.map((option) => option.placeId)).size).toBe(4);
      expect(challenge.options.some((option) => option.id === challenge.correctId)).toBe(true);
      const points = challenge.options.map((option) => placePoint(option.placeId));
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const gap = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
          expect(gap).toBeGreaterThan(100);
        }
      }
    }
  });

  it('ghi đúng tên tiếng Việt', () => {
    expect(ISLAND_LABELS.map((label) => label.title)).toEqual(['Quần đảo Hoàng Sa', 'Quần đảo Trường Sa']);
    expect(SEA_LABELS.map((label) => label.text)).toContain('BIỂN ĐÔNG');
    const names = [...SEA_LABELS.map((label) => label.text), ...ISLAND_LABELS.map((label) => label.title)].join(' ');
    expect(names.toLowerCase()).not.toContain('south china');
  });
});
