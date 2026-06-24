import { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import { motion } from 'framer-motion';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary">VibeCart</span>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <SearchBar />
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/products" className="text-gray-600 hover:text-primary">
              Products
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden py-2">
          <SearchBar />
        </div>
      </div>

    </nav>
  );
};

export default Navbar;