import { Link } from "react-router-dom";
import { Star, ShoppingCart } from "lucide-react";
import api from "../api/axios";

const initials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const ProductCard = ({ product, aiMatch, onAdded }) => {
  const handleAddToCart = async (e) => {
    e.preventDefault();
    try {
      await api.post("/cart", { productId: product._id, quantity: 1 });
      onAdded?.(product.name);
    } catch (err) {
      onAdded?.(err.response?.data?.message || "Could not add to cart", true);
    }
  };

  const hasImage = product.images && product.images.length > 0 && product.images[0];
  const discount = product.discountPercent || 0;
  const salePrice = discount > 0 ? Math.round(product.price * (1 - discount / 100)) : product.price;

  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <div className="product-card__media" style={hasImage ? { padding: 0 } : undefined}>
        {discount > 0 && <span className="discount-badge">-{discount}%</span>}
        {hasImage ? (
          <img
            src={product.images[0]}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.textContent = initials(product.name);
            }}
          />
        ) : (
          initials(product.name)
        )}
        {aiMatch && (
          <div className="ai-match">
            <span>{aiMatch}%</span>
            <small>AI match</small>
          </div>
        )}
      </div>
      <div className="product-card__body">
        <span className="product-card__category">{product.category}</span>
        <h4 className="product-card__name">{product.name}</h4>
        <div className="product-card__rating">
          <Star size={13} fill="var(--color-gold)" color="var(--color-gold)" />
          {product.ratingAverage || "New"} {product.ratingCount ? `(${product.ratingCount})` : ""}
        </div>
        <div className="product-card__footer">
          <div className="price-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
            {discount > 0 && <span className="price-strike">Rs. {product.price?.toLocaleString()}</span>}
            <span className="product-card__price">Rs. {salePrice?.toLocaleString()}</span>
          </div>
          <button className="btn" style={{ padding: "7px 10px", fontSize: 12.5 }} onClick={handleAddToCart} aria-label="Add to cart">
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
