import type { ClientMessage, PublicState, YouState } from '../game/types';
import { Relay } from './relay';
import { roomTopics } from './topics';

export type PlayerStatus = 'connecting' | 'open' | 'closed' | 'error';

export interface PlayerNet {
  status: PlayerStatus;
  detail: string;
  debug: string;
  stalled: boolean;
}

interface Handlers {
  onState: (pub: PublicState, you: YouState) => void;
  onKicked: (reason: string) => void;
  onClosed: (reason: string) => void;
  onError: (message: string) => void;
  onNet: (info: PlayerNet) => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

const PHASES = new Set(['lobby', 'intro', 'play', 'reveal', 'board', 'podium']);

function asPublic(value: unknown, code: string): PublicState | null {
  if (!isRecord(value) || value.code !== code || typeof value.phase !== 'string' || !PHASES.has(value.phase)) return null;
  if (!Array.isArray(value.players) || typeof value.rev !== 'number') return null;
  return value as unknown as PublicState;
}

function asYou(value: unknown, playerId: string): YouState | null {
  if (!isRecord(value) || value.playerId !== playerId || typeof value.name !== 'string') return null;
  return value as unknown as YouState;
}

export class PlayerClient {
  private relay: Relay | null = null;
  private topics = roomTopics('xxxx');
  private stopped = false;
  private kicked = false;
  private pub: PublicState | null = null;
  private you: YouState | null = null;
  private lastRev = -1;
  private stall: number | null = null;
  private joinLoop: number | null = null;
  private msgSeq = 0;

  constructor(
    private code: string,
    private identity: { playerId: string; name: string; avatar: string },
    private handlers: Handlers,
  ) {
    this.topics = roomTopics(code);
  }

  start() {
    this.stopRelay();
    this.stopped = false;
    this.kicked = false;
    this.pub = null;
    this.you = null;
    this.lastRev = -1;
    this.report('connecting', 'Đang nối vào máy chiếu…', 'Đang mở kênh mạng…', false);
    const relay = new Relay(() => this.onRelay());
    this.relay = relay;
    relay.start((topic, payload) => this.onWire(topic, payload));
    relay.subscribe(this.topics.all);
    relay.subscribe(this.topics.you(this.identity.playerId));
    this.stall = window.setTimeout(() => {
      if (this.stopped || (this.pub && this.you)) return;
      const brokers = this.relay?.openIds ?? [];
      const debug = brokers.length ? 'Đã nối ' + brokers.join(' + ') + ', chưa thấy phòng' : 'Chưa nối được HiveMQ hay EMQX';
      const detail = brokers.length
        ? 'Đã có mạng, nhưng chưa thấy phòng. Kiểm tra mã phòng và chắc rằng tab máy chiếu vẫn đang mở, rồi bấm Thử lại.'
        : 'Không nối được kênh mạng. Kiểm tra internet (Wi-Fi hoặc 4G đều được) rồi bấm Thử lại.';
      this.report('error', detail, debug, true);
    }, 12000);
    this.joinLoop = window.setInterval(() => this.sendJoin(), 2000);
  }

  send(message: Exclude<ClientMessage, { t: 'join' }>) {
    this.publishClient(message);
  }

  stop() {
    this.stopped = true;
    this.stopRelay();
  }

  private stopRelay() {
    if (this.stall) window.clearTimeout(this.stall);
    if (this.joinLoop) window.clearInterval(this.joinLoop);
    this.stall = null;
    this.joinLoop = null;
    this.relay?.close();
    this.relay = null;
  }

  private onRelay() {
    if (this.stopped || !this.relay) return;
    const open = this.relay.openIds;
    if (!open.length) {
      this.report('connecting', 'Đang nối vào máy chiếu…', 'Đang thử lại kênh mạng…', false);
      return;
    }
    this.report(
      this.pub && this.you ? 'open' : 'connecting',
      this.pub && this.you ? '' : 'Đang nối vào máy chiếu…',
      'Kênh ' + open.join(' + ') + ' · không cần cùng mạng với máy chiếu',
      false,
    );
    this.sendJoin();
  }

  private sendJoin() {
    if (this.stopped || this.kicked || !this.relay?.openIds.length || (this.pub && this.you)) return;
    this.publishClient({
      t: 'join',
      playerId: this.identity.playerId,
      name: this.identity.name,
      avatar: this.identity.avatar,
    });
  }

  private publishClient(body: ClientMessage) {
    if (!this.relay?.openIds.length) return;
    this.msgSeq += 1;
    const id = this.identity.playerId + '-' + this.msgSeq + '-' + Math.random().toString(36).slice(2, 6);
    this.relay.publish(this.topics.inn, JSON.stringify({ id, body }));
  }

  private onWire(topic: string, payload: string) {
    if (this.stopped || this.kicked || payload.length > 200_000) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(payload);
    } catch {
      return;
    }
    if (!isRecord(parsed) || typeof parsed.t !== 'string') return;
    const message = parsed as { t?: string; rev?: number; public?: unknown; you?: unknown; reason?: string; message?: string };
    if (message.t === 'room-closed') {
      this.stopped = true;
      this.stopRelay();
      this.handlers.onClosed(typeof message.reason === 'string' ? message.reason : 'Giảng viên đã đóng phòng.');
      return;
    }
    if (topic === this.topics.you(this.identity.playerId) && message.t === 'kicked') {
      this.kicked = true;
      this.stopRelay();
      this.handlers.onKicked(typeof message.reason === 'string' ? message.reason : 'Bạn đã bị mời ra khỏi phòng.');
      return;
    }
    if (topic === this.topics.you(this.identity.playerId) && message.t === 'error' && typeof message.message === 'string') {
      this.handlers.onError(message.message);
      return;
    }
    const rev = typeof message.rev === 'number' ? message.rev : -1;
    if (rev < this.lastRev) return;
    if (message.t === 'state' && topic === this.topics.all) {
      const pub = asPublic(message.public, this.code);
      if (!pub) return;
      this.lastRev = rev;
      this.pub = pub;
    } else if (message.t === 'you' && topic === this.topics.you(this.identity.playerId)) {
      const you = asYou(message.you, this.identity.playerId);
      if (!you) return;
      this.lastRev = Math.max(this.lastRev, rev);
      this.you = you;
    } else return;
    if (this.pub && this.you) {
      if (this.stall) window.clearTimeout(this.stall);
      this.stall = null;
      if (this.joinLoop) window.clearInterval(this.joinLoop);
      this.joinLoop = null;
      this.handlers.onState(this.pub, this.you);
      this.report('open', '', 'Kênh ' + (this.relay?.openIds.join(' + ') || '') , false);
    }
  }

  private report(status: PlayerNet['status'], detail: string, debug: string, stalled: boolean) {
    this.handlers.onNet({ status, detail, debug, stalled });
  }
}
