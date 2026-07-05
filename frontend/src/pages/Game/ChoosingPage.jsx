import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';
import { useAuthStore } from '../../store/useAuthStore';

const ChoosingPage = () => {
  const navigate = useNavigate();
  const { name } = useAuthStore();
  const game = useGameStore((s) => s.game);

  return (
    <div className="game-subpage choosing-page">
      <div className="home-orb home-orb--1" />
      <div className="home-orb home-orb--2" />

      <div className="game-subpage-card anim-scale-in">
        <div className="game-subpage-icon">🎵</div>
        <h1 className="game-subpage-title gradient-text">It's your turn, {name || 'Chooser'}!</h1>
        <p className="game-subpage-desc">
          Pick a song, give a hint, and let the AI twist the lyrics.<br />
          Your friends will try to guess it — make it challenging!
        </p>
        <div className="game-subpage-badge">Chooser</div>
        <p className="game-subpage-hint">Full choosing UI coming soon...</p>
      </div>
    </div>
  );
};

export default ChoosingPage;
