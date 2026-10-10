import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';

type CollectionKey = 'entry' | 'standing';

type Product = {
  id: string;
  name: string;
  category: string;
  collection: CollectionKey;
  price: number;
  currency: string;
  description: string;
  material: string;
  color: string;
  embroidery: string;
  sizes: string[];
  stock: number;
  availability: 'In Stock' | 'Low Stock' | 'Sold Out';
  published: boolean;
  image: string;
  extraImages: string[];
  sku: string;
  care: string;
  status: 'active' | 'draft';
};

type ProductForm = {
  name: string;
  category: string;
  collection: CollectionKey;
  price: number;
  currency: string;
  description: string;
  material: string;
  color: string;
  embroidery: string;
  sizes: string;
  stock: number;
  availability: Product['availability'];
  published: boolean;
  image: string;
  sku: string;
  care: string;
};

const STORAGE_KEY = 'vasant-products-v1';
const ADMIN_ACCESS_KEY = 'vasant-admin-access';
const ADMIN_ACCESS_CODE = 'VasantAdmin2026!';

const defaultProducts: Product[] = [
  {
    id: 'entry-saree-01',
    name: 'Emerald Banarasi Heritage',
    category: 'Saree',
    collection: 'entry',
    price: 24500,
    currency: 'INR',
    description: 'A luminous emerald silk saree with hand-embroidered zari detailing and a softly draping pallu.',
    material: 'Silk with zari embroidery',
    color: 'Emerald green',
    embroidery: 'Floral zari and thread work',
    sizes: ['Free Size'],
    stock: 8,
    availability: 'In Stock',
    published: true,
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    extraImages: [],
    sku: 'ENTRY-SAREE-01',
    care: 'Dry clean only. Store folded with tissue paper.',
    status: 'active',
  },
  {
    id: 'entry-blouse-01',
    name: 'Royal Gold Blouse',
    category: 'Blouse',
    collection: 'entry',
    price: 7200,
    currency: 'INR',
    description: 'A fitted blouse with gold-thread front detailing and a sculpted neckline.',
    material: 'Silk blend',
    color: 'Warm gold',
    embroidery: 'Gold thread and mirror details',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 12,
    availability: 'In Stock',
    published: true,
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
    extraImages: [],
    sku: 'ENTRY-BLOUSE-01',
    care: 'Hand wash or dry clean.',
    status: 'active',
  },
  {
    id: 'standing-suit-01',
    name: 'Ivory Royal Set',
    category: 'Punjabi Suit',
    collection: 'standing',
    price: 26800,
    currency: 'INR',
    description: 'A cream Punjabi suit with delicate floral embroidery and tailored straight silhouette.',
    material: 'Cotton silk',
    color: 'Ivory',
    embroidery: 'Rose and floral thread work',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 10,
    availability: 'In Stock',
    published: true,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    extraImages: [],
    sku: 'STAND-SUIT-01',
    care: 'Gentle hand wash with cold water.',
    status: 'active',
  },
  {
    id: 'standing-trouser-01',
    name: 'Magenta Statement Trouser',
    category: 'Trouser',
    collection: 'standing',
    price: 6200,
    currency: 'INR',
    description: 'Tailored magenta trousers designed for a sharp drape and comfort with subtle sheen.',
    material: 'Silk blend',
    color: 'Magenta',
    embroidery: 'Subtle tonal detailing',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 6,
    availability: 'Low Stock',
    published: true,
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
    extraImages: [],
    sku: 'STAND-TROUSER-01',
    care: 'Dry clean only.',
    status: 'active',
  },
];

const emptyForm = (): ProductForm => ({
  name: '',
  category: '',
  collection: 'entry',
  price: 0,
  currency: 'INR',
  description: '',
  material: '',
  color: '',
  embroidery: '',
  sizes: 'S, M, L',
  stock: 0,
  availability: 'In Stock',
  published: true,
  image: '',
  sku: '',
  care: '',
});

const loadProducts = (): Product[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultProducts;

  try {
    const parsed = JSON.parse(raw) as Product[];
    return parsed.length ? parsed : defaultProducts;
  } catch {
    return defaultProducts;
  }
};

const getProductLabel = (collection: CollectionKey) =>
  collection === 'entry' ? 'Entry Mannequin' : 'Standing Mannequin';

