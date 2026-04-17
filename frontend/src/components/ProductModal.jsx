import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Heart, Check, Plus, Minus } from 'lucide-react';

const ProductModal = ({ product, isOpen, onClose, onAddToCart, isFavorite, onToggleFavorite }) => {
  const [qty, setQty] = useState(1);
  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-charcoal/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md text-brand-charcoal md:text-white transition-all"
            >
              <X size={24} />
            </button>

            {/* Image Section */}
            <div className="w-full md:w-3/5 bg-surface-100 relative group">
              <img 
                src={product.images?.[0] || 'https://via.placeholder.com/800x800?text=No+Image'} 
                alt={product.name}
                className="w-full h-full object-contain md:object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>

            {/* Content Section */}
            <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col justify-center overflow-y-auto">
              <div className="space-y-8">
                <div>
                  <p className="text-xs font-bold text-primary tracking-[0.3em] uppercase mb-3">
                    {product.category || 'Colección Premium'}
                  </p>
                  <h2 className="font-bebas text-5xl md:text-6xl text-brand-charcoal leading-none tracking-wide">
                    {product.name}
                  </h2>
                </div>

                <p className="font-jakarta text-brand-muted text-lg leading-relaxed">
                  {product.description || 'Este producto ha sido seleccionado bajo los más estrictos criterios de calidad y diseño de Llama Importaciones.'}
                </p>

                <div className="pt-6 border-t border-surface-200 flex justify-between items-end">
                  <div>
                    <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-2">Precio de Lista</p>
                    <div className="flex items-baseline gap-4">
                      <span className="font-bebas text-5xl text-brand-charcoal">
                        ${product.price?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-surface-100 rounded-xl p-2 border border-surface-200">
                    <button 
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="p-2 hover:bg-white rounded-lg transition-all text-brand-muted hover:text-primary shadow-sm hover:shadow-md"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="font-bebas text-3xl w-10 text-center text-brand-charcoal">{qty}</span>
                    <button 
                      onClick={() => setQty(qty + 1)}
                      className="p-2 hover:bg-white rounded-lg transition-all text-brand-muted hover:text-primary shadow-sm hover:shadow-md"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-4">
                  <button 
                    onClick={() => {
                      onAddToCart(product, qty);
                      setQty(1);
                    }}
                    className="w-full bg-primary text-white py-5 rounded-2xl font-bebas text-2xl tracking-widest flex items-center justify-center gap-3 hover:bg-primary-dark transition-all transform hover:scale-[1.02] shadow-xl hover:shadow-primary/20"
                  >
                    <ShoppingCart size={24} />
                    AGREGAR {qty > 1 && `(${qty})`} AL CARRITO
                  </button>

                  <button 
                    onClick={() => onToggleFavorite(product.id)}
                    className={`w-full py-4 rounded-2xl font-jakarta font-bold flex items-center justify-center gap-2 transition-all border-2 ${
                      isFavorite 
                      ? 'bg-red-50 border-red-100 text-red-500' 
                      : 'bg-white border-surface-200 text-brand-charcoal hover:border-primary hover:text-primary'
                    }`}
                  >
                    <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
                    {isFavorite ? 'EN FAVORITOS' : 'AGREGAR A FAVORITOS'}
                  </button>
                </div>

                <div className="pt-6">
                  <div className="flex items-center gap-3 p-4 bg-surface-50 rounded-2xl border border-surface-100">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Check size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-brand-charcoal uppercase tracking-wider">Garantía Llama</p>
                      <p className="text-xs text-brand-muted">Calidad verificada y envío asegurado.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;
