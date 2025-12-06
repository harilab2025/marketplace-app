'use client';
import React, { useState } from 'react';
import { Plus, X, Tag, Package, Edit, ArrowLeft, Clock, Barcode, Weight, Ruler, DollarSign, Archive, Percent, Calendar } from 'lucide-react';

export default function ProductManager() {
  const [view, setView] = useState('list');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    stock: 0,
    weight: '',
    categoryId: '',
    tags: [],
    isActive: true,
    description: {
      short: '',
      full: '',
      features: []
    },
    dimensions: {
      length: '',
      width: '',
      height: '',
      unit: 'cm'
    }
  });

  const [newTag, setNewTag] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [variants, setVariants] = useState([]);
  const [showVariants, setShowVariants] = useState(false);
  const [discounts, setDiscounts] = useState([]);
  const [showDiscounts, setShowDiscounts] = useState(false);

  const categories = [
    { id: 1, name: 'Elektronik' },
    { id: 2, name: 'Fashion' },
    { id: 3, name: 'Makanan' },
    { id: 4, name: 'Kesehatan' }
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      price: '',
      stock: 0,
      weight: '',
      categoryId: '',
      tags: [],
      isActive: true,
      description: {
        short: '',
        full: '',
        features: []
      },
      dimensions: {
        length: '',
        width: '',
        height: '',
        unit: 'cm'
      }
    });
    setVariants([]);
    setShowVariants(false);
    setDiscounts([]);
    setShowDiscounts(false);
    setNewTag('');
    setNewFeature('');
    setEditMode(false);
    setSelectedProduct(null);
  };

  const calculateDiscountedPrice = (price, discount) => {
    if (!discount || !discount.isActive) return price;
    
    const now = new Date();
    const start = new Date(discount.startDate);
    const end = new Date(discount.endDate);
    
    if (now < start || now > end) return price;
    
    if (discount.type === 'PERCENTAGE') {
      return price - (price * discount.value / 100);
    } else {
      return price - discount.value;
    }
  };

  const getActiveDiscount = (discountsList) => {
    if (!discountsList || discountsList.length === 0) return null;
    
    const now = new Date();
    return discountsList.find(d => {
      const start = new Date(d.startDate);
      const end = new Date(d.endDate);
      return d.isActive && now >= start && now <= end;
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDescriptionChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      description: {
        ...prev.description,
        [field]: value
      }
    }));
  };

  const handleDimensionChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [field]: value
      }
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        description: {
          ...prev.description,
          features: [...prev.description.features, newFeature.trim()]
        }
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      description: {
        ...prev.description,
        features: prev.description.features.filter((_, i) => i !== index)
      }
    }));
  };

  const addVariant = () => {
    setVariants(prev => [...prev, {
      id: Date.now(),
      name: '',
      sku: '',
      price: '',
      stock: 0,
      attributes: {},
      isActive: true,
      discounts: []
    }]);
  };

  const updateVariant = (id, field, value) => {
    setVariants(prev => prev.map(variant => 
      variant.id === id ? { ...variant, [field]: value } : variant
    ));
  };

  const removeVariant = (id) => {
    setVariants(prev => prev.filter(variant => variant.id !== id));
  };

  const addDiscount = (variantId = null) => {
    const newDiscount = {
      id: Date.now(),
      variantId: variantId,
      type: 'PERCENTAGE',
      value: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true
    };

    if (variantId) {
      setVariants(prev => prev.map(v => 
        v.id === variantId 
          ? { ...v, discounts: [...(v.discounts || []), newDiscount] }
          : v
      ));
    } else {
      setDiscounts(prev => [...prev, newDiscount]);
    }
  };

  const updateDiscount = (discountId, field, value, variantId = null) => {
    if (variantId) {
      setVariants(prev => prev.map(v => 
        v.id === variantId 
          ? {
              ...v,
              discounts: v.discounts.map(d => 
                d.id === discountId ? { ...d, [field]: value } : d
              )
            }
          : v
      ));
    } else {
      setDiscounts(prev => prev.map(d => 
        d.id === discountId ? { ...d, [field]: value } : d
      ));
    }
  };

  const removeDiscount = (discountId, variantId = null) => {
    if (variantId) {
      setVariants(prev => prev.map(v => 
        v.id === variantId 
          ? { ...v, discounts: v.discounts.filter(d => d.id !== discountId) }
          : v
      ));
    } else {
      setDiscounts(prev => prev.filter(d => d.id !== discountId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sku) {
      alert('Nama dan SKU produk harus diisi!');
      return;
    }

    const productData = {
      id: editMode ? selectedProduct.id : Date.now(),
      publicId: editMode ? selectedProduct.publicId : `cuid_${Date.now()}`,
      ...formData,
      price: formData.price ? parseFloat(formData.price) : null,
      stock: parseInt(formData.stock) || 0,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
      categoryName: formData.categoryId ? categories.find(c => c.id === parseInt(formData.categoryId))?.name : null,
      discounts: discounts.map(d => ({
        ...d,
        value: parseFloat(d.value) || 0
      })),
      variants: showVariants ? variants.map(v => ({
        ...v,
        price: parseFloat(v.price) || 0,
        stock: parseInt(v.stock) || 0,
        discounts: (v.discounts || []).map(d => ({
          ...d,
          value: parseFloat(d.value) || 0
        }))
      })) : [],
      createdAt: editMode ? selectedProduct.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editMode) {
      setProducts(prev => prev.map(p => p.id === productData.id ? productData : p));
    } else {
      setProducts(prev => [...prev, productData]);
    }

    setSelectedProduct(productData);
    setView('detail');
    resetForm();
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price || '',
      stock: product.stock,
      weight: product.weight || '',
      categoryId: product.categoryId || '',
      tags: product.tags || [],
      isActive: product.isActive,
      description: product.description || {
        short: '',
        full: '',
        features: []
      },
      dimensions: product.dimensions || {
        length: '',
        width: '',
        height: '',
        unit: 'cm'
      }
    });
    setVariants(product.variants || []);
    setShowVariants(product.variants && product.variants.length > 0);
    setDiscounts(product.discounts || []);
    setShowDiscounts(product.discounts && product.discounts.length > 0);
    setSelectedProduct(product);
    setEditMode(true);
    setView('form');
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      if (selectedProduct?.id === id) {
        setView('list');
        setSelectedProduct(null);
      }
    }
  };

  if (view === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Daftar Produk</h1>
                <p className="text-blue-100 mt-2">{products.length} produk tersedia</p>
              </div>
              <button
                onClick={() => setView('form')}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Tambah Produk
              </button>
            </div>

            <div className="p-8">
              {products.length === 0 ? (
                <div className="text-center py-16">
                  <Package size={64} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum Ada Produk</h3>
                  <p className="text-gray-500 mb-6">Mulai tambahkan produk pertama Anda</p>
                  <button
                    onClick={() => setView('form')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Tambah Produk
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => {
                    const activeDiscount = getActiveDiscount(product.discounts);
                    const originalPrice = product.price;
                    const discountedPrice = activeDiscount ? calculateDiscountedPrice(originalPrice, activeDiscount) : originalPrice;
                    
                    return (
                      <div key={product.id} className="border border-gray-200 rounded-xl hover:shadow-lg transition-shadow overflow-hidden">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-800 mb-1">{product.name}</h3>
                              <p className="text-sm text-gray-500">{product.sku}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {product.isActive ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </div>

                          {product.description?.short && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description.short}</p>
                          )}

                          <div className="space-y-2 mb-4">
                            {product.price && (
                              <div className="flex flex-col gap-1">
                                {activeDiscount ? (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-gray-400 line-through">
                                        Rp {parseFloat(originalPrice).toLocaleString('id-ID')}
                                      </span>
                                      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-semibold">
                                        {activeDiscount.type === 'PERCENTAGE' ? `-${activeDiscount.value}%` : `Disc`}
                                      </span>
                                    </div>
                                    <span className="font-bold text-blue-600 text-lg">
                                      Rp {parseFloat(discountedPrice).toLocaleString('id-ID')}
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-semibold text-blue-600">
                                    Rp {parseFloat(originalPrice).toLocaleString('id-ID')}
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Archive size={16} className="text-gray-400" />
                              <span>Stok: {product.stock}</span>
                            </div>
                            {product.categoryName && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Package size={16} className="text-gray-400" />
                                <span>{product.categoryName}</span>
                              </div>
                            )}
                          </div>

                          {product.tags && product.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {product.tags.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                              {product.tags.length > 3 && (
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                  +{product.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex gap-2 pt-4 border-t">
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setView('detail');
                              }}
                              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                            >
                              Lihat Detail
                            </button>
                            <button
                              onClick={() => handleEdit(product)}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'detail' && selectedProduct) {
    const activeDiscount = getActiveDiscount(selectedProduct.discounts);
    const originalPrice = selectedProduct.price;
    const discountedPrice = activeDiscount ? calculateDiscountedPrice(originalPrice, activeDiscount) : originalPrice;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <button
                onClick={() => setView('list')}
                className="text-white hover:text-blue-100 mb-4 flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                Kembali ke Daftar
              </button>
              <h1 className="text-3xl font-bold text-white">{selectedProduct.name}</h1>
              <p className="text-blue-100 mt-2">{selectedProduct.sku}</p>
            </div>

            <div className="p-8">
              <div className="flex items-center justify-between mb-8 pb-6 border-b">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${selectedProduct.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {selectedProduct.isActive ? 'Produk Aktif' : 'Produk Nonaktif'}
                  </span>
                  {selectedProduct.categoryName && (
                    <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
                      {selectedProduct.categoryName}
                    </span>
                  )}
                  {activeDiscount && (
                    <span className="px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Percent size={14} />
                      Diskon Aktif
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(selectedProduct)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Edit size={18} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(selectedProduct.id)}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <X size={18} />
                    Hapus
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Informasi Produk</h2>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Barcode className="text-gray-400 mt-1" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">SKU</p>
                          <p className="font-semibold text-gray-800">{selectedProduct.sku}</p>
                        </div>
                      </div>

                      {selectedProduct.price && (
                        <div className="flex items-start gap-3">
                          <DollarSign className="text-gray-400 mt-1" size={20} />
                          <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-1">Harga</p>
                            {activeDiscount ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <span className="text-gray-400 line-through">
                                    Rp {parseFloat(originalPrice).toLocaleString('id-ID')}
                                  </span>
                                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                                    {activeDiscount.type === 'PERCENTAGE' 
                                      ? `-${activeDiscount.value}%` 
                                      : `-Rp ${activeDiscount.value.toLocaleString('id-ID')}`
                                    }
                                  </span>
                                </div>
                                <p className="font-bold text-blue-600 text-2xl">
                                  Rp {parseFloat(discountedPrice).toLocaleString('id-ID')}
                                </p>
                                <p className="text-xs text-green-600">
                                  Hemat Rp {(originalPrice - discountedPrice).toLocaleString('id-ID')}
                                </p>
                              </div>
                            ) : (
                              <p className="font-semibold text-blue-600 text-lg">
                                Rp {parseFloat(originalPrice).toLocaleString('id-ID')}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <Archive className="text-gray-400 mt-1" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Stok</p>
                          <p className="font-semibold text-gray-800">{selectedProduct.stock} unit</p>
                        </div>
                      </div>

                      {selectedProduct.weight && (
                        <div className="flex items-start gap-3">
                          <Weight className="text-gray-400 mt-1" size={20} />
                          <div>
                            <p className="text-sm text-gray-500">Berat</p>
                            <p className="font-semibold text-gray-800">{selectedProduct.weight} kg</p>
                          </div>
                        </div>
                      )}

                      {selectedProduct.dimensions && (selectedProduct.dimensions.length || selectedProduct.dimensions.width || selectedProduct.dimensions.height) && (
                        <div className="flex items-start gap-3">
                          <Ruler className="text-gray-400 mt-1" size={20} />
                          <div>
                            <p className="text-sm text-gray-500">Dimensi</p>
                            <p className="font-semibold text-gray-800">
                              {selectedProduct.dimensions.length} × {selectedProduct.dimensions.width} × {selectedProduct.dimensions.height} {selectedProduct.dimensions.unit}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedProduct.discounts && selectedProduct.discounts.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-4">Diskon Produk</h2>
                      <div className="space-y-3">
                        {selectedProduct.discounts.map((discount, idx) => {
                          const isActive = getActiveDiscount([discount]) !== null;
                          return (
                            <div key={idx} className={`p-4 rounded-lg border-2 ${isActive ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Percent size={16} className={isActive ? 'text-red-600' : 'text-gray-400'} />
                                  <span className="font-semibold text-gray-800">
                                    {discount.type === 'PERCENTAGE' 
                                      ? `Diskon ${discount.value}%` 
                                      : `Potongan Rp ${discount.value.toLocaleString('id-ID')}`
                                    }
                                  </span>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                  {isActive ? 'Aktif' : discount.isActive ? 'Terjadwal' : 'Nonaktif'}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  <span>{new Date(discount.startDate).toLocaleDateString('id-ID')}</span>
                                </div>
                                <span>-</span>
                                <div className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  <span>{new Date(discount.endDate).toLocaleDateString('id-ID')}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-4">Tags</h2>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.tags.map((tag, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {selectedProduct.description && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-4">Deskripsi</h2>
                      {selectedProduct.description.short && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-1">Deskripsi Singkat</p>
                          <p className="text-gray-700">{selectedProduct.description.short}</p>
                        </div>
                      )}
                      {selectedProduct.description.full && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-1">Deskripsi Lengkap</p>
                          <p className="text-gray-700">{selectedProduct.description.full}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedProduct.description?.features && selectedProduct.description.features.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-4">Fitur Produk</h2>
                      <ul className="space-y-2">
                        {selectedProduct.description.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                <div className="border-t pt-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Varian Produk</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedProduct.variants.map((variant, idx) => {
                      const variantDiscount = getActiveDiscount(variant.discounts);
                      const variantOriginalPrice = variant.price;
                      const variantDiscountedPrice = variantDiscount ? calculateDiscountedPrice(variantOriginalPrice, variantDiscount) : variantOriginalPrice;
                      
                      return (
                        <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-gray-800">{variant.name}</h3>
                            <div className="flex gap-2">
                              {variantDiscount && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                                  Diskon
                                </span>
                              )}
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${variant.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {variant.isActive ? 'Aktif' : 'Nonaktif'}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">SKU:</span>
                              <span className="font-medium text-gray-800">{variant.sku}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">Harga:</span>
                              <div className="text-right">
                                {variantDiscount ? (
                                  <div className="space-y-1">
                                    <div className="text-gray-400 line-through text-xs">
                                      Rp {parseFloat(variantOriginalPrice).toLocaleString('id-ID')}
                                    </div>
                                    <div className="font-medium text-blue-600">
                                      Rp {parseFloat(variantDiscountedPrice).toLocaleString('id-ID')}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="font-medium text-blue-600">
                                    Rp {parseFloat(variantOriginalPrice).toLocaleString('id-ID')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Stok:</span>
                              <span className="font-medium text-gray-800">{variant.stock} unit</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-t pt-6 mt-8">
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>Dibuat: {new Date(selectedProduct.createdAt).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>Diperbarui: {new Date(selectedProduct.updatedAt).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <button
              onClick={() => {
                setView('list');
                resetForm();
              }}
              className="text-white hover:text-blue-100 mb-4 flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Kembali ke Daftar
            </button>
            <h1 className="text-3xl font-bold text-white">
              {editMode ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h1>
            <p className="text-blue-100 mt-2">Lengkapi informasi produk dengan detail</p>
          </div>

          <div className="p-8 space-y-8">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Informasi Dasar</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Produk <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: Smartphone XYZ"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: PRD-001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Harga</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stok</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Berat (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.000"
                    step="0.001"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Produk Aktif
                </label>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Deskripsi Produk</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Singkat</label>
                <textarea
                  value={formData.description.short}
                  onChange={(e) => handleDescriptionChange('short', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  placeholder="Deskripsi singkat untuk preview"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Lengkap</label>
                <textarea
                  value={formData.description.full}
                  onChange={(e) => handleDescriptionChange('full', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  placeholder="Deskripsi lengkap produk"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fitur Produk</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFeature();
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tambah fitur dan tekan Enter"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.description.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
                      <span className="text-sm text-gray-700">• {feature}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Dimensi Produk</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Panjang</label>
                  <input
                    type="number"
                    value={formData.dimensions.length}
                    onChange={(e) => handleDimensionChange('length', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    step="0.1"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lebar</label>
                  <input
                    type="number"
                    value={formData.dimensions.width}
                    onChange={(e) => handleDimensionChange('width', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    step="0.1"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tinggi</label>
                  <input
                    type="number"
                    value={formData.dimensions.height}
                    onChange={(e) => handleDimensionChange('height', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    step="0.1"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Satuan</label>
                  <select
                    value={formData.dimensions.unit}
                    onChange={(e) => handleDimensionChange('unit', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="cm">CM</option>
                    <option value="m">M</option>
                    <option value="inch">Inch</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Tags</h2>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tambah tag dan tekan Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Tag size={20} />
                  Tambah
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-blue-600"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-xl font-semibold text-gray-800">Diskon Produk</h2>
                <button
                  type="button"
                  onClick={() => setShowDiscounts(!showDiscounts)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showDiscounts ? 'Sembunyikan' : 'Tampilkan'} Diskon
                </button>
              </div>
              
              {showDiscounts && (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => addDiscount()}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Percent size={20} />
                    Tambah Diskon
                  </button>

                  {discounts.map((discount, index) => (
                    <div key={discount.id} className="bg-red-50 p-4 rounded-lg space-y-3 border-2 border-red-200">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-700 flex items-center gap-2">
                          <Percent size={16} className="text-red-600" />
                          Diskon {index + 1}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeDiscount(discount.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Tipe Diskon</label>
                          <select
                            value={discount.type}
                            onChange={(e) => updateDiscount(discount.id, 'type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="PERCENTAGE">Persentase (%)</option>
                            <option value="FIXED_AMOUNT">Nominal (Rp)</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Nilai Diskon {discount.type === 'PERCENTAGE' ? '(%)' : '(Rp)'}
                          </label>
                          <input
                            type="number"
                            value={discount.value}
                            onChange={(e) => updateDiscount(discount.id, 'value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder={discount.type === 'PERCENTAGE' ? '0 - 100' : '0'}
                            step="0.01"
                            min="0"
                            max={discount.type === 'PERCENTAGE' ? '100' : undefined}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                          <input
                            type="date"
                            value={discount.startDate}
                            onChange={(e) => updateDiscount(discount.id, 'startDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Berakhir</label>
                          <input
                            type="date"
                            value={discount.endDate}
                            onChange={(e) => updateDiscount(discount.id, 'endDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`discount-active-${discount.id}`}
                          checked={discount.isActive}
                          onChange={(e) => updateDiscount(discount.id, 'isActive', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <label htmlFor={`discount-active-${discount.id}`} className="text-sm text-gray-700">
                          Diskon Aktif
                        </label>
                      </div>

                      {formData.price && discount.value && (
                        <div className="bg-white p-3 rounded border border-red-200">
                          <p className="text-xs text-gray-600 mb-1">Preview Harga:</p>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-400 line-through">
                              Rp {parseFloat(formData.price).toLocaleString('id-ID')}
                            </span>
                            <span className="text-base font-bold text-blue-600">
                              Rp {calculateDiscountedPrice(parseFloat(formData.price), discount).toLocaleString('id-ID')}
                            </span>
                            <span className="text-xs text-green-600">
                              (Hemat Rp {(parseFloat(formData.price) - calculateDiscountedPrice(parseFloat(formData.price), discount)).toLocaleString('id-ID')})
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-xl font-semibold text-gray-800">Varian Produk</h2>
                <button
                  type="button"
                  onClick={() => setShowVariants(!showVariants)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showVariants ? 'Sembunyikan' : 'Tampilkan'} Varian
                </button>
              </div>
              
              {showVariants && (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={addVariant}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />
                    Tambah Varian
                  </button>

                  {variants.map((variant, index) => (
                    <div key={variant.id} className="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-300">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-700">Varian {index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => removeVariant(variant.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nama Varian"
                        />
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="SKU Varian"
                        />
                        <input
                          type="number"
                          value={variant.price}
                          onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Harga Varian"
                          step="0.01"
                          min="0"
                        />
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(variant.id, 'stock', e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Stok Varian"
                          min="0"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`variant-active-${variant.id}`}
                          checked={variant.isActive}
                          onChange={(e) => updateVariant(variant.id, 'isActive', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <label htmlFor={`variant-active-${variant.id}`} className="text-sm text-gray-700">
                          Varian Aktif
                        </label>
                      </div>

                      <div className="pt-3 border-t border-gray-300">
                        <button
                          type="button"
                          onClick={() => addDiscount(variant.id)}
                          className="w-full px-3 py-2 border border-dashed border-gray-400 rounded-lg text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <Percent size={16} />
                          Tambah Diskon Varian
                        </button>

                        {variant.discounts && variant.discounts.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {variant.discounts.map((vDiscount) => (
                              <div key={vDiscount.id} className="bg-red-50 p-3 rounded border border-red-200 text-sm">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-medium text-gray-700">
                                    {vDiscount.type === 'PERCENTAGE' ? `${vDiscount.value}%` : `Rp ${vDiscount.value}`} OFF
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeDiscount(vDiscount.id, variant.id)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                                <div className="text-xs text-gray-600">
                                  {new Date(vDiscount.startDate).toLocaleDateString('id-ID')} - {new Date(vDiscount.endDate).toLocaleDateString('id-ID')}
                                </div>
                                {variant.price && vDiscount.value && (
                                  <div className="mt-2 pt-2 border-t border-red-200">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-400 line-through">
                                        Rp {parseFloat(variant.price).toLocaleString('id-ID')}
                                      </span>
                                      <span className="text-sm font-bold text-blue-600">
                                        Rp {calculateDiscountedPrice(parseFloat(variant.price), vDiscount).toLocaleString('id-ID')}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                {editMode ? 'Update Produk' : 'Simpan Produk'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setView('list');
                  resetForm();
                }}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}