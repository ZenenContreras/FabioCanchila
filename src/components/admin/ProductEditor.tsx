import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types';
import ImageUpload from './ImageUpload';

interface ProductEditorProps {
  product?: Product | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProductEditor({ product, onSave, onCancel }: ProductEditorProps) {
  const [title, setTitle] = useState(product?.title || '');
  const [description, setDescription] = useState(product?.description || '');
  const [imageUrl, setImageUrl] = useState(product?.image_url || '');
  const [ebookUrl, setEbookUrl] = useState(product?.ebook_url || '');
  const [physicalUrl, setPhysicalUrl] = useState(product?.physical_url || '');
  const [published, setPublished] = useState(product?.published || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      setError('La imagen es requerida');
      return;
    }
    if (!ebookUrl && !physicalUrl) {
      setError('Debe proporcionar al menos una URL (Ebook o Libro Físico)');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const productData = {
        title,
        slug,
        description,
        image_url: imageUrl,
        ebook_url: ebookUrl || null,
        physical_url: physicalUrl || null,
        published,
      };

      let result;
      if (product) {
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();
      }

      if (result.error) throw result.error;
      onSave();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={onCancel}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {product ? 'Editar Publicación' : 'Nueva Publicación'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Título
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagen
          </label>
          <ImageUpload
            onImageUploaded={setImageUrl}
            currentImage={imageUrl}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            URL del Ebook
          </label>
          <input
            type="url"
            value={ebookUrl}
            onChange={(e) => setEbookUrl(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            placeholder="https://"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            URL del Libro Físico
          </label>
          <input
            type="url"
            value={physicalUrl}
            onChange={(e) => setPhysicalUrl(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            placeholder="https://"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Publicar inmediatamente
          </label>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            <Save className="h-5 w-5 mr-2" />
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}