import { MqttSocket } from './mqttLite';
import { BROKERS } from './topics';

export interface RelayLink {
  id: string;
  socket: MqttSocket;
  open: boolean;
}

function clientId(prefix: string): string {
  return (prefix + Math.random().toString(36).slice(2, 10)).slice(0, 23);
}

/** One socket per public broker. Publishing goes to every broker that is open. */
export class Relay {
  readonly links: RelayLink[] = [];
  private closed = false;

  constructor(private onActivity: () => void) {}

  start(onMessage: (topic: string, payload: string) => void): void {
    this.closed = false;
    for (const broker of BROKERS) {
      const socket = new MqttSocket(broker.url, clientId('lsd'), {
        onOpen: () => {
          const link = this.links.find((item) => item.id === broker.id);
          if (link) link.open = true;
          this.onActivity();
        },
        onClose: () => {
          const link = this.links.find((item) => item.id === broker.id);
          if (link) link.open = false;
          this.onActivity();
          if (!this.closed) {
            window.setTimeout(() => {
              if (!this.closed && link && !link.open) socket.open();
            }, 2500);
          }
        },
        onMessage,
      });
      this.links.push({ id: broker.id, socket, open: false });
      socket.open();
    }
  }

  get openIds(): string[] {
    return this.links.filter((link) => link.open).map((link) => link.id);
  }

  subscribe(topic: string): void {
    for (const link of this.links) link.socket.subscribe(topic);
  }

  publish(topic: string, payload: string): void {
    for (const link of this.links) {
      if (link.open) link.socket.publish(topic, payload);
    }
  }

  close(): void {
    this.closed = true;
    for (const link of this.links) link.socket.close();
    this.links.splice(0, this.links.length);
  }
}
