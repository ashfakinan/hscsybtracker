import { useState } from 'react';
import { GraduationCap, Loader2, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onSignIn: (email: string, password: string) => Promise<{ error: string | null }>;
  onSignUp: (email: string, password: string) => Promise<{ error: string | null }>;
  onSignInAsDemo: () => void;
  isSupabaseConfigured: boolean;
}

export function LoginScreen({ onSignIn, onSignUp, onSignInAsDemo, isSupabaseConfigured }: LoginScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setBusy(true);
    setError(null);

    const result = mode === 'signin'
      ? await onSignIn(email.trim(), password)
      : await onSignUp(email.trim(), password);

    if (result.error) {
      setError(formatError(result.error, mode));
      setBusy(false);
    }
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div
        className="w-full max-w-sm rounded-2xl p-8 flex flex-col items-center"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: 'var(--accent-light)' }}
        >
          <GraduationCap size={32} style={{ color: 'var(--accent)' }} />
        </div>

        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--fg)' }}>
          HSC Syllabus Tracker
        </h1>
        <p className="text-sm mb-6 text-center" style={{ color: 'var(--fg3)' }}>
          {!isSupabaseConfigured
            ? 'Explore instantly with Demo Mode or sign in locally.'
            : mode === 'signin'
            ? 'Sign in to sync your progress across devices.'
            : 'Create an account to start tracking your syllabus.'}
        </p>

        {!isSupabaseConfigured && (
          <button
            type="button"
            onClick={onSignInAsDemo}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all hover:opacity-95 mb-4 shadow-sm"
            style={{ background: 'var(--theory)', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            <Sparkles size={16} />
            Try Demo Mode (Instant Access)
          </button>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <input
            type="email"
            placeholder={isSupabaseConfigured ? "Email" : "Email (optional for local/demo)"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors"
            style={{
              border: '1.5px solid var(--border)',
              background: 'var(--surface2)',
              color: 'var(--fg)',
              fontFamily: 'inherit',
            }}
            required={isSupabaseConfigured}
            autoFocus
          />
          <input
            type="password"
            placeholder={isSupabaseConfigured ? "Password" : "Password (optional for local/demo)"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors"
            style={{
              border: '1.5px solid var(--border)',
              background: 'var(--surface2)',
              color: 'var(--fg)',
              fontFamily: 'inherit',
            }}
            required={isSupabaseConfigured}
            minLength={isSupabaseConfigured ? 6 : 1}
          />

          {error && (
            <p className="text-xs text-center" style={{ color: 'var(--cq)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="w-full text-center mt-4">
          {mode === 'signin' ? (
            <p className="text-xs" style={{ color: 'var(--fg3)' }}>
              Don't have an account?{' '}
              <button
                type="button"
                className="font-semibold transition-colors"
                style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => switchMode('signup')}
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-xs" style={{ color: 'var(--fg3)' }}>
              Already have an account?{' '}
              <button
                type="button"
                className="font-semibold transition-colors"
                style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => switchMode('signin')}
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function formatError(msg: string, mode: 'signin' | 'signup'): string {
  if (msg.includes('Invalid login credentials')) {
    return 'Wrong email or password. Please try again.';
  }
  if (msg.includes('User already registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (msg.includes('Password should be at least')) {
    return 'Password must be at least 6 characters.';
  }
  if (msg.includes('Email rate limit')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (mode === 'signup' && msg.includes('email')) {
    return 'Please enter a valid email address.';
  }
  return msg;
}
