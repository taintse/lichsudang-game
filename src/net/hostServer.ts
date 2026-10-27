import Peer, { type DataConnection } from 'peerjs';
import type { GameRoom } from '../game/room';
import { makeCode, peerIdFromCode } from '../game/id';
import type { ClientMessage, ServerMessage } from '../game/types';

const ICE: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }],
};

export type NetStatus = 'connecting' | 'open' | 'error';

export interface NetNotice {
  status: NetStatus;
  error?: string;
  unavailable?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function parseClient(raw: unknown): ClientMessage | null {
  if (!isRecord(raw) || typeof raw.t !== 'string') return null;
  const playerId = typeof raw.playerId === 'string' ? raw.playerId.slice(0, 48) : '';
  if (!playerId) return null;
  if (raw.t === 'join' && typeof raw.name === 'string' && typeof raw.avatar === 'string') {
    return { t: 'join', playerId, name: raw.name.slice(0, 40), avatar: raw.avatar.slice(0, 24) };
  }
  if (raw.t === 'timeline' && Array.isArray(raw.order)) {
    const order = raw.order.filter((id): id is string => typeof id === 'string').slice(0, 8).map((id) => id.slice(0, 16));
    return { t: 'timeline', playerId, order };
  }
  if (raw.t === 'map' && typeof raw.x === 'number' && typeof raw.y === 'number' && Number.isFinite(raw.x) && Number.isFinite(raw.y)) {
    return { t: 'map', playerId, x: raw.x, y: raw.y };
  }
  if (raw.t === 'clue' && typeof raw.text === 'string') {
    return { t: 'clue', playerId, text: raw.text.slice(0, 80) };
  }
  if (raw.t === 'match' && typeof raw.leftId === 'string' && typeof raw.rightId === 'string') {
    return { t: 'match', playerId, leftId: raw.leftId.slice(0, 16), rightId: raw.rightId.slice(0, 16) };
  }
  if (raw.t === 'bet' && typeof raw.wagerPct === 'number' && typeof raw.optionId === 'string') {
    return { t: 'bet', playerId, wagerPct: raw.wagerPct, optionId: raw.optionId.slice(0, 16) };
  }
  return null;
}

export class HostServer {
  private peer: Peer | null = null;
  private conns = new Map<string, DataConnection>();
  private timer: number | null = null;
  private heartbeat: number | null = null;
  private destroyed = false;
  code = '';

  constructor(
    private room: GameRoom,
    private onChange: (notice: NetNotice) => void,
  ) {}

  start(code = makeCode()) {
    this.stopPeer();
    this.code = code;
    this.onChange({ status: 'connecting' });
    const peer = new Peer(peerIdFromCode(code), { config: ICE, debug: 0 });
    this.peer = peer;
    peer.on('open', () => {
      if (this.destroyed || this.peer !== peer) return;
      this.onChange({ status: 'open' });
      this.armHeartbeat();
    });
    peer.on('connection', (conn) => this.bind(conn));
    peer.on('disconnected', () => {
      if (this.destroyed || this.peer !== peer) return;
      this.onChange({ status: 'connecting', error: 'Mất kết nối phòng. Đang nối lại…' });
      if (!peer.destroyed) peer.reconnect();
    });
    peer.on('error', (err) => {
      if (this.destroyed || this.peer !== peer) return;
      const type = (err as { type?: string }).type ?? '';
      if (type === 'unavailable-id') {
        this.onChange({ status: 'connecting', unavailable: true, error: 'Mã phòng đang bận, đang thử lại…' });
        return;
      }
      if (type === 'network' || type === 'server-error' || type === 'socket-error' || type === 'socket-closed' || type === 'disconnected') {
        this.onChange({ status: 'connecting', error: 'Đang nối lại máy chủ phòng…' });
        return;
      }
      this.onChange({ status: 'error', error: 'Không mở được phòng. Hãy kiểm tra mạng rồi thử lại.' });
    });
  }

  kick(playerId: string) {
    this.room.kick(playerId);
    const conn = this.conns.get(playerId);
    if (conn) {
      this.send(conn, { t: 'kicked', reason: 'Bạn đã bị mời ra khỏi phòng.' });
      this.conns.delete(playerId);
      conn.close();
    }
    this.queue(true);
  }

  broadcastNow() {
    this.queue(true);
  }

  destroy() {
    this.destroyed = true;
    if (this.timer) window.clearTimeout(this.timer);
    if (this.heartbeat) window.clearInterval(this.heartbeat);
    this.stopPeer();
  }

  private stopPeer() {
    if (this.heartbeat) window.clearInterval(this.heartbeat);
    this.heartbeat = null;
    const peer = this.peer;
    this.peer = null;
    this.conns.clear();
    if (peer && !peer.destroyed) peer.destroy();
  }

  private armHeartbeat() {
    if (this.heartbeat) window.clearInterval(this.heartbeat);
    this.heartbeat = window.setInterval(() => this.queue(true), 2000);
  }

  private bind(conn: DataConnection) {
    let playerId: string | null = null;
    conn.on('data', (raw) => {
      const message = parseClient(raw);
      if (!message) return;
      if (playerId && message.playerId !== playerId) return;
      if (message.t === 'join') {
        const previous = this.conns.get(message.playerId);
        if (previous && previous !== conn) previous.close();
        playerId = message.playerId;
        this.conns.set(playerId, conn);
      }
      const result = this.room.handleClient(message);
      if (result.kick) {
        this.send(conn, { t: 'kicked', reason: result.error ?? 'Bạn đã bị mời ra khỏi phòng.' });
        if (playerId) this.conns.delete(playerId);
        conn.close();
        this.queue(true);
        return;
      }
      if (result.error) this.send(conn, { t: 'error', message: result.error });
      if (result.broadcast) this.queue(false);
      else if (result.personal && playerId) this.sendPersonal(playerId);
    });
    conn.on('close', () => {
      if (playerId && this.conns.get(playerId) === conn) {
        this.conns.delete(playerId);
        this.room.disconnect(playerId);
        this.queue(true);
      }
    });
    conn.on('error', () => {
      /* close handler follows */
    });
  }

  private sendPersonal(playerId: string) {
    const conn = this.conns.get(playerId);
    const you = this.room.youState(playerId);
    if (!conn || !you) return;
    const message: ServerMessage = { t: 'state', public: this.room.publicState(), you };
    this.send(conn, message);
  }

  private queue(immediate: boolean) {
    if (immediate) {
      if (this.timer) window.clearTimeout(this.timer);
      this.timer = null;
      this.flush();
      return;
    }
    if (this.timer) return;
    this.timer = window.setTimeout(() => {
      this.timer = null;
      this.flush();
    }, 80);
  }

  private flush() {
    const pub = this.room.publicState();
    for (const [playerId, conn] of this.conns) {
      const you = this.room.youState(playerId);
      if (!you) continue;
      this.send(conn, { t: 'state', public: pub, you });
    }
  }

  private send(conn: DataConnection, message: ServerMessage) {
    if (!conn.open) return;
    try {
      conn.send(JSON.parse(JSON.stringify(message)) as ServerMessage);
    } catch {
      /* connection is already closing */
    }
  }
}
