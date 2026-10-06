import React from 'react';

export default class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('UI crash:', error, info); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
        <h1>Something went wrong</h1>
        <pre style={{ whiteSpace: 'pre-wrap', color: '#c0453a' }}>{String(this.state.error?.message || this.state.error)}</pre>
        <button onClick={() => window.location.assign('/')}>Back to home</button>
      </div>
    );
  }
}
