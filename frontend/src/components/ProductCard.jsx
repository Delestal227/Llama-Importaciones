import React from 'react';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductCard = ({ product, onAddToCart }) => {
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
            <span className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
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
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button className="p-3 bg-white rounded-full shadow-lg hover:bg-primary hover:text-white transition-all transform scale-90 group-hover:scale-100 duration-300">
            <Eye size={20} />
          </button>
          <button className="p-3 bg-white rounded-full shadow-lg hover:bg-primary hover:text-white transition-all transform scale-90 delay-75 group-hover:scale-100 duration-300">
            <Heart size={20} />
          </button>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase mb-1">
              {product.category || 'VARIOS'}
            </p>
            <h3 className="font-bebas text-2xl text-brand-charcoal tracking-wide leading-tight group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </div>
        </div>

        <p className="text-brand-muted text-xs line-clamp-2 mb-4 font-light leading-relaxed">
          {product.description || 'Producto importado de alta calidad seleccionado especialmente.'}
        </p>

        <div className="flex items-end justify-between pt-4 border-t border-surface-200">
          <div>
            <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest mb-1">Precio</p>
            <p className="font-bebas text-3xl text-brand-charcoal">
              ${product.price?.toLocaleString()}
            </p>
          </div>
          
          <button 
            onClick={() => onAddToCart(product)}
            disabled={isAgotado}
            className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-300 ${
              isAgotado 
              ? 'bg-surface-300 text-brand-muted cursor-not-allowed' 
              : 'bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-sm hover:shadow-lg'
            }`}
          >
            <ShoppingCart size={20} />
            <span className="font-bebas text-lg tracking-wider px-1">AGREGAR</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
