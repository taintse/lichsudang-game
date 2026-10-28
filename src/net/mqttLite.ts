/** Minimal MQTT 3.1.1 client over WebSocket. QoS 0 is enough: the host repeats state. */

export interface MqttHandlers {
  onOpen: () => void;
  onClose: (reason: string) => void;
  onMessage: (topic: string, payload: string) => void;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function concat(parts: Uint8Array[]): Uint8Array {
  const size = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function remainingBytes(length: number): Uint8Array {
  const out: number[] = [];
  let value = length;
  do {
    let digit = value % 128;
    value = Math.floor(value / 128);
    if (value > 0) digit |= 0x80;
    out.push(digit);
  } while (value > 0);
  return Uint8Array.from(out);
}

function utf8Field(text: string): Uint8Array {
  const body = encoder.encode(text);
  const head = new Uint8Array(2);
  head[0] = (body.length >> 8) & 0xff;
  head[1] = body.length & 0xff;
  return concat([head, body]);
}

function fixed(type: number, body: Uint8Array): Uint8Array {
  return concat([Uint8Array.of(type), remainingBytes(body.length), body]);
}

export function connectPacket(clientId: string): Uint8Array {
  const body = concat([
    utf8Field('MQTT'),
    Uint8Array.of(4, 0x02, 0x00, 30),
    utf8Field(clientId),
  ]);
  return fixed(0x10, body);
}

export function subscribePacket(id: number, topic: string): Uint8Array {
  const body = concat([Uint8Array.of((id >> 8) & 0xff, id & 0xff), utf8Field(topic), Uint8Array.of(0)]);
  return fixed(0x82, body);
}

export function publishPacket(topic: string, payload: string): Uint8Array {
  return fixed(0x30, concat([utf8Field(topic), encoder.encode(payload)]));
}

export function pingPacket(): Uint8Array {
  return Uint8Array.of(0xc0, 0x00);
}

export interface PublishFrame {
  topic: string;
  payload: string;
}

export function parsePublish(data: Uint8Array): PublishFrame | null {
  if (data.length < 4 || data[0] >> 4 !== 3) return null;
  let offset = 1;
  let multiplier = 1;
  let remaining = 0;
  let digit = 0;
  for (let i = 0; i < 4; i++) {
    if (offset >= data.length) return null;
    digit = data[offset++];
    remaining += (digit & 127) * multiplier;
    multiplier *= 128;
    if ((digit & 128) === 0) break;
  }
  const start = offset;
  if (start + remaining > data.length || remaining < 2) return null;
  const topicLen = (data[start] << 8) | data[start + 1];
  if (topicLen < 0 || start + 2 + topicLen > start + remaining) return null;
  const topic = decoder.decode(data.slice(start + 2, start + 2 + topicLen));
  const payload = decoder.decode(data.slice(start + 2 + topicLen, start + remaining));
  return { topic, payload };
}

export function packetType(data: Uint8Array): number {
  return data.length ? data[0] >> 4 : 0;
}

export class MqttSocket {
  private ws: WebSocket | null = null;
  private ping: number | null = null;
  private subId = 1;
  private topics: string[] = [];
  private opened = false;
  private userClosed = false;

  constructor(
    private url: string,
    private clientId: string,
    private handlers: MqttHandlers,
  ) {}

  get connected(): boolean {
    return this.opened && this.ws?.readyState === WebSocket.OPEN;
  }

  open(): void {
    this.userClosed = false;
    this.openSocket();
  }

  subscribe(topic: string): void {
    if (!this.topics.includes(topic)) this.topics.push(topic);
    if (this.connected && this.ws) this.ws.send(subscribePacket(this.subId++, topic));
  }

  publish(topic: string, payload: string): void {
    if (!this.connected || !this.ws) return;
    if (payload.length > 120_000) return;
    this.ws.send(publishPacket(topic, payload));
  }

  close(): void {
    this.userClosed = true;
    this.opened = false;
    if (this.ping) window.clearInterval(this.ping);
    this.ping = null;
    this.ws?.close();
    this.ws = null;
  }

  private openSocket() {
    if (this.userClosed) return;
    const ws = new WebSocket(this.url, ['mqtt']);
    ws.binaryType = 'arraybuffer';
    this.ws = ws;
    ws.onopen = () => {
      if (this.ws !== ws) return;
      ws.send(connectPacket(this.clientId));
    };
    ws.onmessage = (event) => {
      if (this.ws !== ws) return;
      const data = new Uint8Array(event.data as ArrayBuffer);
      const type = packetType(data);
      if (type === 2) {
        const code = data.length > 3 ? data[3] : 0;
        if (code !== 0) {
          this.handlers.onClose('Máy chủ kênh từ chối kết nối (' + code + ').');
          ws.close();
          return;
        }
        this.opened = true;
        for (const topic of this.topics) ws.send(subscribePacket(this.subId++, topic));
        if (this.ping) window.clearInterval(this.ping);
        this.ping = window.setInterval(() => {
          if (this.ws === ws && ws.readyState === WebSocket.OPEN) ws.send(pingPacket());
        }, 20000);
        this.handlers.onOpen();
        return;
      }
      if (type === 3) {
        const frame = parsePublish(data);
        if (frame) this.handlers.onMessage(frame.topic, frame.payload);
      }
    };
    ws.onerror = () => {
      if (this.ws !== ws) return;
      ws.close();
    };
    ws.onclose = () => {
      if (this.ws !== ws) return;
      this.opened = false;
      if (this.ping) window.clearInterval(this.ping);
      this.ping = null;
      this.ws = null;
      if (!this.userClosed) this.handlers.onClose('Kênh mạng đã đóng.');
    };
  }
}
