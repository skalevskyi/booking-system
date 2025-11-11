import { useQuery } from '@tanstack/react-query';
import { User, Mail, Shield } from 'lucide-react';
import { authApi } from '../lib/api';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Loader } from '../components/Loader';

function ProfileContent() {
  const { data: userData, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.me,
  });

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Your account information</p>
      </div>

      <div className="bg-white dark:bg-secondary rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/80 p-8 text-white">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold">
              {getInitials(userData?.user.name, userData?.user.email)}
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {userData?.user.name || 'User'}
              </h2>
              <p className="text-primary-100">{userData?.user.email}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="text-primary" size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Name</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {userData?.user.name || 'Not provided'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Mail className="text-primary" size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {userData?.user.email}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="p-2 bg-accent/20 rounded-lg">
              <Shield className="text-accent" size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Role</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {userData?.user.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Profile() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

