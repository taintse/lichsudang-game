import { describe, expect, it } from 'vitest';
import { connectPacket, parsePublish, publishPacket, subscribePacket } from './mqttLite';

describe('gói MQTT', () => {
  it('đọc lại bản tin vừa ghi', () => {
    const packet = publishPacket('lichsudang/v1/ab7k/in', '{"t":"join","name":"Lan"}');
    const frame = parsePublish(packet);
    expect(frame?.topic).toBe('lichsudang/v1/ab7k/in');
    expect(frame?.payload).toContain('Lan');
  });

  it('từ chối gói không phải publish', () => {
    expect(parsePublish(connectPacket('lsdtest'))).toBeNull();
    expect(parsePublish(subscribePacket(1, 'lichsudang/v1/ab7k/all'))).toBeNull();
  });
});
