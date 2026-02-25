import { create } from 'zustand';
import type {
  SceneId,
  ClaudeEvent,
  AnimationState,
} from '@claudeborne/shared';
import { SCENES, eventToAnimation } from '@claudeborne/shared';

interface GameState {
  // Connection
  connected: boolean;
  setConnected: (connected: boolean) => void;

  // Scene
  sceneId: SceneId | null;
  setSceneId: (sceneId: SceneId) => void;

  // Character animation
  animationState: AnimationState;
  setAnimationState: (state: AnimationState) => void;

  // Events
  lastEvent: ClaudeEvent | null;
  eventCount: number;
  pushEvent: (event: ClaudeEvent) => void;

  // Idle tracking
  lastEventTime: number;

  // Scene cycling
  cycleScene: () => void;

  // Scene config helper
  getSceneConfig: () => (typeof SCENES)[number] | null;
}

export const useGameStore = create<GameState>((set, get) => ({
  connected: false,
  setConnected: (connected) => set({ connected }),

  sceneId: null,
  setSceneId: (sceneId) => set({ sceneId }),

  animationState: 'idle',
  setAnimationState: (animationState) => set({ animationState }),

  lastEvent: null,
  eventCount: 0,
  pushEvent: (event) => {
    const animation = eventToAnimation(event);
    set({
      lastEvent: event,
      eventCount: get().eventCount + 1,
      animationState: animation,
      lastEventTime: Date.now(),
    });
  },

  lastEventTime: Date.now(),

  cycleScene: () => {
    const { sceneId } = get();
    const currentIdx = SCENES.findIndex((s) => s.id === sceneId);
    const nextIdx = (currentIdx + 1) % SCENES.length;
    set({ sceneId: SCENES[nextIdx].id, animationState: 'enter' });
  },

  getSceneConfig: () => {
    const { sceneId } = get();
    if (!sceneId) return null;
    return SCENES.find((s) => s.id === sceneId) ?? null;
  },
}));
