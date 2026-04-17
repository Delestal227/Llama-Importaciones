import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-brand-charcoal">
      {/* Dynamic Background */}
      <div className="absolute inset-0 opacity-40">
        <img 
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop" 
          alt="Llama Lifestyle" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-charcoal/60 via-transparent to-brand-charcoal/80" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <span className="font-jakarta text-primary font-bold tracking-[0.3em] text-sm uppercase">
            CALIDAD · EXCLUSIVIDAD · CONFIANZA
          </span>
          
          <h1 className="font-bebas text-7xl md:text-9xl text-white tracking-widest leading-none">
            ESTILO QUE <br /> 
            <span className="text-primary italic">CONECTA</span>
          </h1>

          <p className="font-jakarta text-white/60 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Explora una selección curada de piezas importadas que transforman lo cotidiano en algo extraordinario. 
            Calidad garantizada, diseño sin fronteras.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-12">
            <a href="#catalog" className="btn-primary flex items-center gap-2 group">
              VER CATALOGO 
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <button className="bg-white/5 backdrop-blur-sm border border-white/10 text-white px-8 py-4 rounded-xl font-jakarta font-semibold hover:bg-white/10 transition-all">
              CONSULTAR POR WHATSAPP
            </button>
          </div>
        </motion.div>
      </div>

      {/* Floating Badge */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute bottom-10 right-10 hidden lg:block"
      >
        <div className="glass p-6 rounded-2xl border-white/30 text-brand-charcoal">
          <p className="font-bebas text-2xl mb-1">+500 PRODUCTOS</p>
          <p className="font-jakarta text-xs text-brand-gray">NUEVO STOCK CADA SEMANA</p>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
