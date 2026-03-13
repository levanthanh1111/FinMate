'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

type CategoryFormProps = {
  initialData?: { id?: number; name: string; description?: string };
  onSubmit: (data: { name: string; description?: string }) => void;
  isEditing?: boolean;
};

export default function CategoryForm({ initialData, onSubmit, isEditing = false }: CategoryFormProps) {
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
      <div>
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

      <div>
        <label htmlFor="description" className="form-label">Description (Optional)</label>
        <textarea
          id="description"
          className="form-input"
          rows={3}
          placeholder="Category description"
          {...register('description')}
        />
      </div>

      <div className="pt-2">
        <button type="submit" className="btn btn-primary w-full">
          {isEditing ? 'Update Category' : 'Add Category'}
        </button>
      </div>
    </form>
  );
}
