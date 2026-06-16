import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Monitoring from './pages/Monitoring';
import { useModernTheme } from './hooks/useModernTheme';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isModern] = useModernTheme();

  useEffect(() => {
    if (localStorage.getItem('token')) setIsAuthenticated(true);
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className={`d-flex flex-column min-vh-100 ${isModern ? 'm-app' : 'bg-light'}`}>
        <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        
        <main className={`flex-grow-1 ${isModern ? 'm-main' : 'py-4'}`}>
          <Routes>
            {!isAuthenticated ? (
              <Route path="*" element={<Login onLogin={handleLogin} />} />
            ) : (
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/monitoring" element={<Monitoring />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
