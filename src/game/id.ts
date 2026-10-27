const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function makeCode(): string {
  let code = '';
  for (let i = 0; i < 4; i++) code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return code;
}

export function normalizeCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 4);
}

export function peerIdFromCode(code: string): string {
  return 'lichsudang' + code.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function makePlayerId(): string {
  const a = Math.random().toString(36).slice(2, 10);
  const b = Math.random().toString(36).slice(2, 8);
  return `p${a}${b}`;
}

export function joinHash(code: string): string {
  return `#/join/${code}`;
}
