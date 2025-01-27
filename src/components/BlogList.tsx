import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import type { BlogPost, BlogCategory } from '../types';

export default function BlogList() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchPosts();

    // Suscribirse a cambios en las tablas relacionadas con el blog
    const channel = supabase
      .channel('blog_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => fetchPosts()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blog_categories'
        },
        () => {
          fetchCategories();
          fetchPosts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blog_post_categories'
        },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          content,
          cover_image,
          published,
          created_at,
          reading_time,
          blog_post_categories (
            category:blog_categories (
              id,
              name,
              slug
            )
          )
        `)
        .eq('published', true);

      if (selectedCategory) {
        query = query.eq('blog_post_categories.category.id', selectedCategory);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Transformar los datos para agrupar las categorías por post
      const transformedPosts = data.map(post => ({
        ...post,
        categories: post.blog_post_categories
          ?.map(bpc => bpc.category)
          .filter(Boolean) || []
      }));

      setPosts(transformedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('No se pudieron cargar los posts. Por favor, intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre las últimas tendencias y consejos sobre estrategia empresarial y desarrollo profesional
          </p>
        </div>

        {/* Categorías */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full transition-colors ${
                !selectedCategory
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-primary hover:text-white'
              }`}
            >
              Todas las categorías
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-primary hover:text-white'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Posts */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden h-full transform hover:translate-y-[-4px] transition-transform duration-300"
              >
                <Link to={`/blog/${post.slug}`} className="flex flex-col h-full">
                  <div className="relative">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                    {post.categories && post.categories.length > 0 && (
                      <div className="absolute top-4 right-4 flex gap-2">
                        {post.categories.map(category => (
                          <span
                            key={category.id}
                            className="bg-primary text-white text-sm px-3 py-1 rounded-full"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-grow p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <time dateTime={post.created_at}>
                        {format(new Date(post.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                      </time>
                      {post.reading_time && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{post.reading_time} min lectura</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto">
                      <span className="text-primary hover:text-primary-dark font-medium inline-flex items-center group">
                        Leer más
                        <svg
                          className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">
              No hay posts publicados {selectedCategory ? 'en esta categoría' : 'todavía'}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}