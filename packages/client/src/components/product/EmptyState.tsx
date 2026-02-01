import { useSearchParams } from 'react-router-dom';
import { Package, Search, Filter } from 'lucide-react';
import { Button } from '../ui/button';

interface EmptyStateProps {
  type: 'no-products' | 'no-results' | 'no-matches';
}

export function EmptyState({ type }: EmptyStateProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const clearFilters = () => {
    const newParams = new URLSearchParams();
    const q = searchParams.get('q');
    if (q) newParams.set('q', q);
    setSearchParams(newParams, { replace: true });
  };

  const clearSearch = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const configs = {
    'no-products': {
      icon: Package,
      title: 'No products available',
      description: 'There are currently no products in the system.',
      action: null,
    },
    'no-results': {
      icon: Search,
      title: 'No results found',
      description: "We couldn't find any products matching your search query.",
      action: (
        <Button onClick={clearSearch} variant="outline">
          Clear search
        </Button>
      ),
    },
    'no-matches': {
      icon: Filter,
      title: 'No matches found',
      description:
        'No products match your current filters. Try adjusting your filter criteria.',
      action: (
        <Button onClick={clearFilters} variant="outline">
          Clear filters
        </Button>
      ),
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{config.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{config.description}</p>
      {config.action && <div className="mt-4">{config.action}</div>}
    </div>
  );
}
