import { useState, useEffect } from 'react';
import Flashcard from './Flashcard';
import Logo from './Logo';
import { generateFlashcards } from './api';
import { auth, googleProvider } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

function App() {
  const [user, setUser] = useState(null);
  const [isSignup, setIsSignup] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '', confirmPassword: '' });
  const [loginError, setLoginError] = useState('');
  const [topic, setTopic] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      if (isSignup) {
        if (loginData.password !== loginData.confirmPassword) {
          setLoginError('Passwords do not match');
          return;
        }
        await createUserWithEmailAndPassword(auth, loginData.email, loginData.password);
      } else {
        await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      }
    } catch (error) {
      setLoginError(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setLoginError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setLoginData({ email: '', password: '', confirmPassword: '' });
      setFlashcards([]);
      setTopic('');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    setFlashcards([]);

    try {
      const generatedFlashcards = await generateFlashcards(topic);
      setFlashcards(generatedFlashcards);
    } catch (err) {
      setError(err.message || 'Failed to generate flashcards. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };



  if (authLoading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app">
        <div className="login-container">
          <div className="login-form">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Logo size={48} />
              <h1 style={{ margin: '0 0 0 12px' }}>Flashcard Generator</h1>
            </div>
            <h2 style={{ textAlign: 'center', margin: '0 0 20px 0' }}>{isSignup ? 'Sign Up' : 'Login'}</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  required
                />
              </div>
              {isSignup && (
                <div className="form-group">
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={loginData.confirmPassword}
                    onChange={(e) => setLoginData({...loginData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
              )}
              <button type="submit" className="login-btn">{isSignup ? 'Sign Up' : 'Login'}</button>
            </form>
            <div className="divider">
              <span>or</span>
            </div>
            <button type="button" className="google-btn" onClick={handleGoogleLogin}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            {loginError && <div className="error">{loginError}</div>}
            <div className="toggle-mode">
              <span>{isSignup ? 'Already have an account?' : "Don't have an account?"}</span>
              <button type="button" onClick={() => setIsSignup(!isSignup)} className="signup-btn">
                {isSignup ? 'Login' : 'Sign Up'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <div className="header-content">
          <div className="profile-icon" onClick={() => {
            console.log('Profile clicked, current state:', showProfileMenu);
            setShowProfileMenu(!showProfileMenu);
          }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="profile-image" />
            ) : (
              <div className="profile-initials">
                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            {showProfileMenu && (
              <div className="profile-menu">
                <div className="profile-menu-item" onClick={handleLogout}>
                  Logout
                </div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            <Logo size={32} />
            <div style={{ marginLeft: '12px' }}>
              <h1 style={{ margin: '0' }}>Flashcard Generator</h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0', fontSize: '14px' }}>
                Enter a topic and get 15 comprehensive study flashcards instantly
              </p>
            </div>
          </div>

        </div>
      </div>

      <div className="input-section">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              className="topic-input"
              placeholder="Enter a topic (e.g., DBMS basics, React hooks, Python functions)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="generate-btn"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {loading && (
        <div className="loading">
          Generating flashcards for "{topic}"...
        </div>
      )}

      {flashcards.length > 0 && (
        <div className="flashcards-grid">
          {flashcards.map((flashcard) => (
            <Flashcard key={flashcard.id} flashcard={flashcard} topic={topic} />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;