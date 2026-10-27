import Peer, { type DataConnection } from 'peerjs';
import { peerIdFromCode } from '../game/id';
import type { ClientMessage, ServerMessage, YouState, PublicState } from '../game/types';

const ICE: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }],
};

export type PlayerStatus = 'connecting' | 'open' | 'closed' | 'error';

interface Handlers {
  onState: (pub: PublicState, you: YouState) => void;
  onKicked: (reason: string) => void;
  onError: (message: string) => void;
  onStatus: (status: PlayerStatus, detail?: string) => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

export class PlayerClient {
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private timer: number | null = null;
  private attempt = 0;
  private stopped = false;
  private kicked = false;

  constructor(
    private code: string,
    private identity: { playerId: string; name: string; avatar: string },
    private handlers: Handlers,
  ) {}

  start() {
    this.stopped = false;
    this.connect();
  }

  send(message: Exclude<ClientMessage, { t: 'join' }>) {
    if (!this.conn?.open) {
      this.handlers.onError('Mất kết nối. Đang nối lại…');
      return;
    }
    this.conn.send({ ...message, playerId: this.identity.playerId });
  }

  stop() {
    this.stopped = true;
    if (this.timer) window.clearTimeout(this.timer);
    this.timer = null;
    this.destroyPeer();
  }

  private connect() {
    if (this.stopped || this.kicked) return;
    this.destroyPeer();
    this.handlers.onStatus('connecting');
    const peer = new Peer({ config: ICE, debug: 0 });
    this.peer = peer;
    peer.on('open', () => {
      if (this.stopped || this.peer !== peer) return;
      const conn = peer.connect(peerIdFromCode(this.code), { reliable: true, serialization: 'json' });
      this.conn = conn;
      conn.on('open', () => {
        if (this.stopped) return;
        this.attempt = 0;
        this.handlers.onStatus('open');
        conn.send({
          t: 'join',
          playerId: this.identity.playerId,
          name: this.identity.name,
          avatar: this.identity.avatar,
        });
      });
      conn.on('data', (raw) => this.onData(raw));
      conn.on('close', () => this.schedule('Mất kết nối. Đang vào lại phòng…'));
      conn.on('error', () => this.schedule('Kết nối gián đoạn. Đang thử lại…'));
    });
    peer.on('error', (err) => {
      if (this.stopped || this.peer !== peer) return;
      const type = (err as { type?: string }).type ?? '';
      if (type === 'peer-unavailable') {
        this.schedule('Chưa thấy máy chiếu. Kiểm tra mã phòng và giữ tab máy chiếu đang mở.');
        return;
      }
      this.schedule('Không nối được. Đang thử lại…');
    });
  }

  private onData(raw: unknown) {
    if (!isRecord(raw) || typeof raw.t !== 'string') return;
    const message = raw as ServerMessage;
    if (message.t === 'state' && message.public && message.you) {
      this.handlers.onState(message.public, message.you);
      return;
    }
    if (message.t === 'kicked') {
      this.kicked = true;
      this.handlers.onKicked(typeof message.reason === 'string' ? message.reason : 'Bạn đã bị mời ra khỏi phòng.');
      this.stop();
      return;
    }
    if (message.t === 'error' && typeof message.message === 'string') this.handlers.onError(message.message);
  }

  private schedule(detail: string) {
    if (this.stopped || this.kicked || this.timer) return;
    this.handlers.onStatus('connecting', detail);
    const delay = Math.min(7000, 700 * 1.5 ** this.attempt);
    this.attempt += 1;
    this.timer = window.setTimeout(() => {
      this.timer = null;
      this.connect();
    }, delay);
  }

  private destroyPeer() {
    const peer = this.peer;
    this.peer = null;
    this.conn = null;
    if (peer && !peer.destroyed) peer.destroy();
  }
}
