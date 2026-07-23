import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Truck, ShieldCheck, RotateCcw, Star } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";

const initials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

// UC-10 View Product Details, UC-04 Add to Cart, UC-12 Wishlist, UC-13 Review and Rating
const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState("");

  const load = async () => {
    const [prodRes, reviewRes] = await Promise.all([
      api.get(`/products/${id}`),
      api.get(`/products/${id}/reviews`),
    ]);
    setProduct(prodRes.data);
    setReviews(reviewRes.data);
    setActiveImage(0);
    setQty(1);

    const relatedRes = await api.get("/products", { params: { category: prodRes.data.category, limit: 5 } });
    setRelated(relatedRes.data.products.filter((p) => p._id !== id).slice(0, 4));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const addToCart = async () => {
    try {
      await api.post("/cart", { productId: id, quantity: qty });
      setStatus("Added to cart!");
    } catch (err) {
      setStatus(err.response?.data?.message || "Could not add to cart");
    }
  };

  const toggleWishlist = async () => {
    try {
      const res = await api.post(`/wishlist/${id}`);
      setStatus(res.data.added ? "Added to wishlist" : "Removed from wishlist");
    } catch (err) {
      setStatus(err.response?.data?.message || "Could not update wishlist");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
      setReviewForm({ rating: 5, comment: "" });
      load();
    } catch (err) {
      setStatus(err.response?.data?.message || "Could not submit review");
    }
  };

  if (!product) return <p className="container">Loading...</p>;

  const images = product.images && product.images.length > 0 ? product.images : [];
  const salePrice =
    product.discountPercent > 0
      ? Math.round(product.price * (1 - product.discountPercent / 100))
      : product.price;

  const highlights = product.description
    ? product.description.split(/\.\s+/).map((s) => s.trim()).filter(Boolean).slice(0, 4)
    : [];

  return (
    <div className="container" style={{ maxWidth: 1140 }}>
      <div className="pdp-layout">
        <div className="pdp-thumbs">
          {images.length > 0 ? (
            images.map((src, i) => (
              <div
                key={i}
                className={`pdp-thumb ${i === activeImage ? "active" : ""}`}
                onClick={() => setActiveImage(i)}
              >
                <img src={src} alt={`${product.name} ${i + 1}`} onError={(e) => (e.target.style.opacity = 0.2)} />
              </div>
            ))
          ) : (
            <div className="pdp-thumb active">{initials(product.name)}</div>
          )}
        </div>

        <div className="pdp-main-image">
          {images.length > 0 ? (
            <img
              src={images[activeImage]}
              alt={product.name}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.textContent = initials(product.name);
              }}
            />
          ) : (
            initials(product.name)
          )}
        </div>

        <div className="buy-box">
          <span className="product-card__category">{product.category}</span>
          <h1 style={{ fontSize: 21, margin: "6px 0 8px" }}>{product.name}</h1>
          <p className="product-card__rating" style={{ marginBottom: 10 }}>
            <Star size={13} fill="var(--color-gold)" color="var(--color-gold)" />
            {product.ratingAverage || "New"} {product.ratingCount ? `(${product.ratingCount} reviews)` : ""}
          </p>

          {product.discountPercent > 0 ? (
            <div style={{ marginBottom: 6 }}>
              <span className="price-strike" style={{ fontSize: 14 }}>Rs. {product.price?.toLocaleString()}</span>
              <span className="badge badge-pending" style={{ marginLeft: 8 }}>-{product.discountPercent}%</span>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 600, color: "var(--color-primary)", margin: "2px 0 0" }}>
                Rs. {salePrice.toLocaleString()}
              </p>
            </div>
          ) : (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 600, color: "var(--color-primary)", margin: "0 0 8px" }}>
              Rs. {product.price?.toLocaleString()}
            </p>
          )}

          <p style={{ fontSize: 13, color: product.stock > 0 ? "var(--color-success)" : "var(--color-danger)", marginBottom: 14 }}>
            {product.stock > 0 ? `In stock (${product.stock} available)` : "Out of stock"}
          </p>

          {product.stock > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <label className="field-label" style={{ margin: 0 }}>Qty</label>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
                style={{ width: 70 }}
              />
            </div>
          )}

          <button className="btn" onClick={addToCart} disabled={product.stock === 0}>
            Add to Cart
          </button>
          <button className="btn btn-secondary" onClick={toggleWishlist}>
            ♡ Add to Wishlist
          </button>
          {status && <p style={{ marginTop: 8, fontSize: 13, color: "var(--color-ink-soft)" }}>{status}</p>}

          <div style={{ marginTop: 14 }}>
            <div className="buy-box__row"><Truck size={15} /> Free delivery in 2-4 business days</div>
            <div className="buy-box__row"><ShieldCheck size={15} /> Secure, JWT-authenticated checkout</div>
            <div className="buy-box__row"><RotateCcw size={15} /> 7-day easy returns</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28 }}>
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, marginBottom: 10 }}>About this item</h3>
            {highlights.length > 0 ? (
              <ul className="highlights-list">
                {highlights.map((h, i) => (
                  <li key={i}>{h}.</li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "var(--color-ink-soft)" }}>No description provided.</p>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 10 }}>Product details</h3>
            <div className="buy-box__row"><strong style={{ minWidth: 110 }}>Category</strong> {product.category}</div>
            <div className="buy-box__row"><strong style={{ minWidth: 110 }}>Price</strong> Rs. {product.price?.toLocaleString()}</div>
            <div className="buy-box__row"><strong style={{ minWidth: 110 }}>Availability</strong> {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</div>
            <div className="buy-box__row"><strong style={{ minWidth: 110 }}>Rating</strong> {product.ratingAverage || "Not yet rated"} ({product.ratingCount} reviews)</div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Reviews</h3>
          {reviews.length === 0 && <p style={{ color: "var(--color-ink-soft)" }}>No reviews yet — be the first.</p>}
          {reviews.map((r) => (
            <div key={r._id} style={{ padding: "10px 0", borderTop: "1px solid var(--color-border)" }}>
              <strong style={{ fontSize: 13.5 }}>{r.user?.name}</strong>{" "}
              <span style={{ color: "var(--color-gold)", fontSize: 12.5 }}>⭐ {r.rating}</span>
              <p style={{ margin: "4px 0 0", color: "var(--color-ink-soft)", fontSize: 13 }}>{r.comment}</p>
            </div>
          ))}

          {user && (
            <form onSubmit={submitReview} style={{ marginTop: 16 }}>
              <h4 style={{ fontSize: 13 }}>Leave a Review</h4>
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} stars
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Your comment"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              />
              <button className="btn" type="submit" style={{ marginTop: 8, width: "100%" }}>
                Submit Review
              </button>
            </form>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section style={{ marginTop: 44 }}>
          <div className="section-title">
            <h2>You may also like</h2>
            <span>More from {product.category}</span>
          </div>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
