import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] w-full h-full p-8 bg-[#121316] text-white border border-[#27282d] rounded">
          <div className="w-12 h-12 rounded-full bg-[#18191c] border border-[#27282d] flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-base font-semibold tracking-wide uppercase font-mono text-white mb-2">
            {this.props.fallbackTitle || 'Rendering Interrupted'}
          </h2>
          <p className="text-xs font-mono text-[#8e919a] max-w-md text-center mb-6">
            {this.state.error?.message || 'An unexpected error occurred while rendering the canvas.'}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded text-xs font-mono font-medium hover:bg-neutral-200 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload Workspace
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
