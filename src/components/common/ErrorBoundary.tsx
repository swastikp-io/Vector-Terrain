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
        <div className="flex flex-col items-center justify-center min-h-[300px] w-full h-full p-8 bg-neutral-50 text-neutral-900 border border-neutral-300 rounded">
          <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-neutral-800" />
          </div>
          <h2 className="text-base font-semibold tracking-wide uppercase font-mono text-neutral-900 mb-2">
            {this.props.fallbackTitle || 'Rendering Interrupted'}
          </h2>
          <p className="text-xs font-mono text-neutral-600 max-w-md text-center mb-6">
            {this.state.error?.message || 'An unexpected error occurred while rendering the canvas.'}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded text-xs font-mono font-medium hover:bg-neutral-800 transition"
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
