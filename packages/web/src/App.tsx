import { GameCanvas } from './components/GameCanvas';
import { useWebSocket } from './hooks/useWebSocket';

export default function App() {
  useWebSocket();
  return <GameCanvas />;
}
