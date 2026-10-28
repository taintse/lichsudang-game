const SAFE = /[^a-z0-9]/g;

export function roomTopics(code: string) {
  const clean = code.toLowerCase().replace(SAFE, '').slice(0, 8);
  const base = `lichsudang/v1/${clean}`;
  return {
    code: clean,
    inn: `${base}/in`,
    all: `${base}/all`,
    you(playerId: string) {
      const id = playerId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 48);
      return `${base}/p/${id}`;
    },
  };
}

export const BROKERS = [
  { id: 'HiveMQ', url: 'wss://broker.hivemq.com:8884/mqtt' },
  { id: 'EMQX', url: 'wss://broker.emqx.io:8084/mqtt' },
] as const;

export function brokerIdFromUrl(url: string): string {
  return BROKERS.find((broker) => broker.url === url)?.id ?? 'kênh';
}
