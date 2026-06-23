import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.state.errorMessage.toLowerCase().includes('metamask')) {
        return (
          <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-8 font-sans">
             <div className="border border-red-500/50 bg-red-500/10 p-6 max-w-lg text-center">
                 <h2 className="text-xl font-bold mb-4 font-orbitron text-red-400">Browser Extension Error Detected</h2>
                 <p className="text-gray-300 mb-4 whitespace-pre-wrap">
                    Your MetaMask browser extension threw an error while trying to inject into this secure preview environment.
                 </p>
                 <button onClick={() => this.setState({ hasError: false })} className="px-6 py-2 border border-white/20 hover:bg-white/10 transition-colors">
                     Dismiss & Continue
                 </button>
             </div>
          </div>
        );
      }
      
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-8 font-sans">
            <div className="border border-red-500/50 bg-red-500/10 p-6 max-w-lg text-center">
                <h2 className="text-xl font-bold mb-4 font-orbitron text-red-400">Application Error</h2>
                <p className="text-gray-300 mb-4 whitespace-pre-wrap">
                   {this.state.errorMessage}
                </p>
                <button onClick={() => this.setState({ hasError: false })} className="px-6 py-2 border border-white/20 hover:bg-white/10 transition-colors">
                    Try Again
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}
