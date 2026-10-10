import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { SPRING } from "../lib/motion";
import { waLink } from "../lib/whatsapp";

export default function WhatsAppFab() {
  return (
    <motion.a
      href={waLink()}
      target="_blank"
      rel="noopener"
      aria-label="Falar no WhatsApp"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SPRING, delay: 1.2 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-[max(1.125rem,env(safe-area-inset-bottom))] right-[1.125rem] z-[60] grid h-14 w-14 place-items-center rounded-full bg-brand text-white shadow-xl transition-colors duration-150 hover:bg-brand-royal"
    >
      <MessageCircle size={28} />
    </motion.a>
  );
}
