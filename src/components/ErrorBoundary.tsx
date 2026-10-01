import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
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
    // Log error in console for debugging without exposing secrets
    console.error('ErrorBoundary caught an unhandled rendering error:', error.message, errorInfo.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] text-[#2C241E] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-[#E8DFD3] rounded-2xl p-6 sm:p-8 shadow-lg text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#FCE8E6] text-[#C5221F] flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#1E392A] mb-2">
              Something went wrong
            </h1>

            <p className="text-sm text-[#665A4F] mb-6">
              An unexpected display issue occurred while loading this page. You can try recovering or reloading.
            </p>

            {this.state.error?.message && (
              <div className="mb-6 p-3 bg-[#FAF7F2] border border-[#E0D0BE] rounded-lg text-left text-xs text-[#554A40] font-mono break-all max-h-24 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E392A] hover:bg-[#15281D] text-white font-medium text-sm transition-colors shadow-sm cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F3ECE0] border border-[#D5C5B2] text-[#2C241E] font-medium text-sm transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
