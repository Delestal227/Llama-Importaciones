import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

const Cart = ({ isOpen, onClose, cart, onUpdateQuantity, onRemove, onCheckout }) => {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md glass z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/20 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-primary" size={24} />
                <h2 className="font-bebas text-3xl text-brand-charcoal tracking-wider">MI CARRITO</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-surface-200 rounded-full flex items-center justify-center text-brand-muted">
                    <ShoppingBag size={40} />
                  </div>
                  <p className="font-jakarta text-brand-muted font-medium">Tu carrito está vacío</p>
                  <button 
                    onClick={onClose}
                    className="btn-secondary text-sm"
                  >
                    CONTINUAR COMPRANDO
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-white/50 rounded-2xl border border-white/30">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-white shrink-0">
                      <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bebas text-xl text-brand-charcoal truncate">{item.name}</h4>
                        <button 
                          onClick={() => onRemove(item.id)}
                          className="text-brand-muted hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <p className="text-primary font-bebas text-lg mb-3">
                        ${item.price.toLocaleString()}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 bg-white/50 rounded-lg p-1 border border-white/50">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-white rounded-md transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-bebas text-lg w-6 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-white rounded-md transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="font-bebas text-xl text-brand-charcoal">
                          ${(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-8 border-t border-white/20 space-y-6 bg-white/20">
                <div className="flex justify-between items-center">
                  <p className="font-jakarta text-brand-muted font-medium tracking-widest text-xs uppercase">SUBTOTAL</p>
                  <p className="font-bebas text-3xl text-brand-charcoal">${subtotal.toLocaleString()}</p>
                </div>
                <button 
                  onClick={onCheckout}
                  className="w-full btn-primary py-5 text-lg"
                >
                  REALIZAR PEDIDO
                </button>
                <p className="text-center text-xs text-brand-muted font-medium">
                  Envío gratis en compras superiores a $50,000
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;
