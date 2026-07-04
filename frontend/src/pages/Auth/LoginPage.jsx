import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, getUserById } from '../../api/auth.api';
import { useAuthStore } from '../../store/useAuthStore';
import FormField from '../../components/ui/FormField';

/**
 * Decode the payload of a JWT without a library.
 * Returns the parsed payload object.
 */
function decodeJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

const LoginPage = () => {
  const navigate = useNavigate();
  const authLogin = useAuthStore((state) => state.login);

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Get token from backend
      const { data } = await login({
        email: form.email.trim(),
        password: form.password,
      });

      const token = data.token;

      // 2. Decode JWT to extract userId
      const payload = decodeJwt(token);
      const userId = payload?.userId;

      // 3. Fetch user's name using their ID
      let name = '';
      if (userId) {
        try {
          // Temporarily set token so the interceptor can attach it
          useAuthStore.setState({ token, userId, name: '' });
          const userRes = await getUserById(userId);
          name = userRes.data?.name || '';
        } catch {
          // Non-critical — name just won't show
        }
      }

      // 4. Persist token + userId + name in Zustand (and localStorage)
      authLogin(token, userId, name);

      // 5. Navigate to home
      navigate('/');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Invalid email or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-title">Rhythm</div>
          <div className="auth-logo-subtitle">The song guessing game</div>
        </div>

        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-subheading">Sign in to jump into a game.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          <FormField
            label="Email"
            id="login-email"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            placeholder="you@example.com"
            required
          />

          <FormField
            label="Password"
            id="login-password"
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            placeholder="Your password"
            required
          />

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-submit-row">
            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <Link to="/register" className="auth-link">
              New here? <span>Register</span>
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
};

export default LoginPage;
