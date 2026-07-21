import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
        }}>
          <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>⚠️ Something went wrong</h1>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
            We encountered an unexpected error. Please try again.
          </p>
          <details style={{ marginBottom: '30px', textAlign: 'left', maxWidth: '500px' }}>
            <summary style={{ cursor: 'pointer', color: '#0066cc', marginBottom: '10px' }}>
              Error details
            </summary>
            <pre style={{
              backgroundColor: '#f0f0f0',
              padding: '15px',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px',
              color: '#333',
            }}>
              {this.state.error?.toString()}
            </pre>
          </details>
          <button
            onClick={this.handleReset}
            style={{
              padding: '10px 20px',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
