import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useRoomStore } from '../../store/useRoomStore';
import { createRoom, joinRoom } from '../../api/room.api';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';

const HomePage = () => {
  const navigate = useNavigate();
  const { name, logout } = useAuthStore();
  const setRoom = useRoomStore((s) => s.setRoom);

  // Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  // Create room form
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Join room form
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // --- Create Room ---
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      const { data } = await createRoom(Number(maxPlayers));
      setRoom(data);
      navigate(`/room/${data.roomCode}`);
    } catch (err) {
      setCreateError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to create room.'
      );
    } finally {
      setCreating(false);
    }
  };

  // --- Join Room ---
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setJoining(true);
    setJoinError('');
    try {
      const { data } = await joinRoom(roomCodeInput.trim().toUpperCase());
      setRoom(data);
      navigate(`/room/${roomCodeInput.trim().toUpperCase()}`);
    } catch (err) {
      setJoinError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Room not found or already started.'
      );
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="home-page">

      {/* Ambient orbs */}
      <div className="home-orb home-orb--1" />
      <div className="home-orb home-orb--2" />
      <div className="home-orb home-orb--3" />

      {/* Top bar */}
      <header className="home-header">
        <div className="home-logo">Rhythm</div>
        <div className="home-header-actions">
          <span className="home-username">Hey, {name || 'Player'} 👋</span>
          <button
            id="profile-btn"
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/profile')}
          >
            Profile
          </button>
          <button
            id="logout-btn"
            className="btn btn-danger btn-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="home-main">
        <div className="home-hero anim-fade-in-up">
          <h1 className="home-title">
            Guess the song.<br />
            <span className="gradient-text">Beat your friends.</span>
          </h1>
          <p className="home-subtitle">
            Pick a track, twist the lyrics with AI, and see who can crack your code.
          </p>
        </div>

        {/* Action cards */}
        <div className="home-actions anim-fade-in-up delay-200">
          <button
            id="create-room-btn"
            className="home-action-card"
            onClick={() => { setCreateOpen(true); setCreateError(''); }}
          >
            <div className="home-action-icon">🎵</div>
            <div className="home-action-label">Create Room</div>
            <div className="home-action-desc">Host a game and invite friends</div>
          </button>

          <button
            id="join-room-btn"
            className="home-action-card"
            onClick={() => { setJoinOpen(true); setJoinError(''); setRoomCodeInput(''); }}
          >
            <div className="home-action-icon">🎧</div>
            <div className="home-action-label">Join Room</div>
            <div className="home-action-desc">Enter a code and jump in</div>
          </button>
        </div>
      </main>

      {/* ── Create Room Modal ── */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create a Room"
      >
        <form onSubmit={handleCreateRoom} className="modal-form">
          <p className="modal-desc">
            Choose how many players can join your room (2–10).
          </p>

          <div className="form-field">
            <label className="form-label" htmlFor="max-players-input">
              Max Players — <span className="modal-value-badge">{maxPlayers}</span>
            </label>
            <input
              id="max-players-input"
              type="range"
              min={2}
              max={10}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(e.target.value)}
              className="range-slider"
            />
            <div className="range-labels">
              <span>2</span><span>10</span>
            </div>
          </div>

          {createError && <div className="auth-error">{createError}</div>}

          <button
            id="create-room-submit"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
            disabled={creating}
          >
            {creating ? 'Creating...' : 'Create Room'}
          </button>
        </form>
      </Modal>

      {/* ── Join Room Modal ── */}
      <Modal
        isOpen={joinOpen}
        onClose={() => setJoinOpen(false)}
        title="Join a Room"
      >
        <form onSubmit={handleJoinRoom} className="modal-form">
          <p className="modal-desc">
            Enter the 6-character room code shared by your host.
          </p>

          <FormField
            label="Room Code"
            id="join-room-code-input"
            type="text"
            value={roomCodeInput}
            onChange={(e) => {
              setRoomCodeInput(e.target.value.toUpperCase());
              setJoinError('');
            }}
            placeholder="e.g. AB12CD"
          />

          {joinError && <div className="auth-error">{joinError}</div>}

          <button
            id="join-room-submit"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
            disabled={joining || roomCodeInput.length < 1}
          >
            {joining ? 'Joining...' : 'Join Room'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default HomePage;
