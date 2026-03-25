import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import kashifLogo from './KASHif logo-02.png';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import ProjectsPage from './pages/ProjectsPage';
import ReviewPage from './pages/ReviewPage';
import AuthGuard from './components/AuthGuard';
import { useForceRtl } from './hooks/useForceRtl';
import { useFurnitureStore } from './store/useFurnitureStore';
import { useAuthStore } from './store/useAuthStore';
import { useSettingsStore } from './store/useSettingsStore';

function App() {
  useForceRtl();
  const [loading, setLoading] = useState(true);
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const theme = useSettingsStore((s) => s.theme);

  // Restore auth session
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Apply dark mode class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const applySystem = () => {
        if (mediaQuery.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };
      applySystem();
      mediaQuery.addEventListener('change', applySystem);
      return () => mediaQuery.removeEventListener('change', applySystem);
    }
  }, [theme]);

  useEffect(() => {
    useFurnitureStore.getState().initializeLibrary();
    const timeout = window.setTimeout(() => setLoading(false), 1500);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div
        className={`transition-all duration-300 ${loading ? 'pointer-events-none opacity-0 scale-[1.02]' : 'opacity-100 scale-100'
          }`}
      >
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/projects"
            element={
              <AuthGuard>
                <ProjectsPage />
              </AuthGuard>
            }
          />
          <Route
            path="/"
            element={
              <AuthGuard>
                <HomePage />
              </AuthGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthGuard>
                <SettingsPage />
              </AuthGuard>
            }
          />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Loading Screen */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-gray-800 to-blue-800 transition-all duration-500 ${loading ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
      >
        <div className="flex flex-col items-center">
          <img
            src={kashifLogo}
            alt="الكاشف"
            className="h-20 w-auto object-contain drop-shadow-lg"
            style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}
          />
          <h1 className="mt-4 text-3xl font-bold text-white">شقتي</h1>
          <p className="mt-2 text-sm text-blue-200">صمّم شقتك بسهولة واحترافية</p>
          <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full animate-loading-bar rounded-full bg-white"
              style={{
                animation: loading ? 'loadingBar 1.2s ease-in-out forwards' : 'none',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
