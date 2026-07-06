import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoomStore } from '../../store/useRoomStore';
import { leaveRoom } from '../../api/room.api';
import { useGameStore } from '../../store/useGameStore';
import { useAuthStore } from '../../store/useAuthStore';
import { retryChoice, skipTurn } from '../../api/game.api';

const ErrorPage = () => {
  const navigate = useNavigate();
  const room     = useRoomStore((s) => s.room);
  const clearRoom = useRoomStore((s) => s.clearRoom);
  const clearGame = useGameStore((s) => s.clearGame);
  const game = useGameStore((s) => s.game);
  const { userId } = useAuthStore();

  const [leaving, setLeaving] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const chooserId = game?.players?.[game?.currentTurnIndex]?.playerId?._id || game?.players?.[game?.currentTurnIndex]?.playerId;
  const isChooser = chooserId?.toString() === userId?.toString();

  const handleLeave = async () => {
    setLeaving(true);
    try {
      if (room?.roomCode) await leaveRoom(room.roomCode);
    } catch {
      // best-effort
    } finally {
      clearRoom();
      clearGame();
      navigate('/');
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    setErrorMsg('');
    try {
      await retryChoice(game._id);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to retry.');
      setRetrying(false);
    }
  };

  const handleSkip = async () => {
    setSkipping(true);
    setErrorMsg('');
    try {
      await skipTurn(game._id);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to skip turn.');
      setSkipping(false);
    }
  };

  return (
    <div className="game-subpage error-page">
      <div className="error-orb error-orb--1" />
      <div className="error-orb error-orb--2" />

      <div className="error-card anim-scale-in">
        <div className="error-icon">⚠️</div>

        <h1 className="error-title">AI Response Failed</h1>
        <p className="error-desc">
          Something went wrong while generating the AI-modified lyrics.
          This could be a network issue or the AI service is temporarily unavailable.
        </p>

        <div className="error-detail-box">
          <span className="error-detail-label">Error</span>
          <span className="error-detail-text">
            pendingTurn.status: failing — AI lyrics generation unsuccessful
          </span>
        </div>

        {errorMsg && <div className="auth-error">{errorMsg}</div>}

        <div className="error-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          {isChooser ? (
            <>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleRetry}
                disabled={retrying || skipping}
                style={{ width: '100%' }}
              >
                {retrying ? 'Retrying…' : '🔄 Retry Choice'}
              </button>
              <button
                className="btn btn-ghost btn-lg"
                onClick={handleSkip}
                disabled={retrying || skipping}
                style={{ width: '100%' }}
              >
                {skipping ? 'Skipping…' : '⏭️ Skip Turn'}
              </button>
            </>
          ) : (
            <p className="error-desc" style={{ color: 'var(--clr-warning)', fontWeight: 600 }}>
              Waiting for the chooser to decide what to do...
            </p>
          )}

          <button
            id="error-exit-btn"
            className="btn btn-danger btn-lg"
            onClick={handleLeave}
            disabled={leaving}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {leaving ? 'Leaving…' : '← Exit Room & Go Home'}
          </button>
        </div>

        <p className="error-footnote">
          Your progress up to this point has been preserved.
        </p>
      </div>
    </div>
  );
};

export default ErrorPage;
