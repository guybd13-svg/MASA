import React, { useState } from 'react';
import { Compass, ArrowRight } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { MasaLogo } from './MasaLogo';



interface UserProfile {
  name: string;
  email: string;
  photoURL: string;
}

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Google sign-in simulation states (empty-slate user login)
  const [loginStep, setLoginStep] = useState<'email' | 'name'>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const isConfigured = !!(url && key && !url.includes('your-supabase-project-id'));

    if (!isConfigured) {
      alert(
        "שגיאה: פרויקט Supabase לא מוגדר בקובץ הגדרות הסביבה (.env.local).\n\nאנא הגדר את מפתחות ה-API האמיתיים שלך מתוך לוח הבקרה של Supabase ולאחר מכן רענן את הדף."
      );
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      alert('שגיאה בתהליך ההתחברות: ' + (err.message || err));
      setIsLoading(false);
    }
  };

  const handleStartGoogleLogin = () => {
    setShowModal(true);
    setLoginStep('email');
    setEmail('');
    setName('');
    setEmailError('');
    setNameError('');
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError('הזן את כתובת האימייל שלך');
      return;
    }
    // Simple email format verification
    if (!email.includes('@')) {
      setEmailError('כתובת אימייל לא תקינה. הזן כתובת מלאה (למשל: user@gmail.com)');
      return;
    }
    setEmailError('');
    setLoginStep('name');
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('הזן את שמך המלא');
      return;
    }
    setNameError('');
    setIsLoading(true);
    setShowModal(false);

    // Simulate standard Google authentication delay
    setTimeout(() => {
      const newUser: UserProfile = {
        name: name.trim(),
        email: email.trim(),
        // Assign a gorgeous avatar based on user initials or generic template
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=9d4edd&color=fff&size=150`,
      };

      // Save user profile settings locally
      localStorage.setItem('travel_saved_profile', JSON.stringify(newUser));
      onLogin(newUser);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="auth-screen">
      <div className="auth-logo-container">
        <div className="auth-logo-glow">
          <Compass className="auth-logo-icon" />
        </div>
        <h1 className="auth-title">MASA</h1>
        <p className="auth-subtitle">השותף המושלם שלך לניהול תקציב, מסלולים ויומן חוויות מכל טיול בעולם</p>
      </div>

      <div className="auth-action-container">
        <button 
          className="btn-google" 
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <span>מתחבר...</span>
          ) : (
            <>
              <svg className="google-icon" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>המשך עם Google</span>
            </>
          )}
        </button>

        <button
          className="btn-fallback-login"
          onClick={handleStartGoogleLogin}
          style={{
            background: 'none',
            border: 'none',
            color: '#a29bfe',
            fontSize: '13px',
            textDecoration: 'underline',
            marginTop: '16px',
            cursor: 'pointer',
            opacity: 0.7
          }}
        >
          התחברות ידנית (במידה ואין חיבור לשרת)
        </button>

        <p className="auth-disclaimer">
          בלחיצה על התחברות, אתה מסכים לתנאי השימוש ומדיניות הפרטיות של MASA.
        </p>
      </div>

      {/* Google Simulated Login Modal */}
      {showModal && (
        <div className="google-modal-overlay" style={overlayStyle}>
          <div className="google-modal-card" style={cardStyle}>
            {/* Google Logo Icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginBottom: '16px' }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>

            {/* STEP 1: EMAIL FORM */}
            {loginStep === 'email' && (
              <form onSubmit={handleEmailSubmit} style={{ width: '100%' }}>
                <h2 style={titleStyle}>התחברות</h2>
                <p style={subtitleStyle}>המשך אל MASA</p>
                
                <div style={{ position: 'relative', marginBottom: '24px', width: '100%' }}>
                  <input
                    type="text"
                    placeholder="איมייל (למשל: user@gmail.com)"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                    }}
                    style={{
                      ...inputStyle,
                      borderColor: emailError ? '#d93025' : '#dadce0'
                    }}
                    autoFocus
                  />
                  {emailError && (
                    <div style={{ color: '#d93025', fontSize: '12px', textAlign: 'right', marginTop: '6px' }}>
                      {emailError}
                    </div>
                  )}
                </div>

                <div style={footerRowStyle}>
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    style={linkButtonStyle}
                  >
                    ביטול
                  </button>
                  <button type="submit" style={primaryButtonStyle}>
                    הבא
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: NAME FORM */}
            {loginStep === 'name' && (
              <form onSubmit={handleNameSubmit} style={{ width: '100%' }}>
                <h2 style={titleStyle}>ברוך הבא</h2>
                
                {/* Email Pill Badge */}
                <div style={pillBadgeStyle} onClick={() => setLoginStep('email')}>
                  <span style={{ fontSize: '12px', color: '#3c4043' }}>{email}</span>
                  <ArrowRight size={14} style={{ marginRight: '6px', color: '#5f6368' }} />
                </div>

                <p style={subtitleStyle}>כדי להמשיך, הזן את השם המלא שלך</p>

                <div style={{ position: 'relative', marginBottom: '24px', width: '100%' }}>
                  <input
                    type="text"
                    placeholder="השם המלא שלך"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setNameError('');
                    }}
                    style={{
                      ...inputStyle,
                      borderColor: nameError ? '#d93025' : '#dadce0'
                    }}
                    autoFocus
                  />
                  {nameError && (
                    <div style={{ color: '#d93025', fontSize: '12px', textAlign: 'right', marginTop: '6px' }}>
                      {nameError}
                    </div>
                  )}
                </div>

                <div style={footerRowStyle}>
                  <button 
                    type="button" 
                    onClick={() => setLoginStep('email')}
                    style={linkButtonStyle}
                  >
                    חזור
                  </button>
                  <button type="submit" style={primaryButtonStyle}>
                    התחבר
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Inline CSS Styles for Google login simulation card
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.65)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  fontFamily: 'Roboto, Arial, sans-serif',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  color: '#202124',
  width: '450px',
  borderRadius: '8px',
  padding: '40px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxSizing: 'border-box',
  direction: 'rtl',
};

const titleStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 400,
  color: '#202124',
  margin: '0 0 8px 0',
  textAlign: 'center',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '16px',
  color: '#202124',
  margin: '0 0 28px 0',
  textAlign: 'center',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  fontSize: '16px',
  border: '1px solid #dadce0',
  borderRadius: '4px',
  outline: 'none',
  boxSizing: 'border-box',
  color: '#202124',
  backgroundColor: '#ffffff',
  fontFamily: 'inherit',
  textAlign: 'right',
};

const footerRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginTop: '8px',
};

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: '#1a73e8',
  color: '#ffffff',
  border: 'none',
  borderRadius: '4px',
  padding: '10px 24px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const linkButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#1a73e8',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  padding: '10px 8px',
};

const pillBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 8px 4px 12px',
  border: '1px solid #dadce0',
  borderRadius: '16px',
  cursor: 'pointer',
  marginBottom: '20px',
  gap: '6px',
};
