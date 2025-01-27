import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, Clock, Youtube } from 'lucide-react';
import { supabase, withRetry } from '../lib/supabase';
import type { Service } from '../types';

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const { data, error } = await withRetry(() =>
        supabase
          .from('services')
          .select('*')
          .eq('id', id)
          .single()
      );

      if (error) throw error;
      if (!data) {
        navigate('/services');
        return;
      }

      setService(data);
    } catch (err) {
      console.error('Error fetching service:', err);
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    if (!service) return;
    const message = encodeURIComponent(`Hola, me interesa el servicio de ${service.title}. Me gustaría obtener más información.`);
    window.open(`https://wa.me/573103688201?text=${message}`, '_blank');
  };

  const handleEmail = () => {
    if (!service) return;
    const subject = encodeURIComponent(`Solicitud de cita: ${service.title}`);
    const body = encodeURIComponent(`Hola, me interesa agendar una cita para el servicio de ${service.title}.`);
    window.location.href = `mailto:fc@fabiocanchila.com?subject=${subject}&body=${body}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              {service.title}
            </h1>

            <div className="prose prose-lg max-w-none text-gray-700 mb-8">
              <p className="text-xl text-gray-600 mb-6">
                {service.description}
              </p>
              {service.content}
            </div>

            {/* Botones de contacto */}
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEmail}
                  className="flex items-center justify-center px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  <span>Gestionar Cita</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWhatsApp}
                  className="flex items-center justify-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  <span>Consultar por WhatsApp</span>
                </motion.button>
              </div>

              {/* Tiempo de respuesta */}
              <div className="flex items-center justify-center text-sm text-gray-500 bg-gray-50 py-3 rounded-lg">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                <span>Tiempo de respuesta promedio: 5 minutos</span>
              </div>
            </div>

            {/* Recursos adicionales */}
            {service.youtube_url && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Recursos Adicionales
                </h2>
                <a
                  href={service.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
                >
                  <Youtube className="h-5 w-5 mr-2" />
                  Ver recursos en YouTube
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </article>
    </div>
  );
}