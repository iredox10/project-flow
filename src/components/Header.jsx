
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiMenu, FiX } from 'react-icons/fi';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'About', href: '#about' }
  ];

  return (
    <header className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <FiBookOpen className="w-8 h-8 text-indigo-600" />
          <span className="text-2xl font-bold text-gray-900">Projeckt</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="text-gray-600 hover:text-indigo-600 transition duration-300 font-medium">
              {link.name}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition duration-300">
            Login
          </Link>
          <Link to="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 shadow-sm">
            Sign Up
          </Link>
        </div>
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 focus:outline-none">
            {isMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-white py-4">
          <nav className="flex flex-col items-center space-y-4">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-gray-600 hover:text-indigo-600 transition duration-300 font-medium" onClick={() => setIsMenuOpen(false)}>
                {link.name}
              </a>
            ))}
            <div className="flex flex-col items-center space-y-4 mt-4 border-t w-full pt-4">
              <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition duration-300" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
              <Link to="/signup" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 shadow-sm" onClick={() => setIsMenuOpen(false)}>
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
