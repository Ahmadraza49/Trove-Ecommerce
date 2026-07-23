import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.get("/wishlist").then((res) => {
      setItems(res.data);
      setLoaded(true);
    });
  }, []);

  return (
    <div className="container">
      <div className="section-title">
        <h2>Your Wishlist</h2>
        <span>{items.length} item(s)</span>
      </div>

      {loaded && items.length === 0 && (
        <div className="empty-state">
          <h3>Your wishlist is empty</h3>
          <p>Tap the wishlist button on any product page to save it here.</p>
          <Link to="/" className="btn" style={{ marginTop: 14, display: "inline-flex" }}>
            Browse Products
          </Link>
        </div>
      )}

      <div className="product-grid">
        {items.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
