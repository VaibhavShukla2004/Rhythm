import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoomStore } from '../../store/useRoomStore';
import { leaveRoom } from '../../api/room.api';
import { useGameStore } from '../../store/useGameStore';

const ErrorPage = () => {
  const navigate = useNavigate();
  const room     = useRoomStore((s) => s.room);
  const clearRoom = useRoomStore((s) => s.clearRoom);
  const clearGame = useGameStore((s) => s.clearGame);

  const [leaving, setLeaving] = useState(false);

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

  return (
    <div className="game-subpage error-page">
      {/* Red ambient orbs */}
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

        <div className="error-actions">
          <button
            id="error-exit-btn"
            className="btn btn-danger btn-lg"
            onClick={handleLeave}
            disabled={leaving}
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
