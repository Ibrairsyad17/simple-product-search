import { useSearchParams } from 'react-router-dom';
import { useSearchProducts } from '../../hooks/api/useSearchProducts';
import { SearchInput } from './SearchInput';
import { FilterPanel } from './FilterPanel';
import { SortDropdown } from './SortDropdown';
import { ProductGrid } from './ProductGrid';
import { ProductGridSkeleton } from './ProductGridSkeleton';
import { EmptyState } from './EmptyState';
import { PaginationControls } from './PaginationControls';
import { Header } from '../layout/Header';
import { Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';

export function ProductSearchPage() {
  const [searchParams] = useSearchParams();
  const { data, isLoading, error } = useSearchProducts();
  const [showFilters, setShowFilters] = useState(false);

  const hasSearchQuery = searchParams.get('q');
  const hasFilters =
    searchParams.getAll('category').length > 0 ||
    searchParams.get('minPrice') ||
    searchParams.get('maxPrice') ||
    searchParams.get('inStock');

  const getEmptyStateType = () => {
    if (!data?.data || data.data.length === 0) {
      if (hasSearchQuery && !hasFilters) return 'no-results';
      if (hasFilters) return 'no-matches';
      return 'no-products';
    }
    return null;
  };

  const emptyStateType = getEmptyStateType();

  return (
    <>
      <Header />
      <div className="mx-auto min-h-screen max-w-7xl p-4">
        <div className="mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <SearchInput />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="md:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Menu className="mr-2 size-4" />
                Filters
              </Button>
              <SortDropdown />
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden w-64 shrink-0 md:block">
            <div className="sticky top-4 rounded-lg border bg-card p-4">
              <FilterPanel />
            </div>
          </aside>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
              <div className="fixed inset-y-0 left-0 w-80 border-r bg-card p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    Close
                  </Button>
                </div>
                <FilterPanel />
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="min-w-0 flex-1">
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                <p className="font-semibold">Error loading products</p>
                <p className="text-sm">
                  {error instanceof Error ? error.message : 'Unknown error'}
                </p>
              </div>
            )}

            {isLoading && <ProductGridSkeleton />}

            {!isLoading && !error && emptyStateType && (
              <EmptyState type={emptyStateType} />
            )}

            {!isLoading && !error && data && data.data.length > 0 && (
              <div className="space-y-6">
                <ProductGrid products={data.data} />
                <PaginationControls
                  currentPage={data.pagination.page}
                  totalPages={data.pagination.totalPages}
                  total={data.pagination.total}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
