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
          data-theme="onyx"
          className="min-h-screen bg-[#121212] text-[#A0A0A0] flex items-center justify-center px-6"
        >
          <div className="max-w-md w-full glass-card p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FFBF00]/15 text-[#FFBF00] mb-5 amber-glow">
              !
            </div>
            <h1 className="font-display text-xl font-extrabold uppercase tracking-architectural text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-[#A0A0A0] leading-relaxed mb-6">
              The page hit an unexpected error. Open the browser console for details.
            </p>
            <details className="text-start text-xs text-[#6B6B6B] bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 mb-6">
              <summary className="cursor-pointer text-[#A0A0A0] uppercase tracking-architectural">
                Error
              </summary>
              <pre className="mt-2 whitespace-pre-wrap break-words">{this.state.error.message}</pre>
            </details>
            <button
              type="button"
              onClick={() => location.reload()}
              className="inline-flex items-center gap-2 rounded-full bg-[#FFBF00] text-black px-6 py-2.5 text-xs font-extrabold uppercase tracking-architectural amber-glow hover:bg-[#FFD15C] transition-all duration-500 active:scale-[0.97]"
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
