import React from 'react'
import { AlertTriangle, RefreshCw, Mail } from 'lucide-react'

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 *
 * Note: Error boundaries must be class components per React docs.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error)
    console.error('Component stack:', errorInfo.componentStack)

    // Store error info for display
    this.setState({ errorInfo })

    // TODO: Could send to an error tracking service here
    // e.g., Sentry, LogRocket, or Firebase Crashlytics
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-4">
          <div className="card-sketch max-w-lg w-full p-8 text-center">
            {/* Error Icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-brand-cardinal/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-brand-cardinal" />
            </div>

            {/* Heading */}
            <h1 className="font-heading text-2xl font-bold text-brand-ink mb-3">
              Something went wrong
            </h1>

            {/* Description */}
            <p className="font-body text-brand-ink-muted mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
              If the problem persists, contact our support team.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="btn-primary inline-flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try again
              </button>

              <a
                href="mailto:jamditis@gmail.com?subject=CJS2026%20Website%20Error"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 font-body font-medium text-brand-teal hover:text-brand-teal/80 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Contact support
              </a>
            </div>

            {/* Error Details (collapsible, for debugging) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm text-brand-ink/50 hover:text-brand-ink-muted">
                  Technical details (dev only)
                </summary>
                <div className="mt-3 p-4 bg-brand-ink/5 rounded-lg overflow-auto">
                  <p className="text-sm font-mono text-brand-cardinal mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-xs font-mono text-brand-ink-muted whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
