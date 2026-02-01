import { useSearchParams } from 'react-router-dom';
import { useGetCategories } from '../api/useGetCategories';

export const useFilterPanel = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: categories, isLoading: categoriesLoading } = useGetCategories();

  const selectedCategories = searchParams.getAll('category');
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const inStock = searchParams.get('inStock') === 'true';

  const updateFilter = (key: string, value: string | boolean | null) => {
    const newParams = new URLSearchParams(searchParams);

    if (value === null || value === '' || value === false) {
      newParams.delete(key);
    } else {
      newParams.set(key, String(value));
    }

    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams, { replace: true });
  };

  const toggleCategory = (categoryId: string) => {
    const newParams = new URLSearchParams(searchParams);
    const current = newParams.getAll('category');

    if (current.includes(categoryId)) {
      newParams.delete('category');
      current
        .filter((id) => id !== categoryId)
        .forEach((id) => newParams.append('category', id));
    } else {
      newParams.append('category', categoryId);
    }

    newParams.set('page', '1');
    setSearchParams(newParams, { replace: true });
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams();
    const q = searchParams.get('q');
    if (q) newParams.set('q', q);
    setSearchParams(newParams, { replace: true });
  };

  const hasActiveFilters =
    selectedCategories.length > 0 || minPrice || maxPrice || inStock;

  return {
    categories,
    categoriesLoading,
    selectedCategories,
    minPrice,
    maxPrice,
    inStock,
    updateFilter,
    toggleCategory,
    clearFilters,
    hasActiveFilters,
  };
};
