import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Book, BookOpen } from 'lucide-react';
import { supabase, withRetry } from '../lib/supabase';
import type { Product } from '../types';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel('products_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => fetchProducts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await withRetry(() =>
        supabase
          .from('products')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false })
      );

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('No se pudieron cargar los productos. Por favor, intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-custom-gray-light pt-24 pb-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-custom-gray-light pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-custom-gray-light pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Publicaciones</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre recursos y herramientas para potenciar tu desarrollo personal y profesional
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transform hover:translate-y-[-4px] transition-transform duration-300"
              >
                <div>
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 mb-6 flex-grow">
                    {product.description}
                  </p>
                  <div className="space-y-3">
                    {product.ebook_url && (
                      <a
                        href={product.ebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors duration-200"
                      >
                        <BookOpen className="h-5 w-5 mr-2" />
                        Versión Digital
                      </a>
                    )}
                    {product.physical_url && (
                      <a
                        href={product.physical_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full px-6 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-md transition-colors duration-200"
                      >
                        <Book className="h-5 w-5 mr-2" />
                        Libro Físico
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">
              No hay productos publicados todavía.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}