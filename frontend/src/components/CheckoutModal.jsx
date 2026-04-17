import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { createOrder } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || '543884046739';

const buildWhatsAppMessage = (cart, order) => {
  let msg = `PEDIDO LLAMA IMPORTACIONES`;
  if (order?.id) msg += ` #${order.id}`;
  msg += `\n\nPRODUCTOS:\n`;
  cart.forEach((item, i) => {
    msg += `${i + 1}. ${item.name} (x${item.quantity}) - $${Math.floor(item.price * item.quantity).toLocaleString()}\n`;
  });
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  msg += `\nTOTAL: $${Math.floor(subtotal).toLocaleString()}\n\nConfirmo disponibilidad y coordino pago/env\u00edo.`;
  return msg;
};

const CheckoutModal = ({ isOpen, onClose, cart, onSuccess }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_type: 'pickup',
    delivery_address: '',
    payment_method: 'transfer',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.name) setForm(f => ({ ...f, customer_name: f.customer_name || user.name }));
  }, [user]);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const sendWhatsApp = (order) => {
    const encoded = encodeURIComponent(buildWhatsAppMessage(cart, order));
    window.open(`https://wa.me/${WHATSAPP}?text=${encoded}`, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        delivery_address: form.delivery_type === 'delivery' ? form.delivery_address : null,
        items: cart.map(c => ({ product_id: c.id, quantity: c.quantity })),
      };
      const { order } = await createOrder(payload);
      sendWhatsApp(order);
      onSuccess?.(order);
      onClose();
    } catch (err) {
      const apiError = err?.response?.data;
      if (apiError?.issues?.length) {
        setError(apiError.issues.map(i => `${i.path}: ${i.message}`).join(' \u2022 '));
      } else if (apiError?.error) {
        setError(apiError.error);
      } else {
        setError('No se pudo crear el pedido. Te llevamos a WhatsApp igualmente.');
        sendWhatsApp(null);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const field = 'w-full px-4 py-3 rounded-xl bg-white border border-surface-300 font-jakarta text-sm focus:outline-none focus:ring-2 focus:ring-primary/40';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
          />
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
            className="fixed inset-0 z-[111] flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-surface-100 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-surface-300 flex justify-between items-center">
                <h2 className="font-bebas text-3xl text-brand-charcoal tracking-wider">FINALIZAR PEDIDO</h2>
                <button onClick={onClose} className="p-2 hover:bg-white rounded-full">
                  <X size={22} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="font-jakarta text-xs tracking-widest text-brand-muted uppercase">Nombre</label>
                  <input required value={form.customer_name}
                    onChange={e => setForm({ ...form, customer_name: e.target.value })}
                    className={field} placeholder="Tu nombre completo" />
                </div>
                <div>
                  <label className="font-jakarta text-xs tracking-widest text-brand-muted uppercase">WhatsApp</label>
                  <input required value={form.customer_phone}
                    onChange={e => setForm({ ...form, customer_phone: e.target.value })}
                    className={field} placeholder="3884046739" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-jakarta text-xs tracking-widest text-brand-muted uppercase">Entrega</label>
                    <select value={form.delivery_type}
                      onChange={e => setForm({ ...form, delivery_type: e.target.value })}
                      className={field}>
                      <option value="pickup">Retiro en local</option>
                      <option value="delivery">Env\u00edo a domicilio</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-jakarta text-xs tracking-widest text-brand-muted uppercase">Pago</label>
                    <select value={form.payment_method}
                      onChange={e => setForm({ ...form, payment_method: e.target.value })}
                      className={field}>
                      <option value="transfer">Transferencia</option>
                      <option value="cash">Efectivo</option>
                      <option value="mercadopago">Mercado Pago</option>
                      <option value="card">Tarjeta</option>
                    </select>
                  </div>
                </div>
                {form.delivery_type === 'delivery' && (
                  <div>
                    <label className="font-jakarta text-xs tracking-widest text-brand-muted uppercase">Direcci\u00f3n</label>
                    <input required value={form.delivery_address}
                      onChange={e => setForm({ ...form, delivery_address: e.target.value })}
                      className={field} placeholder="Calle, n\u00famero, barrio, ciudad" />
                  </div>
                )}
                <div>
                  <label className="font-jakarta text-xs tracking-widest text-brand-muted uppercase">Notas (opcional)</label>
                  <textarea value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    className={field} rows={2} />
                </div>
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="font-jakarta text-xs tracking-widest text-brand-muted uppercase">Total</span>
                  <span className="font-bebas text-3xl text-brand-charcoal">${Math.floor(total).toLocaleString()}</span>
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 disabled:opacity-60">
                  {submitting && <Loader2 className="animate-spin" size={18} />}
                  CONFIRMAR Y ENVIAR POR WHATSAPP
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CheckoutModal;
