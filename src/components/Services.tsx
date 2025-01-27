import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase, withRetry } from '../lib/supabase';
import type { Service } from '../types';
import * as Icons from 'lucide-react';
import { Youtube } from 'lucide-react';

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedService, setExpandedService] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();

    const channel = supabase
      .channel('services_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services'
        },
        () => {
          fetchServices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await withRetry(() => 
        supabase
          .from('services')
          .select('*')
          .order('order_index', { ascending: true })
      );

      if (error) throw error;
      setServices(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching services:', err);
      setError('No se pudieron cargar los servicios. Por favor, intenta más tarde.');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = (service: string) => {
    const message = encodeURIComponent(`Hola, me interesa el servicio de ${service}. Me gustaría obtener más información.`);
    window.open(`https://wa.me/573103688201?text=${message}`, '_blank');
  };

  const handleEmail = (service: string) => {
    const subject = encodeURIComponent(`Solicitud de cita: ${service}`);
    const body = encodeURIComponent(`Hola, me interesa agendar una cita para el servicio de ${service}.`);
    window.location.href = `mailto:fc@fabiocanchila.com?subject=${subject}&body=${body}`;
  };

  const toggleExpand = (serviceId: string) => {
    setExpandedService(expandedService === serviceId ? null : serviceId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-custom-gray-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-custom-gray-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchServices}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-custom-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Servicios Especializados
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Más de dos décadas transformando vidas y organizaciones a través de metodologías 
            probadas y estrategias efectivas
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            // @ts-ignore - Lucide icons are dynamically accessed
            const IconComponent = Icons[service.icon] || Icons.Briefcase;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="p-8">
                  <div className="text-primary mb-6 w-14 h-14 flex items-center justify-center bg-primary-light/10 rounded-lg">
                    <IconComponent size={28} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {service.title}
                  </h3>

                  {service.youtube_url && (
                    <a
                      href={service.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:text-primary-dark mb-4 group"
                    >
                      <Youtube className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                      <span className="text-sm">Ver video informativo</span>
                    </a>
                  )}

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleEmail(service.title)}
                        className="flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
                      >
                        <Mail className="h-5 w-5 mr-2" />
                        <span>Gestionar Cita</span>
                      </button>

                      <button
                        onClick={() => handleWhatsApp(service.title)}
                        className="flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg group"
                      >
                        <MessageCircle className="h-5 w-5 mr-2" />
                        <span>WhatsApp</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-center text-xs text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Tiempo de respuesta promedio: 5 minutos</span>
                    </div>

                    <button
                      onClick={() => toggleExpand(service.id)}
                      className="w-full flex items-center justify-center px-4 py-2 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-lg transition-colors duration-300"
                    >
                      {expandedService === service.id ? (
                        <>
                          <ChevronUp className="h-5 w-5 mr-2" />
                          Leer menos
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-5 w-5 mr-2" />
                          Leer más
                        </>
                      )}
                    </button>

                    <AnimatePresence>
                      {expandedService === service.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-6 border-t border-gray-200">
                            <div className="prose prose-lg max-w-none text-gray-700">
                              {service.content}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}