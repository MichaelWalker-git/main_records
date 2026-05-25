import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getCognitoLoginUrl } from '../../services/auth';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [showMfa, setShowMfa] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password, showMfa ? mfaCode : undefined);
      navigate('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      if (message.includes('MFA')) {
        setShowMfa(true);
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-navy-500">Maine Records Management System</h1>
          <p className="text-slate-600 mt-2">Department of Secretary of State — Maine State Archives</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Sign In</h2>
          {error && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4"
              data-testid="login-error"
              role="alert"
            >
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} data-testid="login-form">
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                required
                data-testid="login-email"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                required
                data-testid="login-password"
              />
            </div>
            {showMfa && (
              <div className="mb-4">
                <label htmlFor="mfa" className="block text-sm font-medium text-slate-700 mb-1">
                  MFA Code
                </label>
                <input
                  id="mfa"
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                  placeholder="Enter 6-digit code"
                  data-testid="login-mfa"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-navy-500 text-white py-2 px-4 rounded-md hover:bg-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center"
              data-testid="login-submit"
            >
              {isSubmitting ? <LoadingSpinner /> : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 border-t border-slate-200 pt-4">
            <a
              href={getCognitoLoginUrl()}
              className="block text-center text-sm text-navy-500 hover:text-navy-600 font-medium"
              data-testid="login-sso"
            >
              Sign in with State of Maine SSO
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
