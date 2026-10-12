import { Component, type ErrorInfo, type ReactNode } from "react";
import { captureError } from "../observability";

type State = { failed: boolean };

/** Apanha erros de renderização, regista-os na observabilidade e mostra uma alternativa útil (WhatsApp). */
export default class ErrorBoundary extends Component<{ children: ReactNode; label?: string }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureError(error, { componentStack: info.componentStack, boundary: this.props.label ?? "app" });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="mx-auto max-w-xl px-5 py-16 text-center">
        <h2 className="font-serif text-2xl text-brand">Ocorreu um problema ao mostrar esta página</h2>
        <p className="mt-3 text-brand-muted">Pode recarregar a página ou falar connosco directamente pelo WhatsApp.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-royal"
        >
          Recarregar
        </button>
      </div>
    );
  }
}
