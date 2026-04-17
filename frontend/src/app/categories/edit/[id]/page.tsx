'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CategoryForm from '@/components/CategoryForm';
import { categoryApi } from '@/lib/api';

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [category, setCategory] = useState<{ id: number; name: string; description?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await categoryApi.getCategoryById(parseInt(params.id, 10));
        setCategory(data);
      } catch (error) {
        console.error('Error fetching category:', error);
        setMessage({ text: 'Failed to load category data.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [params.id]);

  const handleSubmit = async (data: { name: string; description?: string }) => {
    try {
      setIsSubmitting(true);
      await categoryApi.updateCategory(parseInt(params.id, 10), data);
      setMessage({ text: 'Category updated successfully!', type: 'success' });
      setTimeout(() => {
        router.push('/categories');
      }, 1500);
    } catch (error) {
      console.error('Error updating category:', error);
      setMessage({ text: 'Failed to update category. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/categories" className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Categories
      </Link>

      <section className="editorial-panel">
        <p className="eyebrow">Edit Category</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-slate-900 md:text-5xl">{loading ? 'Category' : category?.name || 'Category'}</h1>
      </section>

      {message.text && (
        <div className={`rounded-[1.5rem] px-5 py-4 text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <section className="editorial-panel">
        {loading ? (
          <div className="space-y-4 py-4">
            <div className="skeleton h-32 rounded-[1.5rem]" />
            <div className="skeleton h-40 rounded-[1.5rem]" />
            <div className="skeleton h-28 rounded-[1.5rem]" />
          </div>
        ) : category ? (
          <CategoryForm initialData={category} onSubmit={handleSubmit} isEditing={true} isSubmitting={isSubmitting} />
        ) : (
          <div className="rounded-[1.5rem] bg-slate-100/70 px-5 py-16 text-center">
            <p className="text-slate-900">Category not found</p>
            <Link href="/categories" className="link mt-3 inline-flex">Return to categories</Link>
          </div>
        )}
      </section>
    </div>
  );
}
