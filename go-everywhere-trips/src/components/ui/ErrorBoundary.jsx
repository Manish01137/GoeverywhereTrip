import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Uncaught UI error:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <div className="text-5xl mb-4" aria-hidden="true">🧭</div>
          <h1 className="text-2xl font-bold text-deep dark:text-white">Something went off-trail.</h1>
          <p className="mt-2 text-slate-500">Please refresh the page. If it keeps happening, message us on WhatsApp.</p>
          <button type="button" onClick={() => window.location.assign('/')} className="mt-6 bg-sky-brand text-white px-6 py-3 rounded-pill font-semibold hover:bg-sky-dark">
            Back to Home
          </button>
        </div>
      </div>
    )
  }
}
