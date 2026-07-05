import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useRoomStore } from '../../store/useRoomStore';
import { useGameStore } from '../../store/useGameStore';
import { useSocket } from '../../socket/useSocket';
import { getMyPlayerState } from '../../utils/playerState';

// Sub-views
import ChoosingPage      from './ChoosingPage';
import ChoosingHintPage  from './ChoosingHintPage';
import StandbyPage       from './StandbyPage';
import GuessingPage      from './GuessingPage';
import GuessedPage       from './GuessedPage';
import ScorecardPage     from './ScorecardPage';
import ErrorPage         from './ErrorPage';

/**
 * GamePage — smart router.
 * Connects to the socket, reads the game doc from Zustand,
 * and renders the correct sub-view based on the current player's state.
 *
 * Player states (from game.model.js):
 *   'choosing-song'  → ChoosingPage
 *   'choosing-hint'  → ChoosingHintPage
 *   'stand-by'       → StandbyPage  (AI generating OR watching others guess)
 *   'guessing'       → GuessingPage
 *   'guessed'        → GuessedPage
 *   'timed-out'      → StandbyPage  (next turn loading)
 *
 * pendingTurn.status === 'failing' → ErrorPage  (overrides all)
 * game.gameState    === 'ended'    → ScorecardPage
 */
const GamePage = () => {
  const { gameId }  = useParams();
  const navigate    = useNavigate();
  const { userId }  = useAuthStore();
  const room        = useRoomStore((s) => s.room);
  const game        = useGameStore((s) => s.game);

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
          <p style={{ color: 'var(--clr-text-muted)' }}>Loading game…</p>
        </div>
      </div>
    );
  }

  // ── Global overrides ────────────────────────────────────

  // AI failed → show error page for everyone
  if (game.pendingTurn?.status === 'failing') {
    return <ErrorPage />;
  }

  // Game ended → show scorecard for everyone
  if (game.gameState === 'ended') {
    return <ScorecardPage />;
  }

  // ── Per-player state routing ────────────────────────────
  const myState = getMyPlayerState(game, userId);

  if (myState === 'choosing-song')  return <ChoosingPage />;
  if (myState === 'choosing-hint')  return <ChoosingHintPage />;
  if (myState === 'guessing')       return <GuessingPage />;
  if (myState === 'guessed')        return <GuessedPage />;

  // stand-by, timed-out, or unknown → StandbyPage
  return <StandbyPage />;
};

export default GamePage;
