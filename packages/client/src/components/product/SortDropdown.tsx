import { useSearchParams } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export function SortDropdown() {
  const [searchParams, setSearchParams] = useSearchParams();

  const sort = searchParams.get('sort') || 'relevance';
  const method = searchParams.get('method') || 'desc';
  const sortValue = `${sort}-${method}`;

  const updateSort = (value: string) => {
    const [newSort, newMethod] = value.split('-');
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', newSort);
    newParams.set('method', newMethod);
    newParams.set('page', '1');
    setSearchParams(newParams, { replace: true });
  };

  return (
    <Select value={sortValue} onValueChange={updateSort}>
      <SelectTrigger className="w-50">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="relevance-desc">Relevance</SelectItem>
        <SelectItem value="price-asc">Price: Low to High</SelectItem>
        <SelectItem value="price-desc">Price: High to Low</SelectItem>
        <SelectItem value="created_at-desc">Newest First</SelectItem>
        <SelectItem value="created_at-asc">Oldest First</SelectItem>
        <SelectItem value="rating-desc">Rating: High to Low</SelectItem>
        <SelectItem value="rating-asc">Rating: Low to High</SelectItem>
      </SelectContent>
    </Select>
  );
}
