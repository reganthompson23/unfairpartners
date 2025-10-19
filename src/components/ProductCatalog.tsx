import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Product = Database['public']['Tables']['products']['Row'];
type ProductVariant = Database['public']['Tables']['product_variants']['Row'];

interface ProductWithVariants extends Product {
  variants: ProductVariant[];
}

export default function ProductCatalog() {
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('name');

      if (productsError) throw productsError;

      const productsWithVariants = await Promise.all(
        (productsData || []).map(async (product) => {
          const { data: variants, error: variantsError } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', product.id)
            .eq('is_available', true)
            .order('sort_order');

          if (variantsError) throw variantsError;

          return {
            ...product,
            variants: variants || []
          };
        })
      );

      setProducts(productsWithVariants.filter(p => p.variants.length > 0));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (variantId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[variantId] || 0;
      const newValue = Math.max(0, current + delta);
      return { ...prev, [variantId]: newValue };
    });
  };

  const handleAddToCart = (product: ProductWithVariants) => {
    product.variants.forEach((variant) => {
      const quantity = quantities[variant.id] || 0;
      if (quantity > 0) {
        // Extract only the Product fields, excluding the variants array
        const { variants: _, ...productData } = product;
        addToCart({ product: productData, variant }, quantity);
      }
    });

    const resetQuantities = product.variants.reduce((acc, variant) => {
      acc[variant.id] = 0;
      return acc;
    }, {} as Record<string, number>);

    setQuantities((prev) => ({ ...prev, ...resetQuantities }));
  };

  const getTotalQuantityForProduct = (product: ProductWithVariants): number => {
    return product.variants.reduce((total, variant) => {
      return total + (quantities[variant.id] || 0);
    }, 0);
  };

  const getPriceRange = (variants: ProductVariant[]): { minWholesale: number; maxWholesale: number; minRrp: number; maxRrp: number } => {
    const wholesalePrices = variants.map(v => v.wholesale_price);
    const rrpPrices = variants.map(v => v.rrp_price);
    return {
      minWholesale: Math.min(...wholesalePrices),
      maxWholesale: Math.max(...wholesalePrices),
      minRrp: Math.min(...rrpPrices),
      maxRrp: Math.max(...rrpPrices)
    };
  };

  const getProductImages = (product: Product): string[] => {
    const images: string[] = [];
    if (product.image_url) {
      if (product.image_url.includes(',')) {
        images.push(...product.image_url.split(',').map(url => url.trim()));
      } else {
        images.push(product.image_url);
      }
    }
    if (product.image_urls && Array.isArray(product.image_urls)) {
      images.push(...product.image_urls);
    }
    return images;
  };

  const navigateImage = (productId: string, direction: 'prev' | 'next', totalImages: number) => {
    setCurrentImageIndex((prev) => {
      const current = prev[productId] || 0;
      if (direction === 'next') {
        return { ...prev, [productId]: (current + 1) % totalImages };
      } else {
        return { ...prev, [productId]: current === 0 ? totalImages - 1 : current - 1 };
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-400">Loading products...</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-400">No products available at the moment.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {products.map((product) => {
        const images = getProductImages(product);
        const currentIndex = currentImageIndex[product.id] || 0;

        return (
          <div
            key={product.id}
            className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-colors"
          >
            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:w-3/5 relative bg-zinc-800">
                {images.length > 0 ? (
                  <div className="flex flex-col">
                    <div className="overflow-hidden flex items-center justify-center bg-black">
                      <img
                        src={images[currentIndex]}
                        alt={`${product.name} - Image ${currentIndex + 1}`}
                        className="w-full h-auto"
                      />
                    </div>
                    {images.length > 1 && (
                      <div className="bg-zinc-900 p-4 flex gap-2 overflow-x-auto">
                        {images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex((prev) => ({ ...prev, [product.id]: idx }))}
                            className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                              idx === currentIndex ? 'border-white scale-105' : 'border-zinc-700 hover:border-zinc-500 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={img}
                              alt={`${product.name} - Thumbnail ${idx + 1}`}
                              className="h-20 w-auto"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-[16/9] flex items-center justify-center text-zinc-600">
                    No Image
                  </div>
                )}
              </div>

              <div className="flex-1 p-6 flex flex-col">
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-white mb-3">{product.name}</h3>
                  <p className="text-zinc-300 leading-relaxed mb-6 whitespace-pre-line">{product.description}</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    {product.variants.map((variant) => {
                      const quantity = quantities[variant.id] || 0;

                      return (
                        <div key={variant.id} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm">{variant.name}</p>
                          </div>
                          <div className="flex items-center bg-zinc-800 rounded-lg border border-zinc-700">
                            <button
                              onClick={() => updateQuantity(variant.id, -1)}
                              className="p-2 hover:bg-zinc-700 transition-colors"
                              disabled={quantity === 0}
                            >
                              <Minus className="w-3 h-3 text-zinc-400" />
                            </button>
                            <input
                              type="number"
                              value={quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setQuantities((prev) => ({ ...prev, [variant.id]: Math.max(0, val) }));
                              }}
                              className="w-12 text-center bg-transparent text-white text-sm focus:outline-none"
                              min="0"
                            />
                            <button
                              onClick={() => updateQuantity(variant.id, 1)}
                              className="p-2 hover:bg-zinc-700 transition-colors"
                            >
                              <Plus className="w-3 h-3 text-zinc-400" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">RRP USD</p>
                      <p className="text-2xl font-bold text-zinc-400">
                        ${product.variants[0].rrp_price.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">W/S USD</p>
                      <p className="text-2xl font-bold text-white">
                        ${product.variants[0].wholesale_price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={getTotalQuantityForProduct(product) === 0}
                    className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-3 px-6 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
