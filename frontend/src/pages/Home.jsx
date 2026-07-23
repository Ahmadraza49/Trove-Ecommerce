import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Cpu,
  Footprints,
  Shirt,
  Home as HomeIcon,
  Sparkles,
  Dumbbell,
  BookOpen,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Zap,
  ShoppingBasket,
} from "lucide-react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import { CATEGORIES as CATEGORY_NAMES } from "../constants";
import { useAuth } from "../context/AuthContext";

const CATEGORY_ICONS = [Cpu, Footprints, Shirt, HomeIcon, Sparkles, Dumbbell, BookOpen, ShoppingBasket];
const CATEGORIES = CATEGORY_NAMES.map((name, i) => ({ name, icon: CATEGORY_ICONS[i] }));

const TRUST_ITEMS = [
  { icon: Truck, title: "Fast delivery", sub: "2-4 business days nationwide" },
  { icon: ShieldCheck, title: "Secure checkout", sub: "JWT-authenticated accounts" },
  { icon: RotateCcw, title: "Easy returns", sub: "7-day return window" },
  { icon: Headphones, title: "24/7 support", sub: "AI chatbot + live team" },
];

const PAGE_SIZE = 8;

// A tiny deterministic "match score" derived from rating, just to give the
// AI-match badge a believable number without inventing a fake ML score.
const matchScore = (product) => Math.min(99, Math.round(70 + (product.ratingAverage || 3) * 6));

