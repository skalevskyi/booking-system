import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Calendar, Clock, DollarSign, X } from 'lucide-react';
import { servicesApi, bookingsApi } from '../lib/api';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Loader } from '../components/Loader';
import { Modal } from '../components/Modal';
import { useState } from 'react';

function DashboardContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['services'],
    queryFn: servicesApi.getAll,
  });

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: bookingsApi.getAll,
  });

  const cancelBookingMutation = useMutation({
    mutationFn: (id: string) => bookingsApi.updateStatus(id, 'CANCELED'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking canceled successfully');
      setCancelBookingId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to cancel booking');
    },
  });

  const handleCancelBooking = (id: string) => {
    setCancelBookingId(id);
  };

  const confirmCancel = () => {
    if (cancelBookingId) {
      cancelBookingMutation.mutate(cancelBookingId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'CANCELED':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'COMPLETED':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Book your service in 3 clicks</h1>
        <p className="text-primary-100 mb-6">Quick and easy booking system</p>
        <button
          onClick={() => navigate('/bookings/new')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-lg font-medium hover:bg-gray-100 transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          New Booking
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-secondary rounded-lg p-6 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Services</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {servicesData?.length || 0}
              </p>
            </div>
            <Calendar className="text-primary" size={32} />
          </div>
        </div>
        <div className="bg-white dark:bg-secondary rounded-lg p-6 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">My Bookings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {bookingsData?.length || 0}
              </p>
            </div>
            <Clock className="text-accent" size={32} />
          </div>
        </div>
        <div className="bg-white dark:bg-secondary rounded-lg p-6 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Bookings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {bookingsData?.filter((b) => b.status === 'CONFIRMED').length || 0}
              </p>
            </div>
            <DollarSign className="text-green-500" size={32} />
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Bookings</h2>
          <button
            onClick={() => navigate('/bookings/new')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
          >
            <Plus size={18} />
            New Booking
          </button>
        </div>

        {bookingsLoading ? (
          <Loader />
        ) : (
          <div className="bg-white dark:bg-secondary rounded-lg shadow-md overflow-hidden">
            {bookingsData && bookingsData.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {bookingsData.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {booking.service.name}
                          </h3>
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              booking.status,
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>
                              {new Date(booking.startsAt).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>
                              {new Date(booking.startsAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              -{' '}
                              {new Date(booking.endsAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign size={16} />
                            <span>${(booking.service.priceCents / 100).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      {booking.status !== 'CANCELED' && booking.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="ml-4 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          aria-label="Cancel booking"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No bookings yet</p>
                <button
                  onClick={() => navigate('/bookings/new')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
                >
                  <Plus size={18} />
                  Create your first booking
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={cancelBookingId !== null}
        onClose={() => setCancelBookingId(null)}
        title="Cancel Booking"
        onConfirm={confirmCancel}
        confirmText="Cancel Booking"
        cancelText="Keep Booking"
        onCancel={() => setCancelBookingId(null)}
      >
        <p>Are you sure you want to cancel this booking? This action cannot be undone.</p>
      </Modal>
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