function App() {
  const [products, setProducts] = useState<Product[]>(() => loadProducts());
  const [selectedGarment, setSelectedGarment] = useState<Product | null>(null);
  const [activeCollection, setActiveCollection] = useState<CollectionKey>('entry');
  const [railFocus, setRailFocus] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(ADMIN_ACCESS_KEY) === 'true';
  });
  const [formData, setFormData] = useState<ProductForm>(emptyForm());
  const [uploadError, setUploadError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [bgRemovalEnabled] = useState(() => import.meta.env.VITE_ENABLE_BG_REMOVAL === 'true');
  const railRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    if (!railRef.current || !sceneRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });

    if (railFocus) {
      tl.to(sceneRef.current, { scale: 1.08, duration: 0.8 })
        .to(railRef.current, { y: -70, scale: 1.2, duration: 1.1 }, 0.05)
        .to('.showroom-model.left', { opacity: 0.1, x: -35, duration: 0.8 }, 0.1)
        .to('.showroom-model.right', { opacity: 0.1, x: 35, duration: 0.8 }, 0.1);
    } else {
      tl.to(railRef.current, { y: 0, scale: 1, duration: 0.9 })
        .to(sceneRef.current, { scale: 1, duration: 0.7 }, 0.1)
        .to('.showroom-model.left', { opacity: 1, x: 0, duration: 0.7 }, 0.1)
        .to('.showroom-model.right', { opacity: 1, x: 0, duration: 0.7 }, 0.1);
    }
  }, [railFocus]);

  const collectionProducts = useMemo(
    () => products.filter((p) => p.collection === activeCollection && p.published),
    [products, activeCollection],
  );

  const mainRailProducts = useMemo(
    () => products.filter((p) => p.published),
    [products],
  );

  const openProductDetails = (product: Product) => {
    setSelectedGarment(product);
  };

  const closeProductDetails = () => setSelectedGarment(null);

  const handleRailFocus = () => setRailFocus(true);
  const handleReturnToShowroom = () => {
    setRailFocus(false);
    setSelectedGarment(null);
  };

  const handleAdminLogin = () => {
    const pass = window.prompt('Enter admin access code:');
    if (pass === ADMIN_ACCESS_CODE) {
      setIsAdminAuthenticated(true);
      localStorage.setItem(ADMIN_ACCESS_KEY, 'true');
      setStatusMessage('Admin access granted.');
      return;
    }
    setUploadError('Invalid access code.');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem(ADMIN_ACCESS_KEY);
    setIsAdminAuthenticated(false);
    setStatusMessage('Admin session ended.');
  };

  const handleInputChange = <K extends keyof ProductForm>(field: K, value: ProductForm[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp', 'image/jpg'].includes(file.type)) {
      setUploadError('Unsupported file type. Please upload PNG, JPG, or WEBP.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Image is too large. Please upload under 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, image: String(reader.result) || '' }));
      setUploadError('');
      setStatusMessage('Image preview ready.');
    };
    reader.readAsDataURL(file);
  };

  const handleAddOrEditProduct = () => {
    if (!formData.name || !formData.category || !formData.image) {
      setUploadError('Please fill all required fields and upload an image.');
      return;
    }

    const payload: Product = {
      id: formData.sku || `${formData.collection}-${Date.now()}`,
      name: formData.name,
      category: formData.category,
      collection: formData.collection,
      price: Number(formData.price) || 0,
      currency: formData.currency,
      description: formData.description,
      material: formData.material,
      color: formData.color,
      embroidery: formData.embroidery,
      sizes: formData.sizes.split(',').map((size) => size.trim()).filter(Boolean),
      stock: Number(formData.stock) || 0,
      availability: formData.stock > 0 ? (formData.stock < 5 ? 'Low Stock' : 'In Stock') : 'Sold Out',
      published: formData.published,
      image: formData.image,
      extraImages: [],
      sku: formData.sku || `${formData.collection.toUpperCase()}-${Date.now()}`,
      care: formData.care,
      status: formData.published ? 'active' : 'draft',
    };

    setProducts((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === payload.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = payload;
        return updated;
      }
      return [payload, ...prev];
    });

    setFormData(emptyForm());
    setStatusMessage(`${payload.name} saved to ${getProductLabel(payload.collection)}.`);
    setUploadError('');
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== productId));
    setStatusMessage('Product removed from the collection.');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <span className="brand-mark">VASANT</span>
          <span className="brand-sub">LIVING ATELIER</span>
        </div>

        <nav className="header-actions" aria-label="primary navigation">
          <button className="ghost-btn" onClick={() => setAdminOpen((prev) => !prev)}>
            {adminOpen ? 'Close Admin' : 'Admin'}
          </button>
          {!isAdminAuthenticated && (
            <button className="ghost-btn" onClick={handleAdminLogin}>Login</button>
          )}
          {isAdminAuthenticated && (
            <button className="ghost-btn" onClick={handleAdminLogout}>Logout</button>
          )}
        </nav>
      </header>

      <main className="showroom-page">
        <div className="reference-scene" ref={sceneRef}>
          <div
            className="scene-backdrop"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(32,24,15,0.16), rgba(18,12,9,0.2)), url('${'/reference-showroom-reference.jpg'}')`,
            }}
          />

          <button
            className="showroom-model left"
            type="button"
            onClick={() => setActiveCollection('entry')}
            aria-label="View Entry Mannequin collection"
          >
            <span className="model-label">Entry Mannequin</span>
          </button>

          <div
            ref={railRef}
            className={`rail-zone ${railFocus ? 'focused' : ''}`}
            onClick={handleRailFocus}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleRailFocus();
              }
            }}
            aria-label="Open Rail Focus mode"
          >
            <div className="rail-frame">
              <div className="rail-line" />
              {mainRailProducts.slice(0, 8).map((product, index) => (
                <button
                  key={product.id}
                  className="garment-hanger"
                  style={{ left: `${10 + index * 12}%` }}
                  onClick={(event) => {
                    event.stopPropagation();
                    openProductDetails(product);
                  }}
                  aria-label={`Open ${product.name}`}
                >
                  <span className="hanger-hook" />
                  <span className="garment-silhouette" style={{ background: product.color }} />
                </button>
              ))}
            </div>
          </div>

          <button
            className="showroom-model right"
            type="button"
            onClick={() => setActiveCollection('standing')}
            aria-label="View Standing Mannequin collection"
          >
            <span className="model-label">Standing Mannequin</span>
          </button>

          {railFocus && (
            <div className="rail-overlay">
              <div className="rail-toolbar">
                <button className="primary-btn" onClick={handleReturnToShowroom}>Return to Showroom</button>
                <button className="secondary-btn" onClick={() => setSelectedGarment(null)}>Close</button>
              </div>

              <div className="rail-garment-grid">
                {collectionProducts.map((product) => (
                  <button
                    key={product.id}
                    className="rail-garment-card"
                    onClick={() => openProductDetails(product)}
                    type="button"
                  >
                    <div className="rail-garment-image" style={{ backgroundImage: `url('${product.image}')` }} />
                    <span>{product.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedGarment && (
          <div className="product-sheet" role="dialog" aria-modal="true">
            <div className="sheet-inner">
              <button className="close-sheet" onClick={closeProductDetails} aria-label="Close product details">×</button>
              <div className="sheet-image" style={{ backgroundImage: `url('${selectedGarment.image}')` }} />

              <div className="sheet-content">
                <p className="eyebrow">{getProductLabel(selectedGarment.collection)}</p>
                <h2>{selectedGarment.name}</h2>
                <div className="price-row">
                  <strong>
                    {selectedGarment.currency} {selectedGarment.price.toLocaleString('en-IN')}
                  </strong>
                  <span>{selectedGarment.availability}</span>
                </div>

                <p>{selectedGarment.description}</p>

                <ul className="product-meta">
                  <li><span>Category</span><strong>{selectedGarment.category}</strong></li>
                  <li><span>Material</span><strong>{selectedGarment.material}</strong></li>
                  <li><span>Colour</span><strong>{selectedGarment.color}</strong></li>
                  <li><span>Embroidery</span><strong>{selectedGarment.embroidery}</strong></li>
                  <li><span>Sizes</span><strong>{selectedGarment.sizes.join(', ')}</strong></li>
                  <li><span>Stock</span><strong>{selectedGarment.stock}</strong></li>
                  <li><span>SKU</span><strong>{selectedGarment.sku}</strong></li>
                  <li><span>Care</span><strong>{selectedGarment.care}</strong></li>
                </ul>

                <div className="sheet-actions">
                  <button className="primary-btn" type="button">Add to Cart</button>
                  <button className="secondary-btn" type="button">Buy Now</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {adminOpen && (
          <aside className="admin-panel" aria-label="Administrator dashboard">
            {!isAdminAuthenticated ? (
              <div className="auth-gate">
                <h3>Protected admin access</h3>
                <p>This dashboard requires authorization before product changes are allowed.</p>
                <button className="primary-btn" onClick={handleAdminLogin}>Unlock admin</button>
              </div>
            ) : (
              <div className="admin-inner">
                <div className="admin-header">
                  <h3>VASANT Dashboard</h3>
                  <span>Status: {statusMessage || 'Ready'}</span>
                </div>

                <div className="admin-grid">
                  <div className="admin-form-card">
                    <h4>Product Editor</h4>

                    <label>
                      Product name
                      <input value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
                    </label>

                    <label>
                      Collection
                      <select value={formData.collection} onChange={(e) => handleInputChange('collection', e.target.value as CollectionKey)}>
                        <option value="entry">Entry Mannequin</option>
                        <option value="standing">Standing Mannequin</option>
                      </select>
                    </label>

                    <label>
                      Category
                      <input value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)} />
                    </label>

                    <label>
                      Price
                      <input type="number" value={formData.price} onChange={(e) => handleInputChange('price', Number(e.target.value))} />
                    </label>

                    <label>
                      Description
                      <textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} />
                    </label>

                    <label>
                      Material
                      <input value={formData.material} onChange={(e) => handleInputChange('material', e.target.value)} />
                    </label>

                    <label>
                      Colour
                      <input value={formData.color} onChange={(e) => handleInputChange('color', e.target.value)} />
                    </label>

                    <label>
                      Embroidery / Print
                      <input value={formData.embroidery} onChange={(e) => handleInputChange('embroidery', e.target.value)} />
                    </label>

                    <label>
                      Sizes
                      <input value={formData.sizes} onChange={(e) => handleInputChange('sizes', e.target.value)} />
                    </label>

                    <label>
                      Stock
                      <input type="number" value={formData.stock} onChange={(e) => handleInputChange('stock', Number(e.target.value))} />
                    </label>

                    <label>
                      SKU / Product ID
                      <input value={formData.sku} onChange={(e) => handleInputChange('sku', e.target.value)} />
                    </label>

                    <label>
                      Care instructions
                      <textarea value={formData.care} onChange={(e) => handleInputChange('care', e.target.value)} />
                    </label>

                    <label>
                      Garment image
                      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageUpload} />
                    </label>

                    {formData.image && <img className="admin-preview" src={formData.image} alt="Upload preview" />}

                    {bgRemovalEnabled && (
                      <button className="secondary-btn" type="button">Apply background removal</button>
                    )}

                    <label className="checkbox-row">
                      <input type="checkbox" checked={formData.published} onChange={(e) => handleInputChange('published', e.target.checked)} />
                      Publish product
                    </label>

                    {uploadError && <p className="danger-text">{uploadError}</p>}

                    <button className="primary-btn" type="button" onClick={handleAddOrEditProduct}>
                      Save garment
                    </button>
                  </div>

                  <div className="admin-list-card">
                    <h4>Collections</h4>

                    {(['entry', 'standing'] as CollectionKey[]).map((collection) => (
                      <div key={collection} className="collection-block">
                        <h5>{getProductLabel(collection)}</h5>
                        <ul className="product-list">
                          {products
                            .filter((product) => product.collection === collection)
                            .map((product) => (
                              <li key={product.id}>
                                <div>
                                  <strong>{product.name}</strong>
                                  <span>{product.category}</span>
                                </div>
                                <div className="product-actions">
                                  <button className="mini-btn" onClick={() => openProductDetails(product)}>View</button>
                                  <button className="mini-btn danger" onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                                </div>
                              </li>
                            ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}
      </main>
    </div>
  );
}

export default App;
