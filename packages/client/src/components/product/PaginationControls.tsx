import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePagination } from '../../hooks/miscellaneous/usePagination';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  total: number;
}

export function PaginationControls({
  currentPage,
  totalPages,
  total,
}: PaginationControlsProps) {
  const { goToPage, getPageNumbers } = usePagination(currentPage, totalPages);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t pt-4">
      <p className="text-sm text-muted-foreground">
        Showing{' '}
        <span className="font-medium">
          {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, total)}
        </span>{' '}
        of <span className="font-medium">{total}</span> results
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="size-4" />
        </Button>

        {getPageNumbers().map((page, index) =>
          typeof page === 'number' ? (
            <Button
              key={index}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => goToPage(page)}
              className="min-w-10"
            >
              {page}
            </Button>
          ) : (
            <span key={index} className="px-2 text-muted-foreground">
              {page}
            </span>
          )
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
