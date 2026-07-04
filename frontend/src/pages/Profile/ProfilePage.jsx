import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../../api/profile.api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getProfile();
        setProfile(data.profile);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Failed to load profile.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="profile-page">

      {/* Ambient orb */}
      <div className="home-orb home-orb--1" />
      <div className="home-orb home-orb--2" />

      <div className="profile-card anim-fade-in-up">

        {/* Back button */}
        <button
          id="profile-back-btn"
          className="btn btn-ghost btn-sm profile-back"
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>

        <h1 className="profile-heading gradient-text">Your Profile</h1>

        {loading && (
          <div className="profile-loading">
            <div className="profile-spinner" />
            <p>Loading profile...</p>
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}

        {profile && !loading && (
          <div className="profile-content">

            {/* Stats */}
            <div className="profile-stats">
              <div className="profile-stat-card">
                <div className="profile-stat-value">{profile.gamesPlayed ?? 0}</div>
                <div className="profile-stat-label">Games Played</div>
              </div>
              <div className="profile-stat-card">
                <div className="profile-stat-value">{profile.songsChosen?.length ?? 0}</div>
                <div className="profile-stat-label">Songs Chosen</div>
              </div>
            </div>

            {/* Songs chosen history */}
            {profile.songsChosen?.length > 0 ? (
              <div className="profile-songs">
                <h2 className="profile-section-title">Songs You've Chosen</h2>
                <ul className="profile-songs-list">
                  {profile.songsChosen.map((song, i) => (
                    <li key={i} className="profile-song-item">
                      <span className="profile-song-title">{song.songTitle}</span>
                      <span className="profile-song-artist">{song.artistName}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="profile-empty">
                No songs chosen yet. Jump into a game and pick your first track!
              </p>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
