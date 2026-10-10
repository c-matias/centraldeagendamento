import { TERMS } from "../config/legal";
import LegalLayout from "./LegalLayout";

export default function TermsPage() {
  return <LegalLayout doc={TERMS} />;
}
