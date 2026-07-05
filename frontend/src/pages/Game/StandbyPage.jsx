import { useGameStore } from '../../store/useGameStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getChooser, getMyPlayerState } from '../../utils/playerState';

// State labels and icons for the player list
const STATE_CONFIG = {
  'choosing-song':  { label: 'Choosing Song',  icon: '🎵', cls: 'pstate--choosing' },
  'choosing-hint':  { label: 'Giving Hint',     icon: '💡', cls: 'pstate--hint'     },
  'stand-by':       { label: 'Stand By',         icon: '⏳', cls: 'pstate--standby'  },
  'guessing':       { label: 'Guessing',          icon: '🤔', cls: 'pstate--guessing' },
  'guessed':        { label: 'Guessed ✓',         icon: '✅', cls: 'pstate--guessed'  },
  'timed-out':      { label: 'Timed Out',         icon: '⌛', cls: 'pstate--timeout'  },
};

const StandbyPage = () => {
  const { userId } = useAuthStore();
  const game = useGameStore((s) => s.game);

  const chooser    = getChooser(game);
  const myState    = getMyPlayerState(game, userId);
  const status     = game?.pendingTurn?.status;   // 'generating' | 'success' | 'failing' | undefined
  const isGenerating = status === 'generating';

  // Resolve chooser display name from players array
  const chooserName = (() => {
    if (!chooser) return 'Chooser';
    // playerId may be populated object or plain string id
    return chooser.playerId?.name || 'Chooser';
  })();

  // Build display list — map player states
  const playerRows = (game?.players ?? []).map((p) => {
    const pid    = p.playerId?._id || p.playerId;
    const pname  = p.playerId?.name || 'Player';
    const isMe   = pid?.toString() === userId?.toString();
    const isChooser = pid?.toString() === (chooser?.playerId?._id || chooser?.playerId)?.toString();
    const cfg    = STATE_CONFIG[p.state] || { label: p.state, icon: '❓', cls: '' };
    return { pid, pname, isMe, isChooser, state: p.state, cfg };
  });

  // Headline copy depends on state
  const headline = isGenerating
    ? '🤖 AI is generating lyrics…'
    : myState === 'stand-by'
    ? '🎧 Others are guessing'
    : '⏳ Sit tight…';

  const subline = isGenerating
    ? 'The AI is cooking up twisted lyrics from the hint. Hold on!'
    : myState === 'stand-by'
    ? `You're the chooser this round. Watch your friends try to crack the song!`
    : 'Next turn is loading…';

  return (
    <div className="game-subpage standby-page">
      <div className="home-orb home-orb--1" />
      <div className="home-orb home-orb--2" />
      <div className="home-orb home-orb--3" />

      <div className="standby-layout anim-scale-in">

        {/* Left — status card */}
        <div className="standby-status-card">
          <div className="standby-icon-wrap">
            {isGenerating ? (
              <div className="standby-ai-spinner">
                <span />
                <span />
                <span />
                <span />
              </div>
            ) : (
              <div className="standby-bars">
                <span style={{ animationDelay: '0ms' }} />
                <span style={{ animationDelay: '120ms' }} />
                <span style={{ animationDelay: '240ms' }} />
                <span style={{ animationDelay: '360ms' }} />
                <span style={{ animationDelay: '480ms' }} />
              </div>
            )}
          </div>

          <h1 className="standby-headline gradient-text">{headline}</h1>
          <p className="standby-subline">{subline}</p>

          {/* Chooser info chip */}
          <div className="standby-chooser-chip">
            <span className="standby-chooser-label">Chooser</span>
            <span className="standby-chooser-name">{chooserName}</span>
            <span className={`pstate-badge ${STATE_CONFIG[chooser?.state]?.cls || ''}`}>
              {STATE_CONFIG[chooser?.state]?.icon || '⏳'}{' '}
              {STATE_CONFIG[chooser?.state]?.label || chooser?.state}
            </span>
          </div>
        </div>

        {/* Right — player list */}
        <div className="standby-players-card">
          <h2 className="standby-players-title">Players</h2>
          <ul className="standby-players-list">
            {playerRows.map((row) => (
              <li key={row.pid?.toString()} className={`standby-player-row ${row.isChooser ? 'spr--chooser' : ''}`}>
                <span className="standby-player-avatar">
                  {row.pname.charAt(0).toUpperCase()}
                </span>
                <span className="standby-player-name">
                  {row.pname}
                  {row.isMe && <span className="you-chip">You</span>}
                </span>
                <span className={`pstate-badge ${row.cfg.cls}`}>
                  {row.cfg.icon} {row.cfg.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default StandbyPage;
