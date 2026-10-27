import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { GameRoom, type HostState } from '../game/room';
import { makeCode } from '../game/id';
import { sounds } from '../audio/sound';
import { clearHostSave, loadHostSave, saveHostSave } from '../net/identity';
import { HostServer, type NetNotice } from '../net/hostServer';
import { HostView } from './HostView';
import { useNow } from './PlayerView';
import { Boot } from '../components/chrome';

function roomLink(code: string) {
  const url = new URL(window.location.href);
  url.hash = `#/join/${code}`;
  return url.href;
}

function readableSave(raw: unknown, code: string): HostState | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const state = raw as HostState;
  if (state.code !== code || !Array.isArray(state.players) || typeof state.phase !== 'string') return undefined;
  return state;
}

export function HostScreen() {
  const [notice, setNotice] = useState<NetNotice>({ status: 'connecting' });
  const [code, setCode] = useState('');
  const [qr, setQr] = useState('');
  const [version, setVersion] = useState(0);
  const [boot, setBoot] = useState(0);
  const roomRef = useRef<GameRoom | null>(null);
  const netRef = useRef<HostServer | null>(null);

  useEffect(() => {
    const saved = boot === 0 ? loadHostSave() : null;
    const nextCode = saved?.code ?? makeCode();
    const room = new GameRoom({ code: nextCode, hydrate: saved ? readableSave(saved.state, nextCode) : undefined });
    roomRef.current = room;
    let cancelled = false;
    let retry: number | null = null;
    let tries = 0;
    const net = new HostServer(room, (next) => {
      if (cancelled) return;
      if (next.unavailable) {
        tries += 1;
        if (tries <= 4) {
          retry = window.setTimeout(() => net.start(nextCode), 1200);
          setNotice(next);
          return;
        }
        clearHostSave();
        net.destroy();
        if (cancelled) return;
        if (boot >= 2) {
          setNotice({ status: 'error', error: 'Không mở được phòng. Kiểm tra mạng rồi bấm thử lại.' });
          return;
        }
        setBoot((value) => value + 1);
        return;
      }
      if (next.status === 'open') setCode(room.getState().code);
      setNotice(next);
    });
    netRef.current = net;
    const unsub = room.subscribe(() => {
      saveHostSave({ v: 1, code: room.getState().code, at: Date.now(), state: room.exportState() });
      net.broadcastNow();
      setVersion((value) => value + 1);
    });
    net.start(nextCode);
    if (import.meta.env.DEV) {
      (window as unknown as { __lsd?: unknown }).__lsd = {
        key: () => room.debugKey(),
        pub: () => room.publicState(),
        phase: () => room.getState().phase,
      };
    }
    return () => {
      cancelled = true;
      if (retry) window.clearTimeout(retry);
      unsub();
      net.destroy();
      if (import.meta.env.DEV) delete (window as unknown as { __lsd?: unknown }).__lsd;
    };
  }, [boot]);

  useEffect(() => {
    if (!code) return;
    let alive = true;
    void QRCode.toDataURL(roomLink(code), {
      width: 720,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#6e1214', light: '#fff6e4' },
    }).then((url) => {
      if (alive) setQr(url);
    });
    return () => {
      alive = false;
    };
  }, [code]);

  const room = roomRef.current;
  const now = useNow(room ? room.publicState().serverNow : null);
  if (!room || !code) {
    return (
      <Boot
        label={notice.error ?? 'Đang mở phòng máy chiếu…'}
        onRetry={
          notice.status === 'error'
            ? () => {
                clearHostSave();
                setBoot((value) => value + 1);
              }
            : undefined
        }
      />
    );
  }

  const pub = room.publicState();
  void version;
  const link = roomLink(code);
  return (
    <HostView
      pub={pub}
      link={link}
      qr={qr}
      now={now}
      mode="live"
      notice={notice.status === 'open' ? undefined : notice.error ?? 'Đang nối máy chủ phòng…'}
      onNext={() => {
        sounds.unlock();
        room.next();
      }}
      onPause={() => room.pause()}
      onResume={() => room.resume()}
      onKick={(playerId) => netRef.current?.kick(playerId)}
      onSkip={() => room.skipCeremony()}
    />
  );
}
