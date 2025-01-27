import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types';
import ProductEditor from './ProductEditor';

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setProducts(products.filter(product => product.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleTogglePublish = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ published: !product.published })
        .eq('id', product.id);

      if (error) throw error;
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, published: !p.published } : p
      ));
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  if (isEditing) {
    return (
      <ProductEditor
        product={selectedProduct}
        onSave={async () => {
          setIsEditing(false);
          await fetchProducts();
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">Publicaciones</h2>
        <button
          onClick={() => {
            setSelectedProduct(null);
            setIsEditing(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Publicación
        </button>
      </div>

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Título</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
              <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                  {product.title}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {product.published ? 'Publicado' : 'Borrador'}
                  </span>
                </td>
                <td className="relative py-4 pl-3 pr-4 text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleTogglePublish(product)}
                      className="text-gray-400 hover:text-gray-500"
                      title={product.published ? 'Despublicar' : 'Publicar'}
                    >
                      {product.published ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsEditing(true);
                      }}
                      className="text-primary hover:text-primary-dark"
                      title="Editar"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-400 hover:text-red-500"
                      title="Eliminar"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No hay publicaciones aún. ¡Crea la primera!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}