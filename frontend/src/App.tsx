import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { DashboardPage } from '@/pages/DashboardPage';
import { AddProblemPage } from '@/pages/AddProblemPage';
import { ProgressPage } from '@/pages/ProgressPage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import SplashScreen from '@/components/SplashScreen';
import '@/i18n';

const SPLASH_KEY = 'leetcoding_splashed';

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem(SPLASH_KEY);
  });

  useEffect(() => {
    if (!showSplash) return;
  }, [showSplash]);

  const handleSplashFinish = () => {
    sessionStorage.setItem(SPLASH_KEY, '1');
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      {!showSplash && (
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/add" element={<AddProblemPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
}

export default App;
