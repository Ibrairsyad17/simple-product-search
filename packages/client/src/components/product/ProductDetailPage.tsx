import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useGetProduct } from '../../hooks/api/useGetProduct';
import { ProductDetailSkeleton } from './ProductDetailSkeleton';
import { Header } from '../layout/Header';
import { Button } from '../ui/button';
import { ArrowLeft, Star, Package, CheckCircle } from 'lucide-react';
import { formatPrice, formatDate } from '../../utils/formatters';
import { useState } from 'react';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: product, isLoading, error } = useGetProduct(id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleBack = () => {
    const previousPath = (location.state as { from?: string })?.from;
    if (previousPath) {
      navigate(previousPath);
    } else {
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <ProductDetailSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="mx-auto min-h-screen max-w-7xl p-4">
          <Button variant="ghost" onClick={handleBack} className="mb-6">
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center text-destructive">
            <h2 className="text-xl font-semibold">Product not found</h2>
            <p className="mt-2 text-sm">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return null;
  }

  const selectedImage =
    product.images[selectedImageIndex]?.url || '/placeholder-product.png';

  return (
    <>
      <Header />
      <div className="mx-auto min-h-screen max-w-7xl p-4">
        <Button variant="ghost" onClick={handleBack} className="mb-6">
          <ArrowLeft className="mr-2 size-4" />
          Back to results
        </Button>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Images */}
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border bg-muted">
              <img
                src={selectedImage}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`overflow-hidden rounded-lg border-2 transition-colors ${
                      index === selectedImageIndex
                        ? 'border-primary'
                        : 'border-transparent hover:border-muted-foreground/50'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="aspect-square w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="size-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-muted-foreground">•</span>
                {product.inStock ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="size-4" />
                    <span className="text-sm font-medium">In Stock</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Package className="size-4" />
                    <span className="text-sm font-medium">Out of Stock</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-3xl font-bold">
              {formatPrice(product.price)}
            </div>

            <div>
              <h2 className="mb-2 text-lg font-semibold">Description</h2>
              <p className="whitespace-pre-line text-muted-foreground">
                {product.description}
              </p>
            </div>

            {product.categories.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-semibold">Categories</h2>
                <div className="flex flex-wrap gap-2">
                  {product.categories.map((category) => (
                    <span
                      key={category.id}
                      className="rounded-full bg-secondary px-3 py-1 text-xs font-medium"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4 text-xs text-muted-foreground">
              <p>Created: {formatDate(product.createdAt)}</p>
              <p>Last updated: {formatDate(product.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
