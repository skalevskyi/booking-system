import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { NewBooking } from './pages/NewBooking';
import { isAuthenticated } from './lib/auth';

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Register />}
      />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/bookings/new" element={<NewBooking />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

