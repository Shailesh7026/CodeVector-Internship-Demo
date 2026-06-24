import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">VibeCart</h3>
            <p className="text-gray-400">
              Your one-stop shop for the best products at great prices.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white">
                  Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products?category=electronics"
                  className="text-gray-400 hover:text-white"
                >
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=books"
                  className="text-gray-400 hover:text-white"
                >
                  Books
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=clothing"
                  className="text-gray-400 hover:text-white"
                >
                  Clothing
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=sports"
                  className="text-gray-400 hover:text-white"
                >
                  Home
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} VibeCart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;