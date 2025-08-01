import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Eye, 
  Menu, 
  X, 
  ChevronDown,
  Shield,
  Camera,
  ScanLine,
  EyeOff,
  Search  // Added for Zero Shot Detection
} from 'lucide-react';
import './navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProductsDropdown = () => {
    setIsProductsDropdownOpen(!isProductsDropdownOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const productFeatures = [
    {
      path: '/object',
      title: 'AI Surveillance',
      description: 'Multi-camera object tracking',
      icon: Camera
    },
    {
      path: '/blur',
      title: 'Obfuscation',
      description: 'Privacy protection AI',
      icon: EyeOff
    },
    {
      path: '/alter',
      title: 'Content Detection',
      description: 'Deepfake & manipulation detection',
      icon: ScanLine
    },
    {
      path: '/Zeroshot',
      title: 'Zero Shot Detection',
      description: 'Advanced logo detection without training',
      icon: Search
    }
  ];

  return (
    <nav className={`gods-eye-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        
        {/* Logo Section */}
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <Eye size={28} />
            <div className="icon-glow"></div>
          </div>
          <div className="brand-text">
            <span className="brand-primary">God's</span>
            <span className="brand-secondary">Eye</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-menu">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link 
                to="/" 
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
              >
                Home
              </Link>
            </li>

            {/* Products Dropdown */}
            <li 
              className="nav-item dropdown"
              onMouseEnter={() => setIsProductsDropdownOpen(true)}
              onMouseLeave={() => setIsProductsDropdownOpen(false)}
            >
              <button 
                className={`nav-link dropdown-toggle ${
                  productFeatures.some(feature => isActive(feature.path)) ? 'active' : ''
                }`}
                onClick={toggleProductsDropdown}
              >
                Products
                <ChevronDown 
                  size={16} 
                  className={`dropdown-icon ${isProductsDropdownOpen ? 'rotated' : ''}`} 
                />
              </button>
              
              <div className={`dropdown-menu ${isProductsDropdownOpen ? 'show' : ''}`}>
                <div className="dropdown-content">
                  {productFeatures.map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
                      <Link 
                        key={index}
                        to={feature.path} 
                        className={`dropdown-item ${isActive(feature.path) ? 'active' : ''}`}
                      >
                        <div className="dropdown-item-icon">
                          <IconComponent size={20} />
                        </div>
                        <div className="dropdown-item-content">
                          <span className="dropdown-item-title">{feature.title}</span>
                          <span className="dropdown-item-desc">{feature.description}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </li>

            <li className="nav-item">
              <Link 
                to="/about" 
                className={`nav-link ${isActive('/about') ? 'active' : ''}`}
              >
                About
              </Link>
            </li>

            <li className="nav-item">
              <Link 
                to="/how-it-works" 
                className={`nav-link ${isActive('/how-it-works') ? 'active' : ''}`}
              >
                How it Works
              </Link>
            </li>

            <li className="nav-item">
              <Link 
                to="/pricing" 
                className={`nav-link ${isActive('/pricing') ? 'active' : ''}`}
              >
                Pricing
              </Link>
            </li>
          </ul>

          {/* CTA Button Section Removed */}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          <Link 
            to="/" 
            className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>

          <div className="mobile-dropdown">
            <button 
              className="mobile-dropdown-toggle"
              onClick={toggleProductsDropdown}
            >
              Products
              <ChevronDown 
                size={16} 
                className={`dropdown-icon ${isProductsDropdownOpen ? 'rotated' : ''}`} 
              />
            </button>
            
            <div className={`mobile-dropdown-content ${isProductsDropdownOpen ? 'show' : ''}`}>
              {productFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Link 
                    key={index}
                    to={feature.path} 
                    className={`mobile-dropdown-item ${isActive(feature.path) ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <IconComponent size={18} />
                    <span>{feature.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <Link 
            to="/about" 
            className={`mobile-nav-link ${isActive('/about') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About
          </Link>

          <Link 
            to="/how-it-works" 
            className={`mobile-nav-link ${isActive('/how-it-works') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            How it Works
          </Link>

          <Link 
            to="/pricing" 
            className={`mobile-nav-link ${isActive('/pricing') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Pricing
          </Link>

          {/* Mobile CTA Section Removed */}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;
