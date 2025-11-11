import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isAuthenticated } from '../lib/auth';

interface AuthContextType {
  isAuth: boolean;
  updateAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuth, setIsAuth] = useState(isAuthenticated());

  const updateAuth = () => {
    setIsAuth(isAuthenticated());
  };

  // Оновлюємо стан при зміні localStorage (для синхронізації між компонентами)
  useEffect(() => {
    const handleStorageChange = () => {
      updateAuth();
    };

    // Слухаємо custom event для оновлення стану
    window.addEventListener('auth-change', handleStorageChange);
    
    // Також слухаємо зміни в localStorage (для синхронізації між табами)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('auth-change', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return <AuthContext.Provider value={{ isAuth, updateAuth }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

