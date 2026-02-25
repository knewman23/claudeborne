import { useEffect, useRef } from 'react';
import { WS_PORT, type WsMessage, type ClaudeEvent, type SceneId } from '@claudeborne/shared';
import { useGameStore } from '../stores/gameStore';

// In production, connect WS to the same host that served the page.
// In dev (Vite), fall back to the dedicated WS_PORT.
const WS_URL = import.meta.env.DEV
  ? `ws://localhost:${WS_PORT}`
  : `ws://${window.location.host}`;
const RECONNECT_INTERVAL = 2000;

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const setConnected = useGameStore((s) => s.setConnected);
  const setSceneId = useGameStore((s) => s.setSceneId);
  const pushEvent = useGameStore((s) => s.pushEvent);

  useEffect(() => {
    function connect() {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[claudeborne] Connected to server');
        setConnected(true);
      };

      ws.onmessage = (e) => {
        try {
          const msg: WsMessage = JSON.parse(e.data as string);

          if (msg.type === 'scene_init') {
            const payload = msg.payload as { sceneId: SceneId };
            setSceneId(payload.sceneId);
          } else if (msg.type === 'event') {
            pushEvent(msg.payload as ClaudeEvent);
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        console.log('[claudeborne] Disconnected, reconnecting...');
        setConnected(false);
        reconnectTimer.current = setTimeout(connect, RECONNECT_INTERVAL);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [setConnected, setSceneId, pushEvent]);
}
