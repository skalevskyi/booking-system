import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { NewBooking } from './pages/NewBooking';
import { Services } from './pages/Services';
import { Profile } from './pages/Profile';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';

function AppRoutes() {
  const { isAuth } = useAuth();
  const location = useLocation();

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    type: 'tween' as const,
    ease: 'anticipate' as const,
    duration: 0.3,
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={
            isAuth ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <motion.div
                key="login"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Login />
              </motion.div>
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuth ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <motion.div
                key="register"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Register />
              </motion.div>
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <motion.div
                key="dashboard"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Dashboard />
              </motion.div>
            </Layout>
          }
        />
        <Route
          path="/services"
          element={
            <Layout>
              <motion.div
                key="services"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Services />
              </motion.div>
            </Layout>
          }
        />
        <Route
          path="/profile"
          element={
            <Layout>
              <motion.div
                key="profile"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Profile />
              </motion.div>
            </Layout>
          }
        />
        <Route
          path="/bookings/new"
          element={
            <Layout>
              <motion.div
                key="new-booking"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <NewBooking />
              </motion.div>
            </Layout>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
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

