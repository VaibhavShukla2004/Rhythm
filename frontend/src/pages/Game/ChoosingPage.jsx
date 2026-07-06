import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useAuthStore } from '../../store/useAuthStore';
import { submitSong } from '../../api/game.api';

const ChoosingPage = () => {
  const { name } = useAuthStore();
  const game = useGameStore((s) => s.game);

  const [songTitle, setSongTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!songTitle.trim() || !artistName.trim()) {
      setError('Please fill in both fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await submitSong(game._id, songTitle.trim(), artistName.trim());
      // Socket game-updated will fire → GamePage re-routes to ChoosingHintPage automatically
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to submit song. Try again.'
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="game-subpage choosing-page">
      <div className="home-orb home-orb--1" />
      <div className="home-orb home-orb--2" />
      <div className="home-orb home-orb--3" />

      <div className="game-full-card anim-scale-in">
        {/* Header */}
        <div className="game-card-header">
          <div className="game-card-icon">🎵</div>
          <div className="game-card-badge chooser-badge">Your Turn</div>
          <h1 className="game-card-title gradient-text">Pick your song</h1>
          <p className="game-card-desc">
            Choose a song your friends might know — then you'll craft a clever hint.
          </p>
        </div>

        {/* Step indicator */}
        <div className="game-steps">
          <div className="game-step game-step--active">
            <span className="game-step-num">1</span>
            <span className="game-step-label">Choose Song</span>
          </div>
          <div className="game-step-line" />
          <div className="game-step">
            <span className="game-step-num">2</span>
            <span className="game-step-label">Give Hint</span>
          </div>
          <div className="game-step-line" />
          <div className="game-step">
            <span className="game-step-num">3</span>
            <span className="game-step-label">Wait</span>
          </div>
        </div>

        {/* Form */}
        <form className="game-form" method="post" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label" htmlFor="song-title">
              Song Title
            </label>
            <input
              id="song-title"
              className="input game-input"
              type="text"
              placeholder="e.g. Bohemian Rhapsody"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              disabled={submitting}
              autoComplete="off"
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="artist-name">
              Artist Name
            </label>
            <input
              id="artist-name"
              className="input game-input"
              type="text"
              placeholder="e.g. Queen"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              disabled={submitting}
              autoComplete="off"
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            id="submit-song-btn"
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={submitting || !songTitle.trim() || !artistName.trim()}
            style={{ width: '100%' }}
          >
            {submitting ? (
              <>
                <span className="btn-spinner" />
                Submitting...
              </>
            ) : (
              'Confirm Song →'
            )}
          </button>
        </form>

        <p className="game-subpage-hint">
          ⏱ You're on the clock — the timer is ticking!
        </p>
      </div>
    </div>
  );
};

export default ChoosingPage;
