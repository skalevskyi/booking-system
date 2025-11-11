import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { NewBooking } from './pages/NewBooking';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppRoutes() {
  const { isAuth } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuth ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuth ? <Navigate to="/dashboard" replace /> : <Register />}
      />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/bookings/new" element={<NewBooking />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;

