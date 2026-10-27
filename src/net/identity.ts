export interface Identity {
  playerId: string;
  name: string;
  avatar: string;
  code: string;
}

const KEY = 'lsd-identity-v1';

export function loadIdentity(): Identity | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Identity;
    if (!data.playerId || !data.name || !data.code) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveIdentity(identity: Identity) {
  localStorage.setItem(KEY, JSON.stringify(identity));
}

export function clearIdentity() {
  localStorage.removeItem(KEY);
}

const HOST_KEY = 'lsd-host-v1';

export interface HostSave {
  v: 1;
  code: string;
  at: number;
  state: unknown;
}

export function loadHostSave(): HostSave | null {
  try {
    const raw = sessionStorage.getItem(HOST_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as HostSave;
    if (data.v !== 1 || !data.code || Date.now() - data.at > 3 * 60 * 60 * 1000) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveHostSave(save: HostSave) {
  sessionStorage.setItem(HOST_KEY, JSON.stringify(save));
}

export function clearHostSave() {
  sessionStorage.removeItem(HOST_KEY);
}
