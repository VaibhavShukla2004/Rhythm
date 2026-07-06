import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useRoomStore } from '../../store/useRoomStore';
import { finishGame } from '../../api/room.api';

// Medal for top 3
const MEDAL = ['🥇', '🥈', '🥉'];

const ScorecardPage = () => {
  const navigate    = useNavigate();
  const { userId }  = useAuthStore();
  const game        = useGameStore((s) => s.game);
  const room        = useRoomStore((s) => s.room);

  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState('');

  const results = game?.finalResults ?? [];
  const roomCode = room?.roomCode;

  // Is this user the host of the room?
  const hostId = room?.hostId?._id || room?.hostId;
  const amHost = hostId && userId && hostId.toString() === userId.toString();

  // Build a name lookup from room.players (which is populated)
  const nameLookup = {};
  (room?.players ?? []).forEach((p) => {
    const pid  = p.userId?._id || p.userId;
    const name = p.userId?.name || 'Unknown';
    if (pid) nameLookup[pid.toString()] = name;
  });

  const clearRoom = useRoomStore((s) => s.clearRoom);
  const clearGame = useGameStore((s) => s.clearGame);

  const handleFinishGame = async () => {
    if (!roomCode) return;
    setFinishing(true);
    setFinishError('');
    try {
      await finishGame(roomCode);
      
      // We don't need to rely on the socket for the person who clicked the button!
      // Instantly wipe the local state and navigate home.
      clearRoom();
      clearGame();
      navigate('/');
      
    } catch (err) {
      setFinishError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to finish game.'
      );
      setFinishing(false);
    }
  };

  // Format time: ms → "X.Xs"
  const fmtTime = (ms) => ms != null ? `${(ms / 1000).toFixed(1)}s` : '—';

  // Score: could be negative, show with sign
  const fmtScore = (s) => {
    if (s == null) return '—';
    return s >= 0 ? `+${s.toFixed(0)}` : `${s.toFixed(0)}`;
  };

  return (
    <div className="game-subpage scorecard-page">
      <div className="home-orb home-orb--1" />
      <div className="home-orb home-orb--2" />
      <div className="home-orb home-orb--3" />

      <div className="scorecard-layout anim-scale-in">

        {/* Header */}
        <div className="scorecard-header">
          <div className="scorecard-trophy">🏆</div>
          <h1 className="scorecard-title gradient-text">Game Over!</h1>
          <p className="scorecard-subtitle">Here's how everyone did this round.</p>
        </div>

        {/* Results table */}
        <div className="scorecard-panel">
          <table className="scorecard-table">
            <thead>
              <tr>
                <th className="sc-th sc-th--rank">#</th>
                <th className="sc-th">Player</th>
                <th className="sc-th sc-th--center">Correct</th>
                <th className="sc-th sc-th--center">Time</th>
                <th className="sc-th sc-th--center">Score</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => {
                const name   = nameLookup[r.playerId?.toString()] || 'Unknown';
                const isMe   = r.playerId?.toString() === userId?.toString();
                const medal  = MEDAL[i] || '';
                const isTop  = i === 0;

                return (
                  <tr
                    key={r.playerId?.toString()}
                    className={`sc-row ${isTop ? 'sc-row--first' : ''} ${isMe ? 'sc-row--me' : ''}`}
                  >
                    <td className="sc-td sc-td--rank">
                      {medal || <span className="sc-rank-num">{r.rank}</span>}
                    </td>
                    <td className="sc-td">
                      <div className="sc-player">
                        <span className="sc-avatar">{name.charAt(0).toUpperCase()}</span>
                        <span className="sc-name">{name}</span>
                        {isMe && <span className="you-chip">You</span>}
                      </div>
                    </td>
                    <td className="sc-td sc-td--center">
                      <span className="sc-val sc-val--correct">{r.guessesCorrect ?? 0}</span>
                    </td>
                    <td className="sc-td sc-td--center">
                      <span className="sc-val">{fmtTime(r.totalGuessTimeMs)}</span>
                    </td>
                    <td className="sc-td sc-td--center">
                      <span className={`sc-score ${(r.score ?? 0) >= 0 ? 'sc-score--pos' : 'sc-score--neg'}`}>
                        {fmtScore(r.score)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Score formula note */}
        <p className="scorecard-formula">
          Score = (Correct Guesses × 100) − Total Guess Time (seconds)
        </p>

        {/* Host: Finish Game */}
        {amHost && (
          <div className="scorecard-actions">
            {finishError && <div className="auth-error">{finishError}</div>}
            <button
              id="finish-game-btn"
              className="btn btn-primary btn-lg"
              onClick={handleFinishGame}
              disabled={finishing}
            >
              {finishing ? (
                <>
                  <span className="btn-spinner" />
                  Finishing…
                </>
              ) : (
                '🏁 Finish Game & Return Home'
              )}
            </button>
            <p className="scorecard-host-hint">
              As host, clicking this will save everyone's stats and send all players back to the home page.
            </p>
          </div>
        )}

        {/* Non-host: waiting message */}
        {!amHost && (
          <div className="scorecard-waiting">
            <div className="lobby-pulse-dots">
              <span /><span /><span />
            </div>
            <p className="scorecard-wait-text">
              Waiting for the host to finish the game…
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default ScorecardPage;
