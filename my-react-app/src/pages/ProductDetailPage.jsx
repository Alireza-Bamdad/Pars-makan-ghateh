import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductBySlug, getProducts } from "../services/product";
import './ProductDetailPage.css';



const ProductDetailPage = () => {
  const { slug } = useParams(); 
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        
        // Fetch product using your existing service
        const productData = await getProductBySlug(slug);
        
        // Process product data based on your API response structure
        let productObj = null;
        if (productData && productData.success && productData.data) {
          productObj = productData.data.product;
        } else if (productData && typeof productData === 'object') {
          productObj = productData;
        }
        
        if (!productObj) {
          throw new Error('محصول یافت نشد');
        }
        
        setProduct(productObj);
        
        // Fetch related products from the same category
        if (productObj.category) {
          try {
            // Get all products and filter by category
            const allProductsData = await getProducts();
            let allProducts = [];
            
            // Process all products data similar to products page
            if (Array.isArray(allProductsData)) {
              allProducts = allProductsData;
            } else if (allProductsData && allProductsData.success && allProductsData.data) {
              allProducts = allProductsData.data.products || [];
            } else if (allProductsData && typeof allProductsData === 'object') {
              allProducts = allProductsData.data || allProductsData.products || allProductsData.items || [];
            }
            
            // Filter products by same category and exclude current product
            const categoryId = typeof productObj.category === 'object' 
              ? productObj.category._id 
              : productObj.category;
            
            const relatedItems = allProducts
              .filter(item => {
                // Exclude current product
                if (item._id === productObj._id || item.slug === productObj.slug) {
                  return false;
                }
                
                // Check if same category
                const itemCategoryId = typeof item.category === 'object' 
                  ? item.category._id 
                  : item.category;
                
                return itemCategoryId === categoryId;
              })
              .slice(0, 4); // Limit to 4 products
            
            setRelatedProducts(relatedItems);
          } catch (err) {
            console.log('Could not fetch related products:', err);
          }
        }
        
      } catch (err) {
        setError('خطا در دریافت اطلاعات محصول');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [slug]);

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return price.toLocaleString('fa-IR') + ' تومان';
    }
    return price || 'قیمت نامشخص';
  };

  const getProductImages = (product) => {
    const images = [];
    
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (typeof img === 'object' && img.url) {
          images.push(img.url);
        } else if (typeof img === 'string') {
          images.push(img);
        }
      });
    }
    
    if (product.image) {
      images.push(product.image);
    }
    
    if (product.thumbnail && !images.includes(product.thumbnail)) {
      images.push(product.thumbnail);
    }
    
    return images.length > 0 ? images : [null];
  };

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };
  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>در حال بارگذاری اطلاعات محصول...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="error-message">
          <h2>خطا</h2>
          <p>{error || 'محصول یافت نشد'}</p>
          <button onClick={() => navigate('/products')}>
            بازگشت به لیست محصولات
          </button>
        </div>
      </div>
    );
  }

  const productImages = getProductImages(product);

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <button onClick={() => navigate('/')}>خانه</button>
        <span className="separator">/</span>
        <button onClick={() => navigate('/products')}>محصولات</button>
        <span className="separator">/</span>
        {product.category && typeof product.category === 'object' && (
          <>
            <span>{product.category.name}</span>
            <span className="separator">/</span>
          </>
        )}
        <span className="current">{product.name}</span>
      </nav>

      <div className="product-detail-container">
        {/* Product Images Section */}
        <div className="product-images-section">
          <div className="main-image-container">
            {productImages[selectedImageIndex] ? (
              <img
                src={productImages[selectedImageIndex]}
                alt={product.name}
                className="main-product-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="no-image-placeholder main-placeholder" 
                 style={{display: productImages[selectedImageIndex] ? 'none' : 'flex'}}>
              <span className="no-image-icon">📷</span>
              <span>بدون تصویر</span>
            </div>
          </div>
          
          {productImages.length > 1 && (
            <div className="thumbnail-images">
              {productImages.map((image, index) => (
                <div
                  key={index}
                  className={`thumbnail-container ${index === selectedImageIndex ? 'active' : ''}`}
                  onClick={() => handleImageClick(index)}
                >
                  {image ? (
                    <img
                      src={image}
                      alt={`${product.name} - تصویر ${index + 1}`}
                      className="thumbnail-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="no-image-placeholder thumbnail-placeholder"
                       style={{display: image ? 'none' : 'flex'}}>
                    <span>📷</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="product-info-section">
          <div className="product-header">
            <h1 className="product-title">{product.name}</h1>
            
            {product.isFeatured && (
              <span className="featured-badge">⭐ محصول ویژه</span>
            )}
          </div>

          {/* Product Meta Info */}
          <div className="product-meta-info">
            {product.brand && (
              <div className="meta-item">
                <span className="meta-label">برند:</span>
                <span className="meta-value">{product.brand}</span>
              </div>
            )}
            {product.partNumber && (
              <div className="meta-item">
                <span className="meta-label">شماره قطعه:</span>
                <span className="meta-value">{product.partNumber}</span>
              </div>
            )}
            {product.carType && (
              <div className="meta-item">
                <span className="meta-label">خودرو:</span>
                <span className="meta-value">{product.carType}</span>
              </div>
            )}
            {product.category && (
              <div className="meta-item">
                <span className="meta-label">دسته‌بندی:</span>
                <span className="meta-value">
                  {typeof product.category === 'object' ? product.category.name : product.category}
                </span>
              </div>
            )}
          </div>

          {/* Price Section */}
          {product.price && (
            <div className="price-section">
              <div className="current-price">
                {formatPrice(product.price)}
              </div>
              {product.originalPrice && product.originalPrice !== product.price && (
                <div className="original-price">
                  {formatPrice(product.originalPrice)}
                </div>
              )}
            </div>
          )}

          {/* Status */}
          <div className="status-section">
            <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
              {product.isActive ? '✅ موجود' : '❌ ناموجود'}
            </span>
            {product.viewsCount !== undefined && (
              <span className="views-count">
                👁 {product.viewsCount} بازدید
              </span>
            )}
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <div className="short-description">
              <p>{product.shortDescription}</p>
            </div>
          )}

          {/* Contact or Inquiry Section */}
          {product.isActive && (
            <div className="contact-section">
              <h3>برای استعلام قیمت و خرید تماس بگیرید:</h3>
              <div className="contact-buttons">
                <a href="tel:+989173271310" className="contact-btn phone-btn">
                   تماس تلفنی
                </a>
   
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Description */}
{product.description && (
  <div className="product-description-section">
    <h2>توضیحات محصول</h2>
    <div
      className="description-content"
      dangerouslySetInnerHTML={{ __html: product.description }}
    />
  </div>
)}


      {/* Technical Specifications */}
      <div className="product-specifications">
        <h2>مشخصات فنی</h2>
        <div className="specs-grid">
          {product.brand && (
            <div className="spec-item">
              <span className="spec-label">برند</span>
              <span className="spec-value">{product.brand}</span>
            </div>
          )}
          {product.partNumber && (
            <div className="spec-item">
              <span className="spec-label">شماره قطعه</span>
              <span className="spec-value">{product.partNumber}</span>
            </div>
          )}
          {product.carType && (
            <div className="spec-item">
              <span className="spec-label">مناسب برای خودرو</span>
              <span className="spec-value">{product.carType}</span>
            </div>
          )}
          {product.category && (
            <div className="spec-item">
              <span className="spec-label">دسته‌بندی</span>
              <span className="spec-value">
                {typeof product.category === 'object' ? product.category.name : product.category}
              </span>
            </div>
          )}
          <div className="spec-item">
            <span className="spec-label">وضعیت</span>
            <span className="spec-value">{product.isActive ? 'موجود' : 'ناموجود'}</span>
          </div>

        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="related-products-section">
          <h2>محصولات مرتبط</h2>
          <div className="related-products-grid">
            {relatedProducts.map((relatedProduct, index) => (
              <div key={relatedProduct._id || index} className="related-product-card">
                <div className="related-product-image">
                  {/* Get first image from related product */}
                  {(() => {
                    let imageUrl = null;
                    if (relatedProduct.images && Array.isArray(relatedProduct.images) && relatedProduct.images.length > 0) {
                      if (typeof relatedProduct.images[0] === 'object' && relatedProduct.images[0].url) {
                        imageUrl = relatedProduct.images[0].url;
                      } else if (typeof relatedProduct.images[0] === 'string') {
                        imageUrl = relatedProduct.images[0];
                      }
                    } else if (relatedProduct.image) {
                      imageUrl = relatedProduct.image;
                    } else if (relatedProduct.thumbnail) {
                      imageUrl = relatedProduct.thumbnail;
                    }
                    
                    return imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={relatedProduct.name}
                        onClick={() => navigate(`/product/${relatedProduct.slug || relatedProduct._id}`)}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null;
                  })()}
                  <div className="no-image" style={{
                    display: (() => {
                      let hasImage = false;
                      if (relatedProduct.images && Array.isArray(relatedProduct.images) && relatedProduct.images.length > 0) {
                        hasImage = true;
                      } else if (relatedProduct.image || relatedProduct.thumbnail) {
                        hasImage = true;
                      }
                      return hasImage ? 'none' : 'flex';
                    })()
                  }}>
                    📷
                  </div>
                </div>
                <div className="related-product-info">
                  <h4 onClick={() => navigate(`/product/${relatedProduct.slug || relatedProduct._id}`)}>
                    {relatedProduct.name}
                  </h4>
                  {relatedProduct.brand && (
                    <p className="related-brand">برند: {relatedProduct.brand}</p>
                  )}
                  {relatedProduct.price && (
                    <span className="related-price">{formatPrice(relatedProduct.price)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;