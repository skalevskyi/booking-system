import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, DollarSign, ArrowLeft, Check } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { servicesApi, bookingsApi } from '../lib/api';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Loader } from '../components/Loader';
import { Spinner } from '../components/Loader';

function NewBookingContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { data: servicesData, isLoading: servicesLoading, error: servicesError } = useQuery({
    queryKey: ['services'],
    queryFn: servicesApi.getAll,
  });

  useEffect(() => {
    if (location.state?.serviceId) {
      setSelectedServiceId(location.state.serviceId);
    }
  }, [location.state]);

  const createBookingMutation = useMutation({
    mutationFn: (data: { serviceId: string; startsAt: string }) =>
      bookingsApi.create(data.serviceId, data.startsAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Success! Your booking is confirmed.');
      navigate('/dashboard');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to create booking');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedServiceId || !selectedDate || !selectedTime) {
      toast.error('Please fill in all fields');
      return;
    }

    const startsAt = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    startsAt.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    if (startsAt < new Date()) {
      toast.error('Cannot book in the past');
      return;
    }

    createBookingMutation.mutate({
      serviceId: selectedServiceId,
      startsAt: startsAt.toISOString(),
    });
  };

  const selectedService = servicesData?.find((s) => s.id === selectedServiceId);
  const isFormValid = selectedServiceId && selectedDate && selectedTime;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="text-gray-700 dark:text-gray-300" size={20} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">New Booking</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-secondary rounded-lg shadow-md hover:shadow-lg transition-all p-6 space-y-6">
        <div>
          <label
            htmlFor="service"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Service
          </label>
          {servicesLoading ? (
            <Loader size={8} />
          ) : servicesError ? (
            <div className="mt-1 text-sm text-red-600 dark:text-red-400">
              Error loading services. Please refresh the page.
            </div>
          ) : (
            <select
              id="service"
              required
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
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
            <div className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
              No services available. Please contact administrator.
            </div>
          )}
        </div>

        {selectedService && (
          <div className="bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Calendar className="text-primary" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedService.name}
                </h3>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{selectedService.durationMin} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${(selectedService.priceCents / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all text-left flex items-center gap-2"
            >
              <Calendar size={20} />
              <span>
                {selectedDate
                  ? selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Select a date'}
              </span>
            </button>
            {showDatePicker && (
              <div className="absolute z-10 mt-2 bg-white dark:bg-secondary rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setShowDatePicker(false);
                  }}
                  disabled={(date) => {
                    const d = new Date(date);
                    d.setHours(0, 0, 0, 0);
                    return d < today;
                  }}
                  className="dark:text-white"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="time"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Time
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              id="time"
              type="time"
              required
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all shadow-md hover:shadow-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormValid || createBookingMutation.isPending || servicesLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
          >
            {createBookingMutation.isPending ? (
              <>
                <Spinner size={18} />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Check size={18} />
                <span>Create Booking</span>
              </>
            )}
          </button>
        </div>
      </form>
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
