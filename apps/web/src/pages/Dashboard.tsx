import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { servicesApi, bookingsApi, authApi } from '../lib/api';
import { clearTokens } from '../lib/auth';
import { ProtectedRoute } from '../components/ProtectedRoute';

function DashboardContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: userData } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.me,
  });

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['services'],
    queryFn: servicesApi.getAll,
  });

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: bookingsApi.getAll,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      await authApi.logout(refreshToken || undefined);
    },
    onSuccess: () => {
      clearTokens();
      queryClient.clear();
      navigate('/login');
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: (id: string) => bookingsApi.updateStatus(id, 'CANCELED'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleCancelBooking = (id: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      cancelBookingMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Booking System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {userData?.user.email} ({userData?.user.role})
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <button
              onClick={() => navigate('/bookings/new')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              New Booking
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Services</h2>
              {servicesLoading ? (
                <div className="text-gray-500">Loading services...</div>
              ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {servicesData?.map((service) => (
                      <li key={service.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{service.name}</h3>
                            <p className="text-sm text-gray-500">
                              {service.durationMin} min • ${(service.priceCents / 100).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {servicesData?.length === 0 && (
                    <div className="p-4 text-center text-gray-500">No services available</div>
                  )}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">My Bookings</h2>
              {bookingsLoading ? (
                <div className="text-gray-500">Loading bookings...</div>
              ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {bookingsData?.map((booking) => (
                      <li key={booking.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {booking.service.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {new Date(booking.startsAt).toLocaleString()} -{' '}
                              {new Date(booking.endsAt).toLocaleString()}
                            </p>
                            <span
                              className={`inline-block mt-1 px-2 py-1 text-xs rounded ${
                                booking.status === 'CONFIRMED'
                                  ? 'bg-green-100 text-green-800'
                                  : booking.status === 'CANCELED'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {booking.status}
                            </span>
                          </div>
                          {booking.status !== 'CANCELED' && booking.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                  {bookingsData?.length === 0 && (
                    <div className="p-4 text-center text-gray-500">No bookings yet</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

