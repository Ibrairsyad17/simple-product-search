import { useSearchParams } from 'react-router-dom';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useGetCategories } from '../../hooks/api/useGetCategories';
import { Skeleton } from '../ui/skeleton';
import { X } from 'lucide-react';

export function FilterPanel() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 size-3" />
            Clear all
          </Button>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Categories</Label>
        {categoriesLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : (
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {categories?.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={category.id}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => toggleCategory(category.id)}
                />
                <label
                  htmlFor={category.id}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Price Range</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => updateFilter('minPrice', e.target.value)}
            className="w-full"
            min="0"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
            className="w-full"
            min="0"
          />
        </div>
      </div>

      {/* In Stock */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="inStock"
          checked={inStock}
          onCheckedChange={(checked) => updateFilter('inStock', checked)}
        />
        <label
          htmlFor="inStock"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          In Stock Only
        </label>
      </div>
    </div>
  );
}
