import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Youtube, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import ServicesPage from './ServicesPage';

export default function Hero() {
  const [currentAllianceIndex, setCurrentAllianceIndex] = useState(0);
  const [currentCollabIndex, setCurrentCollabIndex] = useState(0);

  const alliances = [
    {
      name: "Corpoflorentino",
      logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80",
      description: "Alianza estratégica para el desarrollo empresarial"
    },
    {
      name: "EBA Academy",
      logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80",
      description: "Formación ejecutiva de alto nivel"
    },
    {
      name: "Metaverso Estatal",
      logo: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&q=80",
      description: "Innovación en educación virtual"
    }
  ];

  const collaborations = [
    {
      name: "Universidad de Puerto Rico",
      logo: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80"
    },
    {
      name: "CERPAI",
      logo: "https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?auto=format&fit=crop&q=80"
    }
  ];

  useEffect(() => {
    const allianceInterval = setInterval(() => {
      setCurrentAllianceIndex((current) => 
        current === alliances.length - 1 ? 0 : current + 1
      );
    }, 3000);

    const collabInterval = setInterval(() => {
      setCurrentCollabIndex((current) =>
        current === collaborations.length - 1 ? 0 : current + 1
      );
    }, 3000);

    return () => {
      clearInterval(allianceInterval);
      clearInterval(collabInterval);
    };
  }, []);

  return (
    <>
      <div className="relative min-h-[calc(100vh-5rem)] flex items-center">
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-16 pb-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Transforma tus <span className="text-primary">Sueños</span><br />
                en <span className="text-accent">Realidad</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
              Ayudo a personas y organizaciones a alcanzar su máximo potencial a través del "Canvas del Éxito y la Prosperidad".
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="#contact"
                  className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark transition-colors shadow-lg hover:shadow-xl"
                >
                  Agenda una consulta
                  <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
                </motion.a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative max-w-sm sm:max-w-md lg:max-w-lg mx-auto lg:mx-0"
            >
              <img
                src="https://media.licdn.com/dms/image/v2/D4E03AQHa3yNiph2JhA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1720208228895?e=1743033600&v=beta&t=ha5UMLDIvjEPSaxokcXCy4KdTh38yxy9BWSWWJzndNk"
                alt="Fabio Canchila"
                className="rounded-2xl shadow-2xl aspect-square object-cover w-full mix-blend-multiply transform hover:scale-105 transition-transform duration-300"
                style={{ mixBlendMode: 'multiply' }}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <ServicesPage showHeading={false} maxServices={3} />

      {/* Partners Section - Compact Carousels */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-1 gap-8">
            {/* Alianzas Estratégicas */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-4"
              >
                <h2 className="text-2xl font-bold text-gray-900">
                  Alianzas Estratégicas
                </h2>
              </motion.div>

              <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentAllianceIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-center p-4 h-20"
                  >
                    <img
                      src={alliances[currentAllianceIndex].logo}
                      alt={alliances[currentAllianceIndex].name}
                      className="w-14 h-14 object-cover rounded"
                    />
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900">
                        {alliances[currentAllianceIndex].name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {alliances[currentAllianceIndex].description}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
                  {alliances.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentAllianceIndex(index)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        index === currentAllianceIndex
                          ? 'bg-primary w-3'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Colaboraciones */}
            
            
          </div>
        </div>
      </section>
    </>
  );
}