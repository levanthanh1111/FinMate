'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

type CategoryFormProps = {
  initialData?: { id?: number; name: string; description?: string };
  onSubmit: (data: { name: string; description?: string }) => void;
  isEditing?: boolean;
  isSubmitting?: boolean;
};

export default function CategoryForm({ initialData, onSubmit, isEditing = false, isSubmitting = false }: CategoryFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description || ''
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="rounded-[1.5rem] bg-slate-100/70 p-5 md:p-6">
        <label htmlFor="name" className="form-label">Name</label>
        <input
          id="name"
          type="text"
          className="form-input"
          placeholder="Category name"
          {...register('name', { required: 'Name is required' })}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>
        )}
      </div>

      <div className="rounded-[1.5rem] bg-slate-100/70 p-5 md:p-6">
        <label htmlFor="description" className="form-label">Description (Optional)</label>
        <textarea
          id="description"
          className="form-input min-h-32 resize-y"
          rows={4}
          placeholder="Description"
          {...register('description')}
        />
      </div>

      <div className="rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(243,244,245,0.9)_0%,rgba(255,255,255,0.9)_100%)] p-5 md:p-6">
        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary w-full md:w-auto" disabled={isSubmitting}>
            {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Category' : 'Add Category')}
          </button>
        </div>
      </div>
    </form>
  );
}
