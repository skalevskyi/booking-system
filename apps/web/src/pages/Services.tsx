import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, DollarSign, ArrowRight } from 'lucide-react';
import { servicesApi } from '../lib/api';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Loader } from '../components/Loader';

function ServicesContent() {
  const navigate = useNavigate();

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['services'],
    queryFn: servicesApi.getAll,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Our Services</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose from our wide range of services and book your appointment
        </p>
      </div>

      {servicesLoading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesData && servicesData.length > 0 ? (
            servicesData.map((service) => (
              <div
                key={service.id}
                className="bg-white dark:bg-secondary rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden group cursor-pointer"
                onClick={() => navigate('/bookings/new', { state: { serviceId: service.id } })}
              >
                <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Calendar className="text-primary" size={64} />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {service.name}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock size={18} />
                      <span className="text-sm">{service.durationMin} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <DollarSign size={18} />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${(service.priceCents / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/bookings/new', { state: { serviceId: service.id } });
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-md hover:shadow-lg transform group-hover:scale-[1.02]"
                  >
                    <span>Book Now</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-12 text-center">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 dark:text-gray-400">No services available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Services() {
  return (
    <ProtectedRoute>
      <ServicesContent />
    </ProtectedRoute>
  );
}

