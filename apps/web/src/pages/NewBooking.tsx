import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi, bookingsApi } from '../lib/api';
import { ProtectedRoute } from '../components/ProtectedRoute';

function NewBookingContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [error, setError] = useState('');

  const { data: servicesData, isLoading: servicesLoading, error: servicesError } = useQuery({
    queryKey: ['services'],
    queryFn: servicesApi.getAll,
  });

  const createBookingMutation = useMutation({
    mutationFn: (data: { serviceId: string; startsAt: string }) =>
      bookingsApi.create(data.serviceId, data.startsAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      navigate('/dashboard');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to create booking');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedServiceId || !selectedDate || !selectedTime) {
      setError('Please fill in all fields');
      return;
    }

    const startsAt = new Date(`${selectedDate}T${selectedTime}`);
    if (startsAt < new Date()) {
      setError('Cannot book in the past');
      return;
    }

    createBookingMutation.mutate({
      serviceId: selectedServiceId,
      startsAt: startsAt.toISOString(),
    });
  };

  const selectedService = servicesData?.find((s) => s.id === selectedServiceId);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">New Booking</h1>

          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="service" className="block text-sm font-medium text-gray-700">
                Service
              </label>
              {servicesLoading ? (
                <div className="mt-1 text-sm text-gray-500">Loading services...</div>
              ) : servicesError ? (
                <div className="mt-1 text-sm text-red-600">
                  Error loading services. Please refresh the page.
                </div>
              ) : (
                <select
                  id="service"
                  required
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a service</option>
                  {servicesData?.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.durationMin} min - ${(service.priceCents / 100).toFixed(2)}
                    </option>
                  ))}
                </select>
              )}
              {servicesData?.length === 0 && !servicesLoading && (
                <div className="mt-1 text-sm text-yellow-600">
                  No services available. Please contact administrator.
                </div>
              )}
            </div>

            {selectedService && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  <strong>Duration:</strong> {selectedService.durationMin} minutes
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Price:</strong> ${(selectedService.priceCents / 100).toFixed(2)}
                </p>
              </div>
            )}

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                id="date"
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                Time
              </label>
              <input
                id="time"
                type="time"
                required
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={createBookingMutation.isPending || servicesLoading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createBookingMutation.isPending ? 'Creating...' : 'Create Booking'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export function NewBooking() {
  return (
    <ProtectedRoute>
      <NewBookingContent />
    </ProtectedRoute>
  );
}

