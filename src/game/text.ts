const BANNED = ['dit me', 'dmm', 'dkm', 'dcm', 'vcl', 'clm', 'fuck', 'shit', 'du ma', 'clgt'];

export function foldVi(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) row[j] = j;
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[b.length];
}

export function fuzzyMatch(input: string, aliases: string[]): boolean {
  const a = foldVi(input);
  if (a.length < 2) return false;
  for (const alias of aliases) {
    const b = foldVi(alias);
    if (!b) continue;
    if (a === b) return true;
    if (Math.abs(a.length - b.length) > 2) continue;
    const limit = b.length >= 10 ? 2 : 1;
    if (levenshtein(a, b) <= limit) return true;
  }
  return false;
}

export function cleanName(raw: string): string | null {
  const name = raw.replace(/\s+/g, ' ').trim();
  if (name.length < 1 || name.length > 16) return null;
  if (!/^[\p{L}\p{N} ]+$/u.test(name)) return null;
  const folded = foldVi(name);
  if (!folded) return null;
  if (BANNED.some((word) => folded.includes(word))) return null;
  const tokens = new Set(folded.split(' '));
  if (tokens.has('dm') || tokens.has('dit') || tokens.has('loz') || tokens.has('cc')) return null;
  return name;
}

export function formatPoints(n: number): string {
  const sign = n < 0 ? '−' : '';
  const abs = Math.abs(Math.round(n));
  return sign + abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
