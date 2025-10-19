import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Eye, EyeOff, Trash2, X, Image as ImageIcon, Upload, GripVertical } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductVariant = Database['public']['Tables']['product_variants']['Row'];
type ProductVariantInsert = Database['public']['Tables']['product_variants']['Insert'];

interface ProductWithVariants extends Product {
  variants: ProductVariant[];
}

export default function ProductManagement() {
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithVariants | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (productsError) throw productsError;

      const productsWithVariants = await Promise.all(
        (productsData || []).map(async (product) => {
          const { data: variants, error: variantsError } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', product.id)
            .order('sort_order');

          if (variantsError) throw variantsError;

          return {
            ...product,
            variants: variants || []
          };
        })
      );

      setProducts(productsWithVariants);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (product: ProductWithVariants) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_available: !product.is_available })
        .eq('id', product.id);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, is_available: !p.is_available } : p
        )
      );
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Failed to update product availability');
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This will also delete all variants.')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleEdit = (product: ProductWithVariants) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (loading) {
    return <div className="text-zinc-400">Loading products...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Product Management</h2>
          <p className="text-sm text-zinc-400">Manage your wholesale product catalog</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-white text-black font-semibold py-2 px-4 rounded-lg hover:bg-zinc-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleCloseForm}
          onSuccess={() => {
            handleCloseForm();
            fetchProducts();
          }}
        />
      )}

      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-6"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {product.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      product.is_available
                        ? 'bg-green-950 text-green-400'
                        : 'bg-red-950 text-red-400'
                    }`}
                  >
                    {product.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <p className="text-sm text-zinc-400 mb-3">{product.description}</p>

                {product.variants.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-zinc-500 font-semibold uppercase">Variants ({product.variants.length})</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {product.variants.map((variant) => (
                        <div
                          key={variant.id}
                          className="bg-zinc-800 rounded p-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white font-medium">{variant.name}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-xs ${
                                variant.is_available
                                  ? 'bg-green-950 text-green-400'
                                  : 'bg-red-950 text-red-400'
                              }`}
                            >
                              {variant.is_available ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="text-zinc-400 mt-1">
                            SKU: {variant.sku}
                          </div>
                          <div className="flex gap-3 mt-1">
                            <span className="text-zinc-300">W/S: ${variant.wholesale_price.toFixed(2)}</span>
                            <span className="text-zinc-500">RRP: ${variant.rrp_price.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {product.image_urls && product.image_urls.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-zinc-500 font-semibold uppercase mb-2">Images ({product.image_urls.length})</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {product.image_urls.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`${product.name} - ${idx + 1}`}
                          className="h-16 w-auto rounded border border-zinc-700"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleAvailability(product)}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                  title={product.is_available ? 'Mark as unavailable' : 'Mark as available'}
                >
                  {product.is_available ? (
                    <Eye className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-zinc-400" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(product)}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                  title="Edit product"
                >
                  <Edit2 className="w-4 h-4 text-zinc-400" />
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="p-2 bg-zinc-800 hover:bg-red-900 rounded-lg transition-colors"
                  title="Delete product"
                >
                  <Trash2 className="w-4 h-4 text-zinc-400 hover:text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
            <ImageIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400">No products yet. Add your first product to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface ProductFormProps {
  product: ProductWithVariants | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface VariantFormData {
  id?: string;
  name: string;
  sku: string;
  wholesale_price: number;
  rrp_price: number;
  is_available: boolean;
  sort_order: number;
}

function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState<Omit<ProductInsert, 'id'>>({
    name: product?.name || '',
    description: product?.description || '',
    sku: product?.sku || '',
    rrp_price: product?.rrp_price || 0,
    wholesale_price: product?.wholesale_price || 0,
    image_url: product?.image_url || '',
    image_urls: product?.image_urls || [],
    is_available: product?.is_available ?? true,
  });

  const [variants, setVariants] = useState<VariantFormData[]>(
    product?.variants.map((v, idx) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      wholesale_price: v.wholesale_price,
      rrp_price: v.rrp_price,
      is_available: v.is_available,
      sort_order: v.sort_order
    })) || [
      {
        name: '',
        sku: '',
        wholesale_price: 0,
        rrp_price: 0,
        is_available: true,
        sort_order: 0
      }
    ]
  );

  const [uploadingImages, setUploadingImages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImages = async (files: FileList) => {
    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        image_urls: [...(prev.image_urls || []), ...uploadedUrls]
      }));
    } catch (error: any) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images: ' + error.message);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadImages(e.target.files);
    }
  };

  const removeImageUrl = async (index: number) => {
    const imageUrl = formData.image_urls?.[index];
    if (imageUrl) {
      try {
        const urlParts = imageUrl.split('product-images/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1].split('?')[0];
          await supabase.storage
            .from('product-images')
            .remove([filePath]);
        }
      } catch (error) {
        console.error('Error deleting image from storage:', error);
      }
    }

    setFormData(prev => ({
      ...prev,
      image_urls: (prev.image_urls || []).filter((_, idx) => idx !== index)
    }));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const images = [...(formData.image_urls || [])];
    const draggedImage = images[draggedIndex];
    images.splice(draggedIndex, 1);
    images.splice(index, 0, draggedImage);

    setFormData(prev => ({ ...prev, image_urls: images }));
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const addVariant = () => {
    setVariants(prev => [
      ...prev,
      {
        name: '',
        sku: '',
        wholesale_price: 0,
        rrp_price: 0,
        is_available: true,
        sort_order: prev.length
      }
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) {
      alert('Products must have at least one variant');
      return;
    }
    setVariants(prev => prev.filter((_, idx) => idx !== index));
  };

  const updateVariant = (index: number, field: keyof VariantFormData, value: any) => {
    setVariants(prev => prev.map((v, idx) =>
      idx === index ? { ...v, [field]: value } : v
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (variants.some(v => !v.name || !v.sku)) {
        alert('All variants must have a name and SKU');
        setSaving(false);
        return;
      }

      let productId = product?.id;

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', product.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(formData)
          .select()
          .single();

        if (error) throw error;
        productId = data.id;
      }

      if (productId) {
        if (product) {
          const { error: deleteError } = await supabase
            .from('product_variants')
            .delete()
            .eq('product_id', productId);

          if (deleteError) throw deleteError;
        }

        const variantsToInsert = variants.map((v, idx) => ({
          product_id: productId,
          name: v.name,
          sku: v.sku,
          wholesale_price: v.wholesale_price,
          rrp_price: v.rrp_price,
          is_available: v.is_available,
          sort_order: idx
        }));

        const { error: variantsError } = await supabase
          .from('product_variants')
          .insert(variantsToInsert);

        if (variantsError) throw variantsError;
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(error.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-4">
          {product ? 'Edit Product' : 'Add New Product'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-zinc-300 uppercase">Product Details</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-zinc-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_available" className="text-sm text-zinc-300">
                  Available for purchase
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-zinc-600"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-zinc-300 uppercase">Product Images</h4>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImages}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {uploadingImages ? 'Uploading...' : 'Upload Images'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <p className="text-xs text-zinc-500">Drag and drop images to reorder them</p>

            {(formData.image_urls && formData.image_urls.length > 0) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {formData.image_urls.map((url, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    className="relative group cursor-move"
                  >
                    <div className="absolute top-1 left-1 p-1 bg-zinc-900 bg-opacity-75 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-3 h-3 text-zinc-400" />
                    </div>
                    <img
                      src={url}
                      alt={`Product ${idx + 1}`}
                      className="w-full h-24 object-cover rounded border border-zinc-700"
                    />
                    <button
                      type="button"
                      onClick={() => removeImageUrl(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-zinc-300 uppercase">Product Variants</h4>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-1 text-sm px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add Variant
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((variant, idx) => (
                <div key={idx} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-zinc-400">Variant {idx + 1}</span>
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">
                        Variant Name *
                      </label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                        required
                        placeholder="e.g., 12 Pack"
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">
                        SKU *
                      </label>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                        required
                        placeholder="e.g., PROD-12PK"
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">
                        Wholesale Price *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={variant.wholesale_price}
                        onChange={(e) => updateVariant(idx, 'wholesale_price', parseFloat(e.target.value) || 0)}
                        required
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">
                        RRP Price *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={variant.rrp_price}
                        onChange={(e) => updateVariant(idx, 'rrp_price', parseFloat(e.target.value) || 0)}
                        required
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-600"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`variant_available_${idx}`}
                        checked={variant.is_available}
                        onChange={(e) => updateVariant(idx, 'is_available', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label htmlFor={`variant_available_${idx}`} className="text-xs text-zinc-300">
                        Available
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-white text-black font-semibold py-2 px-4 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 text-white py-2 px-4 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
