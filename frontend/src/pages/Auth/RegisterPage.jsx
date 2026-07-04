import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../api/auth.api';
import FormField from '../../components/ui/FormField';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    age: '',
    securityAnswer: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        age: Number(form.age),
        securityAnswer: form.securityAnswer.trim(),
        password: form.password,
      });

      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please try again.';
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

        <h1 className="auth-heading">Create an account</h1>
        <p className="auth-subheading">Join the game. It's free.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          <FormField
            label="Name"
            id="register-name"
            type="text"
            value={form.name}
            onChange={handleChange('name')}
            placeholder="Your display name"
            required
          />

          <FormField
            label="Email"
            id="register-email"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            placeholder="you@example.com"
            required
          />

          <FormField
            label="Age"
            id="register-age"
            type="number"
            value={form.age}
            onChange={handleChange('age')}
            placeholder="Your age"
            min={1}
            max={120}
            required
          />

          <FormField
            label="Security Answer"
            id="register-security"
            type="text"
            value={form.securityAnswer}
            onChange={handleChange('securityAnswer')}
            placeholder="e.g. Name of your first pet"
            required
          />

          <FormField
            label="Password"
            id="register-password"
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            placeholder="Choose a strong password"
            required
          />

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <div className="auth-submit-row">
            <button
              id="register-submit"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
            <Link to="/login" className="auth-link">
              Already have an account? <span>Log in</span>
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
