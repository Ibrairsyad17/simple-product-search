import { Link } from 'react-router-dom';
import type { Product } from '../../types/product';
import { formatPrice } from '../../utils/formatters';
import { Star, Package } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images[0]?.url || '/placeholder-product.png';

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={product.name}
          className="size-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3 fill-yellow-400 text-yellow-400" />
          <span>{product.rating.toFixed(1)}</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">{formatPrice(product.price)}</p>
          {!product.inStock && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Package className="size-3" />
              <span>Out of stock</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
