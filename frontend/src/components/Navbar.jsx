import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Package, Store, LayoutDashboard, LogOut, ClipboardList } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { CATEGORIES } from "../constants";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/?keyword=${encodeURIComponent(query)}`);
  };

  return (
    <header className="site-header">
      <div className="site-header__top">
        <Link to="/" className="brand">
          <span className="brand__mark">T</span>
          Trove
        </Link>

        <form className="searchbar" onSubmit={handleSearch}>
          <input
            placeholder="Search for products, brands and categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <nav className="header-links">
          <Link to="/wishlist" style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Heart size={16} /> Wishlist
          </Link>
          <Link to="/cart" style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <ShoppingCart size={16} /> Cart
          </Link>
          <Link to="/orders" style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Package size={16} /> Orders
          </Link>
          {user?.role === "seller" && (
            <Link to="/seller" style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Store size={16} /> Seller Hub
            </Link>
          )}
          {(user?.role === "seller" || user?.role === "admin") && (
            <Link to="/manage-orders" style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <ClipboardList size={16} /> Manage Orders
            </Link>
          )}
          {user?.role === "admin" && (
            <Link to="/admin" style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <LayoutDashboard size={16} /> Admin
            </Link>
          )}
          {user ? (
            <>
              <span>Hi, {user.name.split(" ")[0]}</span>
              <button className="btn btn-outline" onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="category-strip">
        <div className="category-strip__inner">
          {CATEGORIES.map((c) => (
            <Link key={c} to={`/?category=${encodeURIComponent(c)}`} className="chip">
              {c}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
