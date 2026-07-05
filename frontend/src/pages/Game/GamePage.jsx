import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useRoomStore } from '../../store/useRoomStore';
import { useGameStore } from '../../store/useGameStore';
import { useSocket } from '../../socket/useSocket';
import { getMyPlayerState } from '../../utils/playerState';

// Sub-views
import ChoosingPage from './ChoosingPage';
import StandbyPage from './StandbyPage';

/**
 * GamePage — smart router.
 * Connects to the socket, reads the game doc from Zustand,
 * and renders the correct sub-view based on the current player's state.
 *
 * Player states (from game.model.js):
 *   'choosing-song'  → ChoosingPage
 *   'choosing-hint'  → ChoosingPage  (still their turn)
 *   'stand-by'       → StandbyPage
 *   'guessing'       → GuessingPage  (coming soon)
 *   'guessed'        → StandbyPage   (waiting for others)
 *   'timed-out'      → StandbyPage
 *
 * gameState 'ended'  → ResultsPage   (coming soon)
 */
const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const room = useRoomStore((s) => s.room);
  const game = useGameStore((s) => s.game);

  // roomCode needed for socket — get from store (set when create/join/lobby ran)
  const roomCode = room?.roomCode;

  // Connect socket
  useSocket(roomCode);

  // If game-updated sends null → host finished the game → go home
  useEffect(() => {
    if (game === null) {
      navigate('/');
    }
  }, [game, navigate]);

  // Loading state — game not yet in store
  if (!game) {
    return (
      <div className="game-subpage">
        <div className="home-orb home-orb--1" />
        <div className="home-orb home-orb--2" />
        <div className="lobby-loading">
          <div className="profile-spinner" />
          <p style={{ color: 'var(--clr-text-muted)' }}>Loading game...</p>
        </div>
      </div>
    );
  }

  // Determine my current state in this game
  const myState = getMyPlayerState(game, userId);

  // Route to correct sub-view
  if (game.gameState === 'ended') {
    // Results page — coming soon
    return (
      <div className="game-subpage">
        <div className="home-orb home-orb--1" />
        <div className="game-subpage-card anim-scale-in">
          <div className="game-subpage-icon">🏆</div>
          <h1 className="game-subpage-title gradient-text">Game Over!</h1>
          <p className="game-subpage-desc">Results page coming soon...</p>
        </div>
      </div>
    );
  }

  if (myState === 'choosing-song' || myState === 'choosing-hint') {
    return <ChoosingPage />;
  }

  // stand-by, guessing, guessed, timed-out, or unknown → StandbyPage for now
  return <StandbyPage />;
};

export default GamePage;
