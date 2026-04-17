import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

const ProductGrid = ({ products, onAddToCart, onViewProduct, onToggleFavorite, favorites = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const totalPages = Math.ceil(products.length / productsPerPage);
  const displayedProducts = products.slice(0, currentPage * productsPerPage);

  return (
    <div className="space-y-12">
      {/* Product Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        <AnimatePresence mode='popLayout'>
          {displayedProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <ProductCard 
                product={product} 
                onAddToCart={onAddToCart} 
                onView={() => onViewProduct(product)}
                onToggleFavorite={() => onToggleFavorite(product.id)}
                isFavorite={favorites.includes(product.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Load More */}
      {currentPage < totalPages && (
        <div className="flex flex-col items-center gap-6 pt-12">
          <p className="text-brand-muted text-sm font-jakarta font-medium">
            Mostrando {displayedProducts.length} de {products.length} productos
          </p>
          <div className="w-full max-w-xs h-1 bg-surface-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(displayedProducts.length / products.length) * 100}%` }}
            />
          </div>
          <button 
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="btn-primary"
          >
            EXPLORAR MÁS PRODUCTOS
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
