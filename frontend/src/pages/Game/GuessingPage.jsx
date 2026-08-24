import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useAuthStore } from '../../store/useAuthStore';
import { submitGuess } from '../../api/game.api';

const GuessingPage = () => {
  const { userId } = useAuthStore();
  const game = useGameStore((s) => s.game);
  const setGame = useGameStore((s) => s.setGame);

  const [guessedSong, setGuessedSong] = useState('');
  const [guessedArtist, setGuessedArtist] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [wrongGuess, setWrongGuess] = useState(false);
  const [error, setError] = useState('');

  // AI-modified lyrics from the current turn
  const aiResponse = game?.pendingTurn?.aiResponse || '';

  const me = game?.players?.find(
    (p) => p.playerId?.toString() === userId?.toString() || p.playerId?._id?.toString() === userId?.toString()
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!guessedSong.trim() || !guessedArtist.trim()) {
      setError('Please fill in both the song title and artist name.');
      return;
    }
    setSubmitting(true);
    setError('');
    setWrongGuess(false);

    try {
      const { data } = await submitGuess(game._id, guessedSong.trim(), guessedArtist.trim());
      
      const returnedGame = data?.game;
      const returnedMe = returnedGame?.players?.find(
        (p) => p.playerId?.toString() === userId?.toString() || p.playerId?._id?.toString() === userId?.toString()
      );

      if (returnedMe && returnedMe.state === 'guessing') {
        // Wrong guess — stay on page, show feedback
        setWrongGuess(true);
        setSubmitting(false);
      } else if (returnedGame) {
        // Correct guess! Instantly update global state to unmount this page
        // (Don't wait for socket which might be delayed)
        setGame(returnedGame);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Submission failed. Try again.'
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="game-subpage guessing-page">
      <div className="home-orb home-orb--1" />
      <div className="home-orb home-orb--2" />
      <div className="home-orb home-orb--3" />

      <div className="guessing-layout anim-scale-in">

        {/* Left: AI Lyrics panel */}
        <div className="guessing-lyrics-panel">
          <div className="guessing-lyrics-header">
            <span className="guessing-lyrics-badge">🤖 AI Modified Lyrics</span>
            <p className="guessing-lyrics-sub">
              Guess the original song from these twisted lyrics!
            </p>
          </div>
          <div className="guessing-lyrics-body">
            {aiResponse
              ? aiResponse.split('\n').map((line, i) => (
                  <p key={i} className="lyrics-line">{line || '\u00A0'}</p>
                ))
              : <p className="lyrics-line lyrics-line--empty">Loading lyrics…</p>
            }
          </div>
        </div>

        {/* Right: Guess form */}
        <div className="guessing-form-panel">
          <div className="guessing-form-header">
            <div className="game-card-icon">🎯</div>
            <h1 className="game-card-title gradient-text">What's the song?</h1>
            <p className="game-card-desc">
              Read the AI-modified lyrics and guess the original song and artist.
            </p>
          </div>

          <form className="game-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="form-label" htmlFor="guessed-song">
                Song Title
              </label>
              <input
                id="guessed-song"
                className="input game-input"
                type="text"
                placeholder="e.g. Shape of You"
                value={guessedSong}
                onChange={(e) => { setGuessedSong(e.target.value); setWrongGuess(false); }}
                disabled={submitting}
                autoComplete="off"
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="guessed-artist">
                Artist Name
              </label>
              <input
                id="guessed-artist"
                className="input game-input"
                type="text"
                placeholder="e.g. Ed Sheeran"
                value={guessedArtist}
                onChange={(e) => { setGuessedArtist(e.target.value); setWrongGuess(false); }}
                disabled={submitting}
                autoComplete="off"
              />
            </div>

            {wrongGuess && (
              <div className="guess-wrong-banner">
                ❌ Not quite! Check your spelling and try again.
              </div>
            )}

            {error && <div className="auth-error">{error}</div>}

            <button
              id="submit-guess-btn"
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting || !guessedSong.trim() || !guessedArtist.trim()}
              style={{ width: '100%' }}
            >
              {submitting ? (
                <>
                  <span className="btn-spinner" />
                  Checking…
                </>
              ) : (
                '🎯 Submit Guess'
              )}
            </button>
          </form>

          <p className="game-subpage-hint">
            ⏱ The clock is ticking — guess before time runs out!
          </p>
        </div>

      </div>
    </div>
  );
};

export default GuessingPage;
