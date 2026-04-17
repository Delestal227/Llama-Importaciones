import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, Search } from 'lucide-react';
import AuthButton from './AuthButton';

const Header = ({ cartCount, onOpenCart }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'py-4 glass border-b' : 'py-6 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img 
            src="/assets/logo.webp" 
            alt="Llama Logo" 
            className="h-12 w-auto transition-all duration-300"
          />
          <span className={`font-bebas text-3xl tracking-wider transition-colors duration-300 ${
            isScrolled ? 'text-brand-charcoal' : 'text-white'
          }`}>
            LLAMA IMPORTACIONES
          </span>
        </div>

        {/* Navigation - Desktop */}
        <nav className={`hidden md:flex items-center gap-8 font-jakarta text-sm font-semibold tracking-widest ${
          isScrolled ? 'text-brand-charcoal' : 'text-white'
        }`}>
          <a href="#catalog" className="hover:text-primary transition-colors">CATALOGO</a>
          <a href="#about" className="hover:text-primary transition-colors">NOSOTROS</a>
          <a href="#contact" className="hover:text-primary transition-colors">CONTACTO</a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
            isScrolled ? 'text-brand-charcoal' : 'text-white'
          }`}>
            <Search size={22} />
          </button>
          
          <button
            onClick={onOpenCart}
            className="relative p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-all border border-primary/20 group"
          >
            <ShoppingCart className={isScrolled ? 'text-brand-charcoal' : 'text-white'} size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          <AuthButton isScrolled={isScrolled} />

          <button className="md:hidden p-2 text-white">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
