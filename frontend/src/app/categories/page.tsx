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
        setCategories(categories.filter((c: any) => c.id !== id));
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Categories</h1>
          <p className="text-slate-500 mt-1">Organize expenses by category</p>
        </div>
        <Link href="/categories/add" className="btn btn-primary shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </Link>
      </div>

      <div className="card-static">
        {loading ? (
          <div className="space-y-3 py-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-12 w-full" />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="table-container">
            <table className="table-default">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Name</th>
                  <th className="table-header-cell">Description</th>
                  <th className="table-header-cell text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {categories.map((category: any) => (
                  <tr key={category.id} className="table-row">
                    <td className="table-cell font-medium text-slate-800">{category.name}</td>
                    <td className="table-cell text-slate-500">{category.description || '—'}</td>
                    <td className="table-cell text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/categories/edit/${category.id}`} className="btn btn-ghost py-1.5 px-2 text-sm">Edit</Link>
                        <button onClick={() => handleDeleteCategory(category.id)} className="btn btn-ghost py-1.5 px-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">No categories yet</p>
            <p className="text-slate-500 text-sm mt-1">Add categories to organize your expenses</p>
            <Link href="/categories/add" className="btn btn-primary mt-4 inline-flex">Add Category</Link>
          </div>
        )}
      </div>
    </div>
  );
}
