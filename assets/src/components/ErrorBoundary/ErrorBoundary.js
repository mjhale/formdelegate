import React from 'react';

import Flash from 'components/Flash';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return <Flash type="error">Sorry, there was an unexpected error.</Flash>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