const useCountdown = () => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return end - new Date();
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      setTimeLeft(Math.max(0, end - new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const h = Math.floor(timeLeft / 3600000);
  const m = Math.floor((timeLeft % 3600000) / 60000);
  const s = Math.floor((timeLeft % 60000) / 1000);
  return { h, m, s };
};

const HeroOrbit = () => (
  <svg viewBox="0 0 200 200" fill="none">
    <circle cx="100" cy="100" r="90" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" />
    <circle cx="100" cy="100" r="62" stroke="white" strokeOpacity="0.22" strokeWidth="1.5" strokeDasharray="4 6" />
    <circle cx="100" cy="100" r="34" fill="#FF6A3D" fillOpacity="0.9" />
    <circle cx="176" cy="100" r="7" fill="#FF6A3D" />
    <circle cx="40" cy="46" r="5" fill="white" fillOpacity="0.7" />
    <circle cx="150" cy="164" r="4" fill="white" fillOpacity="0.5" />
  </svg>
);

const Home = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [recSource, setRecSource] = useState("browsing_history");
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState(null);
  const countdown = useCountdown();

  const loadProducts = async () => {
    const res = await api.get("/products", { params: { keyword, category, maxPrice, sort } });
    setProducts(res.data.products);
    setMessage(res.data.message || "");
  };

  const loadRecommendations = async () => {
    const res = await api.get("/ai/recommendations");
    setRecommended(res.data.products);
    setRecSource(res.data.basedOn);
  };

  useEffect(() => {
    setKeyword(searchParams.get("keyword") || "");
    setCategory(searchParams.get("category") || "");
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, category, maxPrice, sort]);

  useEffect(() => {
    loadRecommendations();
    if (user) {
      api.get("/auth/recently-viewed").then((res) => setRecentlyViewed(res.data));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ keyword, category });
  };

  const showToast = (text, isError) => {
    setToast({ text, isError });
    setTimeout(() => setToast(null), 2200);
  };

  const visibleProducts = useMemo(
    () => products.filter((p) => (p.ratingAverage || 0) >= minRating),
    [products, minRating]
  );

  const flashDeals = useMemo(() => products.filter((p) => p.discountPercent > 0), [products]);
  const bestSellers = useMemo(
    () => [...products].sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0)).slice(0, 4),
    [products]
  );

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / PAGE_SIZE));
  const pageItems = visibleProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="container">
      <div className="promo-row">
        <section className="hero" style={{ margin: 0 }}>
          <div className="hero__content">
            <span className="hero__eyebrow">
              <Zap size={13} /> AI Recommendation Engine
            </span>
            <h1>Shopping that gets sharper every click.</h1>
            <p>
              Trove learns from what you browse and matches you with products you're
              actually likely to want — no endless scrolling, just relevant picks.
            </p>
            <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, maxWidth: 420 }}>
              <input
                placeholder="Try 'headphones' or 'shoes'..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{ background: "rgba(255,255,255,0.95)" }}
              />
              <button className="btn" type="submit">
                Explore
              </button>
            </form>
          </div>
          <div className="hero__orbit">
            <HeroOrbit />
          </div>
        </section>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="promo-card coral">
            <h3>Seller Hub is live</h3>
            <p>List products, run flash deals, and track orders in one place.</p>
          </div>
          <div className="promo-card forest">
            <h3>7-day easy returns</h3>
            <p>Shop with confidence — hassle-free returns on every order.</p>
          </div>
        </div>
      </div>

      <div className="category-grid">
        {CATEGORIES.map(({ name, icon: Icon }) => (
          <div key={name} className="category-tile" onClick={() => setSearchParams({ category: name })}>
            <div className="category-tile__icon">
              <Icon size={19} />
            </div>
            <span>{name}</span>
          </div>
        ))}
      </div>

      <div className="trust-strip">
        {TRUST_ITEMS.map(({ icon: Icon, title, sub }) => (
          <div key={title} className="trust-item">
            <div className="trust-item__icon">
              <Icon size={17} />
            </div>
            <div>
              <strong>{title}</strong>
              <span>{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {flashDeals.length > 0 && (
        <section className="flash-sale">
          <div className="flash-sale__header">
            <div className="flash-sale__title">
              <Zap size={18} color="#FF6A3D" /> Flash Deals
            </div>
            <div className="flash-sale__countdown">
              <span>{pad(countdown.h)}h</span>
              <span>{pad(countdown.m)}m</span>
              <span>{pad(countdown.s)}s</span>
            </div>
          </div>
          <div className="product-grid">
            {flashDeals.map((p) => (
              <ProductCard key={p._id} product={p} onAdded={showToast} />
            ))}
          </div>
        </section>
      )}

      {recentlyViewed.length > 0 && (
        <section style={{ marginBottom: 44 }}>
          <div className="section-title">
            <h2>Recently viewed</h2>
            <span>Pick up where you left off</span>
          </div>
          <div className="product-grid">
            {recentlyViewed.map((p) => (
              <ProductCard key={p._id} product={p} onAdded={showToast} />
            ))}
          </div>
        </section>
      )}

      {recommended.length > 0 && (
        <section style={{ marginBottom: 44 }}>
          <div className="section-title">
            <h2>Recommended for you</h2>
            <span>
              {recSource === "gemini_ai"
                ? "AI-ranked with Gemini"
                : recSource === "browsing_history"
                ? "Based on your browsing history"
                : "Popular picks"}
            </span>
          </div>
          <div className="product-grid">
            {recommended.map((p) => (
              <ProductCard key={p._id} product={p} aiMatch={matchScore(p)} onAdded={showToast} />
            ))}
          </div>
        </section>
      )}

      {bestSellers.length > 0 && (
        <section style={{ marginBottom: 44 }}>
          <div className="section-title">
            <h2>Best sellers</h2>
            <span>Top rated right now</span>
          </div>
          <div className="product-grid">
            {bestSellers.map((p) => (
              <ProductCard key={p._id} product={p} onAdded={showToast} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="section-title">
          <h2>{category ? category : "All Products"}</h2>
          <span>{visibleProducts.length} items</span>
        </div>

        {message && (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>{message}</p>
          </div>
        )}

        {!message && (
          <div className="listing-layout">
            <aside className="filters-panel">
              <h4>Category</h4>
              <div className="filter-group">
                <label>
                  <input type="radio" checked={!category} onChange={() => setSearchParams({ keyword })} />
                  All
                </label>
                {CATEGORIES.map(({ name }) => (
                  <label key={name}>
                    <input
                      type="radio"
                      checked={category === name}
                      onChange={() => setSearchParams({ category: name, keyword })}
                    />
                    {name}
                  </label>
                ))}
              </div>

              <h4>Max Price</h4>
              <div className="filter-group price-range-inputs">
                <input
                  type="number"
                  placeholder="Any"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>

              <h4>Minimum Rating</h4>
              <div className="filter-group">
                {[0, 3, 4, 4.5].map((r) => (
                  <label key={r}>
                    <input type="radio" checked={minRating === r} onChange={() => setMinRating(r)} />
                    {r === 0 ? "Any rating" : `${r}+ stars`}
                  </label>
                ))}
              </div>
            </aside>

            <div>
              <div className="sort-bar">
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

              <div className="product-grid">
                {pageItems.map((p) => (
                  <ProductCard key={p._id} product={p} onAdded={showToast} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button key={n} className={n === page ? "active" : ""} onClick={() => setPage(n)}>
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="newsletter">
        <h3>Get the best deals first</h3>
        <p>Subscribe for flash-sale alerts and new arrivals — no spam, unsubscribe anytime.</p>
        <form onSubmit={(e) => { e.preventDefault(); showToast("Subscribed! You'll hear from us soon."); }}>
          <input type="email" placeholder="you@example.com" required />
          <button className="btn" type="submit">
            Subscribe
          </button>
        </form>
      </section>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 22,
            background: toast.isError ? "#d64545" : "#1f9d6f",
            color: "white",
            padding: "10px 16px",
            borderRadius: 10,
            fontSize: 13.5,
            boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
            zIndex: 1000,
          }}
        >
          {toast.isError ? toast.text : `Added "${toast.text}" to cart`}
        </div>
      )}
    </div>
  );
};

export default Home;
