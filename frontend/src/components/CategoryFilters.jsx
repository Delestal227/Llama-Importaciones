import React from 'react';
import { motion } from 'framer-motion';

const categories = [
  { id: 'all', name: 'TODOS', icon: '✨' },
  { id: 'bazar-cocina', name: 'BAZAR & COCINA', icon: '🍳' },
  { id: 'electronica', name: 'ELECTRÓNICA', icon: '🔌' },
  { id: 'hogar', name: 'HOGAR', icon: '🏠' },
  { id: 'cuidado-personal', name: 'CUIDADO PERSONAL', icon: '🛁' },
  { id: 'tecnologia', name: 'TECNOLOGÍA', icon: '💻' },
  { id: 'varios', name: 'VARIOS', icon: '📦' },
];

const CategoryFilters = ({ currentCategory, onCategoryChange }) => {
  return (
    <div className="flex flex-col gap-6 mb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-bebas text-5xl text-brand-charcoal tracking-wider">NUESTRO CATALOGO</h2>
          <p className="text-primary font-bold tracking-[0.2em] text-[10px] mt-2 uppercase">Filtrar por categoría</p>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-full font-jakarta text-xs font-bold tracking-widest whitespace-nowrap transition-all duration-300 border ${
              currentCategory === cat.id
                ? 'bg-primary border-primary text-white shadow-lg scale-105'
                : 'bg-white border-surface-300 text-brand-muted hover:border-primary/40 hover:text-primary shadow-sm hover:shadow-md'
            }`}
          >
            <span>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilters;
