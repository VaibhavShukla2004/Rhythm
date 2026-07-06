import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { submitHint } from '../../api/game.api';

const ChoosingHintPage = () => {
  const game = useGameStore((s) => s.game);

  const [hint, setHint] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const songTitle = game?.pendingTurn?.songTitle || '—';
  const artistName = game?.pendingTurn?.artistName || '—';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hint.trim()) {
      setError('Hint cannot be empty.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await submitHint(game._id, hint.trim());
      // Socket game-updated fires → state becomes 'stand-by' → GamePage re-routes
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to submit hint. Try again.'
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="game-subpage choosing-hint-page">
      <div className="home-orb home-orb--1" />
      <div className="home-orb home-orb--2" />
      <div className="home-orb home-orb--3" />

      <div className="game-full-card anim-scale-in">
        {/* Header */}
        <div className="game-card-header">
          <div className="game-card-icon">💡</div>
          <div className="game-card-badge hint-badge">Step 2 of 2</div>
          <h1 className="game-card-title gradient-text">Give your hint</h1>
          <p className="game-card-desc">
            The AI will twist the lyrics based on your hint — make it creative!
          </p>
        </div>

        {/* Step indicator */}
        <div className="game-steps">
          <div className="game-step game-step--done">
            <span className="game-step-num">✓</span>
            <span className="game-step-label">Choose Song</span>
          </div>
          <div className="game-step-line game-step-line--done" />
          <div className="game-step game-step--active">
            <span className="game-step-num">2</span>
            <span className="game-step-label">Give Hint</span>
          </div>
          <div className="game-step-line" />
          <div className="game-step">
            <span className="game-step-num">3</span>
            <span className="game-step-label">Wait</span>
          </div>
        </div>

        {/* Chosen song display */}
        <div className="chosen-song-display">
          <span className="chosen-song-label">Your song</span>
          <div className="chosen-song-info">
            <span className="chosen-song-title">{songTitle}</span>
            <span className="chosen-song-sep">by</span>
            <span className="chosen-song-artist">{artistName}</span>
          </div>
        </div>

        {/* Hint form */}
        <form className="game-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label" htmlFor="player-hint">
              Your Hint
              <span className="form-label-sub"> — a theme, mood, or creative twist</span>
            </label>
            <textarea
              id="player-hint"
              className="input game-textarea"
              placeholder={'e.g. "Write it as if it\'s about a space explorer missing home"'}
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              disabled={submitting}
              rows={4}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            id="submit-hint-btn"
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={submitting || !hint.trim()}
            style={{ width: '100%' }}
          >
            {submitting ? (
              <>
                <span className="btn-spinner" />
                Sending to AI...
              </>
            ) : (
              '🤖 Submit Hint'
            )}
          </button>
        </form>

        <p className="game-subpage-hint">
          Once submitted, the AI will generate modified lyrics for your friends to guess.
        </p>
      </div>
    </div>
  );
};

export default ChoosingHintPage;
