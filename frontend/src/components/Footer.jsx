import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <h4>Trove</h4>
          <p style={{ maxWidth: 260, lineHeight: 1.6 }}>
            An AI-powered marketplace that learns what you like and helps sellers
            reach the right customers — 
          </p>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook"><Facebook size={15} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={15} /></a>
            <a href="#" aria-label="Twitter"><Twitter size={15} /></a>
          </div>
        </div>
        <div>
          <h4>Shop</h4>
          <a href="/">All Products</a>
          <a href="/wishlist">Wishlist</a>
          <a href="/orders">Track Order</a>
        </div>
        <div>
          <h4>Sell</h4>
          <a href="/seller">Seller Hub</a>
          <a href="/register">Become a Seller</a>
        </div>
        <div>
          <h4>Support</h4>
          <a href="#">Help Center</a>
          <a href="#">Returns & Refunds</a>
          <a href="#">Contact Us</a>
          <div className="footer-payments">
            <span className="payment-chip">VISA</span>
            <span className="payment-chip">MASTERCARD</span>
            <span className="payment-chip">JAZZCASH</span>
            <span className="payment-chip">EASYPAISA</span>
          </div>
        </div>
      </div>
      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} Trove. All rights reserved.</span>
        <span>Secure checkout · JWT-authenticated accounts</span>
      </div>
    </footer>
  );
};

export default Footer;
