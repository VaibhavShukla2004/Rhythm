import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomDetails, startGame, leaveRoom, transferHost } from '../../api/room.api';
import { useAuthStore } from '../../store/useAuthStore';
import { useRoomStore } from '../../store/useRoomStore';
import { useGameStore } from '../../store/useGameStore';
import { useSocket } from '../../socket/useSocket';
import { getMyPlayerState } from '../../utils/playerState';

const RoomLobbyPage = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const { setRoom, clearRoom } = useRoomStore();
  const game = useGameStore((s) => s.game);

  const [room, setLocalRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Game settings (host only UI)
  const [choosingTime, setChoosingTime] = useState(180);
  const [guessingTime, setGuessingTime] = useState(180);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');

  // Leave room
  const [leaving, setLeaving] = useState(false);

  // Transfer host
  const [transferTarget, setTransferTarget] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState('');

  // Connect socket and listen for game-updated
  useSocket(roomCode);

  // Fetch room details — also used for polling
  const fetchRoom = useCallback(async () => {
    try {
      const { data } = await getRoomDetails(roomCode);
      setLocalRoom(data);
      setRoom(data);
    } catch (err) {
      setError('Room not found or you are not a member.');
    } finally {
      setLoading(false);
    }
  }, [roomCode, setRoom]);

  // Initial fetch
  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  // Poll every 5s to pick up player joins/leaves (no socket event for room changes)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRoom();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchRoom]);

  // When game starts (socket game-updated) → navigate everyone to game page
  useEffect(() => {
    if (!game || game.gameState !== 'in-progress') return;
    navigate(`/game/${game._id}`);
  }, [game, navigate]);

  // ── Helpers ──────────────────────────────────────────────

  const handleCopyCode = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(roomCode);
      } else {
        // Fallback for non-HTTPS / IP-based access
        const textArea = document.createElement('textarea');
        textArea.value = roomCode;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleLeaveRoom = async () => {
    setLeaving(true);
    try {
      await leaveRoom(roomCode);
      clearRoom();
      navigate('/');
    } catch (err) {
      // Even if backend errors, go home — edge case
      clearRoom();
      navigate('/');
    }
  };

  const handleStartGame = async () => {
    setStarting(true);
    setStartError('');
    try {
      const { data } = await startGame(roomCode);
      if (data.game) {
        navigate(`/game/${data.game._id}`);
      }
    } catch (err) {
      setStartError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to start game.'
      );
      setStarting(false);
    }
  };

  const handleTransferHost = async () => {
    if (!transferTarget) return;
    setTransferring(true);
    setTransferError('');
    setTransferSuccess('');

    // Find the player ID from the room doc using the selected name
    const targetPlayer = room?.players?.find(
      (p) => (p.userId?.name || '') === transferTarget
    );
    const newHostId = targetPlayer?.userId?._id || targetPlayer?.userId;

    if (!newHostId) {
      setTransferError('Player not found in room.');
      setTransferring(false);
      return;
    }

    try {
      const { data } = await transferHost(roomCode, newHostId);
      setLocalRoom(data);
      setRoom(data);
      setTransferSuccess(`Host transferred to ${transferTarget}.`);
      setTransferTarget('');
    } catch (err) {
      setTransferError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Transfer failed.'
      );
    } finally {
      setTransferring(false);
    }
  };

  // ── Derived values ────────────────────────────────────────
  const hostId = room?.hostId?._id || room?.hostId;
  const amHost = hostId && userId && hostId.toString() === userId.toString();

  // Other players (excluding current host) for transfer dropdown
  const nonHostPlayers = room?.players?.filter((p) => {
    const pid = p.userId?._id || p.userId;
    return pid?.toString() !== hostId?.toString();
  }) ?? [];

  // ── Render ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="lobby-page">
        <div className="home-orb home-orb--1" />
        <div className="home-orb home-orb--2" />
        <div className="lobby-loading">
          <div className="profile-spinner" />
          <p>Loading room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lobby-page">
        <div className="lobby-loading">
          <div className="auth-error">{error}</div>
          <button className="btn btn-ghost" onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="lobby-page">
      <div className="home-orb home-orb--1" />
      <div className="home-orb home-orb--2" />
      <div className="home-orb home-orb--3" />

      {/* Header */}
      <header className="home-header">
        <div className="home-logo">Rhythm</div>
        <div className="home-header-actions">
          <button
            id="leave-room-btn"
            className="btn btn-danger btn-sm"
            onClick={handleLeaveRoom}
            disabled={leaving}
          >
            {leaving ? 'Leaving...' : '← Leave Room'}
          </button>
        </div>
      </header>

      <div className="lobby-content">

        {/* ── Room Code ── */}
        <div className="lobby-room-code-section">
          <p className="lobby-label">Room Code</p>
          <div className="lobby-code-box">
            <span className="lobby-code-text">{roomCode}</span>
            <button
              id="copy-room-code-btn"
              className="btn btn-ghost btn-sm"
              onClick={handleCopyCode}
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <p className="lobby-code-hint">Share this code with your friends to invite them</p>
        </div>

        <div className="lobby-grid">

          {/* ── Left: Players ── */}
          <div className="lobby-panel">
            <h2 className="lobby-panel-title">
              Players ({room?.players?.length ?? 0}/{room?.maxPlayers})
            </h2>
            <ul className="lobby-player-list">
              {room?.players?.map((player) => {
                const pid = player.userId?._id || player.userId;
                const pname = player.userId?.name || 'Unknown';
                const pidStr = pid?.toString();
                const thisIsHost = pidStr === hostId?.toString();
                const thisIsMe = pidStr === userId?.toString();
                return (
                  <li
                    key={pidStr}
                    className={`lobby-player-item ${thisIsHost ? 'lobby-player-host' : ''}`}
                  >
                    <span className="lobby-player-avatar">
                      {pname.charAt(0).toUpperCase()}
                    </span>
                    <span className="lobby-player-name">{pname}</span>
                    <div className="lobby-player-badges">
                      {thisIsHost && <span className="lobby-badge lobby-badge--host">Host</span>}
                      {thisIsMe && <span className="lobby-badge lobby-badge--you">You</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="lobby-waiting-hint">
              {amHost
                ? `Waiting for players... (${room?.players?.length}/${room?.maxPlayers})`
                : 'Waiting for the host to start the game...'}
            </p>
          </div>

          {/* ── Right Column ── */}
          <div className="lobby-right-col">

            {/* Game Settings (host) or Wait message (others) */}
            {amHost ? (
              <div className="lobby-panel lobby-settings-panel">
                <h2 className="lobby-panel-title">Game Settings</h2>
                <div className="lobby-settings-form">

                  <div className="form-field">
                    <label className="form-label" htmlFor="choosing-time">
                      Choosing Time — <span className="modal-value-badge">{choosingTime}s</span>
                    </label>
                    <input
                      id="choosing-time"
                      type="range" min={30} max={300} step={15}
                      value={choosingTime}
                      onChange={(e) => setChoosingTime(Number(e.target.value))}
                      className="range-slider"
                    />
                    <div className="range-labels"><span>30s</span><span>300s</span></div>
                  </div>

                  <div className="form-field">
                    <label className="form-label" htmlFor="guessing-time">
                      Guessing Time — <span className="modal-value-badge">{guessingTime}s</span>
                    </label>
                    <input
                      id="guessing-time"
                      type="range" min={30} max={300} step={15}
                      value={guessingTime}
                      onChange={(e) => setGuessingTime(Number(e.target.value))}
                      className="range-slider"
                    />
                    <div className="range-labels"><span>30s</span><span>300s</span></div>
                  </div>

                  {startError && <div className="auth-error">{startError}</div>}

                  <button
                    id="start-game-btn"
                    className="btn btn-primary"
                    onClick={handleStartGame}
                    disabled={starting || !room || room.players?.length < 2}
                    style={{ width: '100%' }}
                  >
                    {starting ? 'Starting...' : '🎮 Start Game'}
                  </button>
                  {room?.players?.length < 2 && (
                    <p className="lobby-min-players-hint">Need at least 2 players to start</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="lobby-panel lobby-wait-panel">
                <div className="lobby-wait-icon">⏳</div>
                <h2 className="lobby-wait-title">Waiting for host</h2>
                <p className="lobby-wait-desc">
                  The host is setting up the game. Hang tight — the fun is coming!
                </p>
                <div className="lobby-pulse-dots">
                  <span /><span /><span />
                </div>
              </div>
            )}

            {/* Transfer Host (host only) */}
            {amHost && nonHostPlayers.length > 0 && (
              <div className="lobby-panel">
                <h2 className="lobby-panel-title">Transfer Host</h2>
                <div className="lobby-transfer-form">
                  <p className="modal-desc">
                    Pass host controls to another player in the room.
                  </p>
                  <select
                    id="transfer-host-select"
                    className="input lobby-select"
                    value={transferTarget}
                    onChange={(e) => {
                      setTransferTarget(e.target.value);
                      setTransferError('');
                      setTransferSuccess('');
                    }}
                  >
                    <option value="">Select a player...</option>
                    {nonHostPlayers.map((p) => {
                      const pid = p.userId?._id || p.userId;
                      const pname = p.userId?.name || 'Unknown';
                      return (
                        <option key={pid?.toString()} value={pname}>
                          {pname}
                        </option>
                      );
                    })}
                  </select>

                  {transferError && <div className="auth-error">{transferError}</div>}
                  {transferSuccess && <div className="auth-success">{transferSuccess}</div>}

                  <button
                    id="transfer-host-btn"
                    className="btn btn-ghost"
                    onClick={handleTransferHost}
                    disabled={transferring || !transferTarget}
                    style={{ width: '100%' }}
                  >
                    {transferring ? 'Transferring...' : 'Transfer Host'}
                  </button>
                </div>
              </div>
            )}

            {/* How to Play */}
            <div className="lobby-panel lobby-how-to-play">
              <h2 className="lobby-panel-title">🎵 How to Play Rhythm</h2>
              <ul className="lobby-rules-list">
                <li>Every player gets <strong>one turn</strong> as the Chooser.</li>
                <li>When it's your turn, enter a <strong>song, artist, and a custom hint</strong>.</li>
                <li>Rhythm generates an <strong>AI-modified version</strong> of the lyrics based on your hint.</li>
                <li>Everyone else <strong>races to guess</strong> the correct song before time runs out.</li>
                <li>Guess correctly as fast as possible to <strong>climb the leaderboard</strong>.</li>
                <li>Once all guessers finish, the next player becomes the Chooser.</li>
                <li>The game ends after every player has had one turn.</li>
                <li>Winner = most correct guesses; <strong>total guess time</strong> as the tiebreaker.</li>
              </ul>
              <div className="lobby-tip">
                <span className="lobby-tip-label">💡 Tip</span>
                Choose songs your friends have a fair chance of recognising, and give hints that help — without giving it away.
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomLobbyPage;
