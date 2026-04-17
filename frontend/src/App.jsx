import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryFilters from './components/CategoryFilters';
import ProductGrid from './components/ProductGrid';
import Cart from './components/Cart';
import { getProducts } from './services/api';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [category, setCategory] = useState('all');

  // Load products on mount and when category changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getProducts({ category });
        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('llama-cart-v2');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('llama-cart-v2', JSON.stringify(cart));
  }, [cart]);

  const handleAddToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    // Optional: Open cart drawer or show notification
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleRemoveFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const handleCheckout = () => {
    let message = `PEDIDO LLAMA IMPORTACIONES\n\nPRODUCTOS:\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toLocaleString()}\n`;
    });
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    message += `\nTOTAL: $${subtotal.toLocaleString()}\n\nFavor confirmar disponibilidad.`;
    
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/543884046739?text=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen">
      <Header 
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)}
      />
      
      <main>
        <Hero />
        
        <section id="catalog" className="py-24 bg-surface-100">
          <div className="container mx-auto px-6">
            <CategoryFilters 
              currentCategory={category}
              onCategoryChange={setCategory}
            />
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="font-jakarta text-brand-muted animate-pulse">Cargando catálogo premium...</p>
              </div>
            ) : (
              <ProductGrid 
                products={products} 
                onAddToCart={handleAddToCart}
              />
            )}
          </div>
        </section>

        {/* Brand Philosophy Section */}
        <section className="py-32 bg-brand-charcoal text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-12">
              <h2 className="font-bebas text-6xl md:text-8xl tracking-widest leading-none">
                CRITERIO · CALIDAD · <span className="text-primary italic">CONFIANZA</span>
              </h2>
              <p className="font-jakarta text-white/50 text-xl leading-relaxed italic">
                "No traemos todo, traemos lo mejor. En Llama nos obsesionamos con el criterio: cada objeto importado responde a una necesidad real con un diseño excepcional."
              </p>
              <div className="pt-8 flex justify-center">
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-16 h-16 rounded-full border-4 border-brand-charcoal glass overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i+10}`} alt="User" />
                    </div>
                  ))}
                  <div className="w-16 h-16 rounded-full border-4 border-brand-charcoal bg-primary flex items-center justify-center font-bold text-sm">
                    +1k
                  </div>
                </div>
              </div>
              <p className="text-xs tracking-[0.3em] font-bold text-white/30 uppercase">
                Clientes satisfechos en todo el país
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-surface-200 py-12 border-t border-surface-300">
        <div className="container mx-auto px-6 text-center">
          <p className="font-bebas text-2xl text-brand-charcoal tracking-widest mb-4">LLAMA IMPORTACIONES</p>
          <p className="font-jakarta text-sm text-brand-muted">© {new Date().getFullYear()} - San Salvador de Jujuy, Argentina.</p>
        </div>
      </footer>

      <Cart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
}

export default App;
