import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches uncaught render errors anywhere below it and shows an Onyx-themed
 * fallback instead of a blank white page. Critical for preview deploys where
 * a missing backend (e.g. Firestore without env vars) can throw async during
 * snapshot subscriptions.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          data-theme="stone"
          className="min-h-screen bg-[#E5E4E2] text-[#1B1B1B] flex items-center justify-center px-6"
        >
          <div className="max-w-md w-full stone-card p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-[8px] bg-[#B48E92]/20 text-[#4B5320] mb-5 rose-glow font-bold">
              !
            </div>
            <h1 className="font-display text-xl font-bold uppercase tracking-stone text-[#1B1B1B] mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-[#1B1B1B]/65 leading-relaxed mb-6">
              The page hit an unexpected error. Open the browser console for details.
            </p>
            <details className="text-start text-xs text-[#1B1B1B]/65 bg-[#EFEEEC] border border-[#1B1B1B]/10 rounded-[8px] p-3 mb-6">
              <summary className="cursor-pointer text-[#4B5320] uppercase tracking-chiseled font-bold">
                Error
              </summary>
              <pre className="mt-2 whitespace-pre-wrap break-words">{this.state.error.message}</pre>
            </details>
            <button
              type="button"
              onClick={() => location.reload()}
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#4B5320] text-[#F9F9F9] px-6 py-2.5 text-xs font-bold uppercase tracking-chiseled shadow-[6px_6px_14px_rgba(0,0,0,0.18)] hover:bg-[#3A4019] hover:shadow-[0_0_18px_rgba(180,142,146,0.55),6px_6px_14px_rgba(0,0,0,0.20)] transition-all duration-500 active:scale-95"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
