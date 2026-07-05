import { useGameStore } from '../../store/useGameStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getChooser } from '../../utils/playerState';

const StandbyPage = () => {
  const { name } = useAuthStore();
  const game = useGameStore((s) => s.game);

  // Try to get chooser name from game doc if populated
  const chooser = getChooser(game);
  const chooserId = chooser?.playerId?._id || chooser?.playerId;

  return (
    <div className="game-subpage standby-page">
      <div className="home-orb home-orb--1" />
      <div className="home-orb home-orb--2" />

      <div className="game-subpage-card anim-scale-in">
        <div className="game-subpage-icon">⏳</div>
        <h1 className="game-subpage-title gradient-text">Sit tight, {name || 'Player'}!</h1>
        <p className="game-subpage-desc">
          The chooser is picking a song and crafting a hint.<br />
          Get ready — your guessing round is coming up!
        </p>
        <div className="game-subpage-badge standby-badge">Stand By</div>

        {/* Animated sound bars */}
        <div className="standby-bars">
          <span style={{ animationDelay: '0ms' }} />
          <span style={{ animationDelay: '120ms' }} />
          <span style={{ animationDelay: '240ms' }} />
          <span style={{ animationDelay: '360ms' }} />
          <span style={{ animationDelay: '480ms' }} />
        </div>

        <p className="game-subpage-hint">Full standby UI coming soon...</p>
      </div>
    </div>
  );
};

export default StandbyPage;
