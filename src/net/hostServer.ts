import type { GameRoom } from '../game/room';
import type { ClientMessage, ServerMessage } from '../game/types';
import { Relay } from './relay';
import { roomTopics } from './topics';

export type NetStatus = 'connecting' | 'open' | 'error';

export interface NetNotice {
  status: NetStatus;
  error?: string;
  debug?: string;
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
  if (raw.t === 'map' && typeof raw.choice === 'string') {
    return { t: 'map', playerId, choice: raw.choice.slice(0, 24) };
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
  private relay: Relay | null = null;
  private topics: ReturnType<typeof roomTopics> | null = null;
  private timer: number | null = null;
  private heartbeat: number | null = null;
  private stall: number | null = null;
  private destroyed = false;
  private seen: string[] = [];
  code = '';

  constructor(
    private room: GameRoom,
    private onChange: (notice: NetNotice) => void,
  ) {}

  start(code: string) {
    this.destroyRelay();
    this.destroyed = false;
    this.code = code;
    this.topics = roomTopics(code);
    this.onChange({ status: 'connecting', debug: 'Đang mở kênh mạng…' });
    const relay = new Relay(() => this.report());
    this.relay = relay;
    relay.start((topic, payload) => this.onWire(topic, payload));
    relay.subscribe(this.topics.inn);
    this.stall = window.setTimeout(() => {
      if (this.destroyed || this.relay?.openIds.length) return;
      this.onChange({
        status: 'error',
        error: 'Không mở được kênh mạng. Kiểm tra internet của máy chiếu rồi bấm thử lại.',
        debug: 'Chưa nối HiveMQ hay EMQX',
      });
    }, 12000);
  }

  kick(playerId: string) {
    this.room.kick(playerId);
    this.publish(this.topics?.you(playerId) ?? '', { t: 'kicked', reason: 'Bạn đã bị mời ra khỏi phòng.' });
    this.queue(true);
  }

  announceClose(reason: string) {
    this.publish(this.topics?.all ?? '', { t: 'room-closed', reason });
  }

  broadcastNow() {
    this.queue(true);
  }

  destroy() {
    this.destroyed = true;
    if (this.timer) window.clearTimeout(this.timer);
    if (this.heartbeat) window.clearInterval(this.heartbeat);
    if (this.stall) window.clearTimeout(this.stall);
    this.destroyRelay();
  }

  private destroyRelay() {
    if (this.heartbeat) window.clearInterval(this.heartbeat);
    this.heartbeat = null;
    this.relay?.close();
    this.relay = null;
  }

  private report() {
    if (this.destroyed || !this.relay) return;
    const open = this.relay.openIds;
    if (open.length) {
      if (this.stall) window.clearTimeout(this.stall);
      this.stall = null;
      if (!this.heartbeat) this.heartbeat = window.setInterval(() => this.queue(true), 2000);
      this.onChange({ status: 'open', debug: 'Kênh ' + open.join(' + ') + ' · người chơi mạng khác vẫn vào được' });
      this.queue(true);
      return;
    }
    this.onChange({ status: 'connecting', debug: 'Đang nối lại kênh mạng…' });
  }

  private onWire(topic: string, payload: string) {
    if (!this.topics || topic !== this.topics.inn || payload.length > 20_000) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(payload);
    } catch {
      return;
    }
    if (!isRecord(parsed) || typeof parsed.id !== 'string' || !isRecord(parsed.body)) return;
    if (this.seen.includes(parsed.id)) return;
    this.seen.push(parsed.id);
    if (this.seen.length > 500) this.seen.splice(0, 100);
    const message = parseClient(parsed.body);
    if (!message) return;
    const result = this.room.handleClient(message);
    if (result.kick) {
      this.publish(this.topics.you(message.playerId), { t: 'kicked', reason: result.error ?? 'Bạn đã bị mời ra khỏi phòng.' });
      this.queue(true);
      return;
    }
    if (result.error) {
      this.publish(this.topics.you(message.playerId), { t: 'error', message: result.error });
    }
    if (result.broadcast || result.personal) this.queue(true);
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
    if (!this.topics || !this.relay?.openIds.length) return;
    const pub = this.room.publicState();
    this.publish(this.topics.all, { t: 'state', rev: pub.rev, public: pub });
    for (const player of pub.players) {
      const you = this.room.youState(player.id);
      if (!you) continue;
      this.publish(this.topics.you(player.id), { t: 'you', rev: pub.rev, you });
    }
  }

  private publish(topic: string, message: ServerMessage | { t: 'state'; rev: number; public: unknown } | { t: 'you'; rev: number; you: unknown }) {
    if (!topic || !this.relay) return;
    this.relay.publish(topic, JSON.stringify(message));
  }
}
