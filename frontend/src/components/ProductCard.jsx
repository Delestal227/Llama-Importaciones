import React, { useState } from 'react';
import { ShoppingCart, Heart, Eye, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductCard = ({ product, onAddToCart, onView, onToggleFavorite, isFavorite }) => {
  const [qty, setQty] = useState(1);
  const isAgotado = product.stock === 0 && product.sku;
  const isConsultar = product.stock === 0 && !product.sku;
  
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="card-premium group"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-surface-200">
        <img 
          src={product.images?.[0] || 'https://via.placeholder.com/400x400?text=No+Image'} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.stock < 5 && product.stock > 0 && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">
              Últimas {product.stock} u.
            </span>
          )}
          {isConsultar && (
            <span className="bg-primary shadow-lg text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
              Consultar Stock
            </span>
          )}
        </div>

        {/* Quick Actions overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); onView(); }}
            className="p-4 bg-white rounded-full shadow-xl hover:bg-primary hover:text-white transition-all transform scale-90 group-hover:scale-100 duration-300"
            title="Visualizar"
          >
            <Eye size={22} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className={`p-4 rounded-full shadow-xl transition-all transform scale-90 delay-75 group-hover:scale-100 duration-300 ${
              isFavorite 
              ? 'bg-red-500 text-white' 
              : 'bg-white text-brand-charcoal hover:bg-primary hover:text-white'
            }`}
            title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart size={22} className={isFavorite ? 'fill-current' : ''} />
          </button>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div className="w-full">
            <p className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase mb-1">
              {product.category || 'VARIOS'}
            </p>
            <h3 className="font-bebas text-2xl text-brand-charcoal tracking-wide leading-tight group-hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
          </div>
        </div>

        <p className="text-brand-muted text-xs line-clamp-2 mb-4 font-light leading-relaxed min-h-[32px]">
          {product.description || 'Producto importado de alta calidad seleccionado especialmente.'}
        </p>

        <div className="pt-4 border-t border-surface-200">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest mb-1">Precio</p>
              <p className="font-bebas text-4xl text-brand-charcoal leading-none">
                ${product.price?.toLocaleString()}
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-surface-100 rounded-lg p-1 border border-surface-200">
              <button 
                onClick={(e) => { e.stopPropagation(); setQty(Math.max(1, qty - 1)); }}
                className="p-1.5 hover:bg-white rounded-md transition-all text-brand-muted hover:text-primary"
              >
                <Minus size={14} />
              </button>
              <span className="font-bebas text-lg w-6 text-center text-brand-charcoal">{qty}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setQty(qty + 1); }}
                className="p-1.5 hover:bg-white rounded-md transition-all text-brand-muted hover:text-primary"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product, qty);
              setQty(1); // Reset after adding
            }}
            disabled={isAgotado}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl transition-all duration-300 font-bebas text-xl tracking-widest ${
              isAgotado 
              ? 'bg-surface-300 text-brand-muted cursor-not-allowed' 
              : 'bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-sm hover:shadow-primary/20'
            }`}
          >
            <ShoppingCart size={20} />
            AGREGAR {qty > 1 && `(${qty})`} AL CARRITO
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
