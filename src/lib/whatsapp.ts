import { SITE } from "../config/site";
export const waLink = (text: string = SITE.whatsappMessage) =>
  `https://wa.me/${SITE.phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
