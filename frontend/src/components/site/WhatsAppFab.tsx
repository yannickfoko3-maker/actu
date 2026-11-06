import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Phone, X } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';

/** Bouton flottant de contact rapide (WhatsApp + appel direct). */
export function WhatsAppFab() {
  const { whatsapp, call, phone } = useSite();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-[80] flex flex-col items-end gap-3 sm:bottom-7 sm:right-7">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.22 }}
            className="w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card"
          >
            <div className="bg-navy-gradient px-4 py-3 text-white">
              <p className="text-[11px] uppercase tracking-[0.16em] text-aces-gold">Contact rapide</p>
              <p className="mt-1 text-[13.5px] font-semibold">Une question ? Écrivez-nous.</p>
            </div>
            <div className="space-y-2 p-3">
              <a
                href={whatsapp()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl bg-[#25D366]/10 px-3 py-2.5 text-[13px] font-medium text-[#128C7E] transition-colors hover:bg-[#25D366]/20"
              >
                <MessageCircle size={16} />
                Discuter sur WhatsApp
              </a>
              <a
                href={call()}
                className="flex items-center gap-3 rounded-xl bg-aces-blue/10 px-3 py-2.5 text-[13px] font-medium text-aces-blue transition-colors hover:bg-aces-blue/15"
              >
                <Phone size={16} />
                Appeler {phone}
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? 'Fermer les options de contact' : 'Ouvrir les options de contact'}
        className="group relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_14px_40px_-12px_rgba(37,211,102,0.8)] transition-transform hover:scale-105"
      >
        {!open ? <span className="absolute inset-0 rounded-full animate-pulse-ring" aria-hidden="true" /> : null}
        {open ? <X size={22} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}
