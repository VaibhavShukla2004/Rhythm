import { useGameStore } from '../../store/useGameStore';
import { useAuthStore } from '../../store/useAuthStore';

const STATE_CONFIG = {
  'choosing-song':  { label: 'Choosing Song',  icon: '🎵', cls: 'pstate--choosing' },
  'choosing-hint':  { label: 'Giving Hint',     icon: '💡', cls: 'pstate--hint'     },
  'stand-by':       { label: 'Stand By',         icon: '⏳', cls: 'pstate--standby'  },
  'guessing':       { label: 'Guessing…',        icon: '🤔', cls: 'pstate--guessing' },
  'guessed':        { label: 'Guessed ✓',        icon: '✅', cls: 'pstate--guessed'  },
  'timed-out':      { label: 'Timed Out',        icon: '⌛', cls: 'pstate--timeout'  },
};

const GuessedPage = () => {
  const { userId } = useAuthStore();
  const game = useGameStore((s) => s.game);

  const players = game?.players ?? [];
  const guessingCount  = players.filter((p) => p.state === 'guessing').length;
  const guessedCount   = players.filter((p) => p.state === 'guessed').length;
  const total          = players.filter((p) => {
    // exclude the current chooser
    const chooser = game?.players?.[game.currentTurnIndex];
    const chooserId = chooser?.playerId?._id || chooser?.playerId;
    const pid = p.playerId?._id || p.playerId;
    return pid?.toString() !== chooserId?.toString();
  }).length;

  return (
    <div className="game-subpage guessed-page">
      <div className="home-orb home-orb--1" />
      <div className="home-orb home-orb--2" />
      <div className="home-orb home-orb--3" />

      <div className="guessed-layout anim-scale-in">

        {/* Success card */}
        <div className="guessed-success-card">
          <div className="guessed-confetti-icon">🎉</div>
          <h1 className="game-card-title gradient-text">You got it!</h1>
          <p className="game-card-desc">
            Great guess! You've correctly identified the song and artist.
          </p>

          {/* Progress bar */}
          <div className="guessed-progress-wrap">
            <div className="guessed-progress-label">
              <span>{guessedCount} / {total} guessed</span>
              <span>{guessingCount} still guessing</span>
            </div>
            <div className="guessed-progress-track">
              <div
                className="guessed-progress-fill"
                style={{ width: total > 0 ? `${(guessedCount / total) * 100}%` : '0%' }}
              />
            </div>
          </div>

          <p className="guessed-wait-hint">
            Waiting for the others to finish…
          </p>

          {/* Pulse animation */}
          <div className="lobby-pulse-dots">
            <span /><span /><span />
          </div>
        </div>

        {/* Player list */}
        <div className="guessed-players-card">
          <h2 className="standby-players-title">Player Status</h2>
          <ul className="standby-players-list">
            {players.map((p) => {
              const pid    = p.playerId?._id || p.playerId;
              const pname  = p.playerId?.name || 'Player';
              const isMe   = pid?.toString() === userId?.toString();
              const chooser = game?.players?.[game.currentTurnIndex];
              const chooserId = chooser?.playerId?._id || chooser?.playerId;
              const isChooser = pid?.toString() === chooserId?.toString();
              const cfg    = STATE_CONFIG[p.state] || { label: p.state, icon: '❓', cls: '' };

              return (
                <li key={pid?.toString()} className={`standby-player-row ${isChooser ? 'spr--chooser' : ''}`}>
                  <span className="standby-player-avatar">
                    {pname.charAt(0).toUpperCase()}
                  </span>
                  <span className="standby-player-name">
                    {pname}
                    {isMe && <span className="you-chip">You</span>}
                    {isChooser && <span className="chooser-chip">Chooser</span>}
                  </span>
                  <span className={`pstate-badge ${cfg.cls}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default GuessedPage;
