import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import ModernButton from './ui/ModernButton';

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree and displays a fallback UI
 * 
 * Requirements: 19.5 - Error recovery and data integrity
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Log to error reporting service if available
    if (window.errorReporter) {
      window.errorReporter.logError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorCount } = this.state;
      const { fallback } = this.props;

      // If custom fallback provided, use it
      if (fallback) {
        return fallback({
          error,
          errorInfo,
          resetError: this.handleReset
        });
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
          <GlassCard className="max-w-2xl w-full p-8">
            <div className="text-center">
              {/* Error Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-6">
                <AlertTriangle size={40} className="text-red-400" />
              </div>

              {/* Error Title */}
              <h1 className="text-3xl font-black text-white mb-3">
                Oops! Something went wrong
              </h1>

              {/* Error Description */}
              <p className="text-white/60 mb-6">
                We encountered an unexpected error. Don't worry, your data is safe.
                {errorCount > 1 && (
                  <span className="block mt-2 text-amber-400">
                    This error has occurred {errorCount} times. Consider refreshing the page.
                  </span>
                )}
              </p>

              {/* Error Details (Development Only) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-left">
                  <p className="text-sm font-mono text-red-400 mb-2">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && this.state.errorInfo.componentStack && (
                    <details className="mt-2">
                      <summary className="text-xs text-white/50 cursor-pointer hover:text-white/70">
                        Component Stack
                      </summary>
                      <pre className="text-xs text-white/40 mt-2 overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <ModernButton
                  onClick={this.handleReset}
                  className="!bg-primary hover:!bg-primary-dark"
                >
                  <RefreshCw size={18} className="mr-2" />
                  Try Again
                </ModernButton>

                <ModernButton
                  onClick={this.handleGoHome}
                  variant="secondary"
                >
                  <Home size={18} className="mr-2" />
                  Go to Home
                </ModernButton>
              </div>

              {/* Help Text */}
              <p className="text-xs text-white/40 mt-6">
                If this problem persists, please contact support with the error details above.
              </p>
            </div>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
