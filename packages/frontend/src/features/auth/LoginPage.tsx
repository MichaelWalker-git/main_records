import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
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
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[480px] bg-navy-500 flex-col justify-between p-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21" />
              </svg>
            </div>
            <h1 className="text-white text-xl font-bold tracking-tight">Maine RMS</h1>
          </div>
          <p className="text-navy-200 text-sm mt-6 leading-relaxed max-w-sm">
            Records Management System for the State of Maine, Department of Secretary of State — Maine State Archives.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-navy-200" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-medium">CJIS & FedRAMP Compliant</p>
              <p className="text-navy-300 text-xs mt-0.5">Enterprise security for sensitive records</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-navy-200" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-medium">Full Lifecycle Management</p>
              <p className="text-navy-300 text-xs mt-0.5">From creation through disposition</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-navy-200" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-medium">AI-Powered Classification</p>
              <p className="text-navy-300 text-xs mt-0.5">Automated retention scheduling with Bedrock</p>
            </div>
          </div>
        </div>
        <p className="text-navy-400 text-xs">&copy; 2026 Horus Technology Solutions</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8 lg:hidden">
            <h1 className="text-xl font-bold text-navy-500">Maine RMS</h1>
            <p className="text-slate-500 text-sm mt-1">Records Management System</p>
          </div>

          <div className="lg:mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Sign in</h2>
            <p className="text-slate-500 text-sm mt-1">Enter your credentials to access the system</p>
          </div>

          {error && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm mb-4"
              data-testid="login-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6" data-testid="login-form">
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-9 px-3 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-colors"
                placeholder="name@maine.gov"
                required
                data-testid="login-email"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-9 px-3 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-colors"
                required
                data-testid="login-password"
              />
            </div>
            {showMfa && (
              <div className="mb-4">
                <label htmlFor="mfa" className="block text-sm font-medium text-slate-700 mb-1.5">
                  MFA Code
                </label>
                <input
                  id="mfa"
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-colors font-mono tracking-widest"
                  placeholder="000000"
                  data-testid="login-mfa"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-9 bg-navy-500 text-white text-sm font-medium rounded hover:bg-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center justify-center"
              data-testid="login-submit"
            >
              {isSubmitting ? <LoadingSpinner /> : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
            SSO integration available after Active Directory configuration
          </p>
        </div>
      </div>
    </div>
  );
}