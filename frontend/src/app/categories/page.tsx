'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { categoryApi } from '@/lib/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryApi.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryApi.deleteCategory(id);
        setCategories(categories.filter((category: any) => category.id !== id));
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const categoriesWithDescription = categories.filter((category) => category.description);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="editorial-panel">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Categories</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Categories</h2>
            </div>
            <Link href="/categories/add" className="btn btn-primary">New Category</Link>
          </div>

          {loading ? (
            <div className="mt-6 space-y-3 py-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="skeleton h-20 rounded-[1.5rem]" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="mt-6 space-y-3">
              {categories.map((category: any) => (
                <div key={category.id} className="grid gap-4 rounded-[1.5rem] bg-white px-5 py-5 shadow-[0_10px_30px_rgba(25,28,29,0.04)] md:grid-cols-[0.9fr_1.7fr_0.7fr] md:items-center">
                  <div>
                    <p className="eyebrow text-[10px] text-slate-400">Name</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{category.name}</p>
                  </div>
                  <div>
                    <p className="eyebrow text-[10px] text-slate-400">Description</p>
                    <p className="mt-2 text-sm text-slate-500">{category.description || '-'}</p>
                  </div>
                  <div className="flex items-center gap-2 md:justify-end">
                    <Link href={`/categories/edit/${category.id}`} className="btn btn-ghost px-3 py-2 text-sm">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="rounded-full px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[1.5rem] bg-slate-100/70 px-5 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white">
                <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <p className="mt-5 text-lg font-medium text-slate-900">No categories yet</p>
              <Link href="/categories/add" className="btn btn-primary mt-5 inline-flex">
                Add Category
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="editorial-panel bg-[linear-gradient(180deg,rgba(243,244,245,0.92)_0%,rgba(255,255,255,0.92)_100%)]">
            <p className="eyebrow">Overview</p>
            <div className="mt-2 grid gap-4 md:grid-cols-2">
              <div className="editorial-subpanel">
                <p className="eyebrow">With Descriptions</p>
                <p className="mt-4 font-[family:var(--font-manrope)] text-4xl font-semibold tracking-[-0.05em] text-slate-900">
                  {categoriesWithDescription.length}
                </p>
              </div>
              <div className="editorial-subpanel">
                <p className="eyebrow">Unnamed Patterns</p>
                <p className="mt-4 font-[family:var(--font-manrope)] text-4xl font-semibold tracking-[-0.05em] text-slate-900">
                  {categories.length - categoriesWithDescription.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
