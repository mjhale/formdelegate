import React from 'react';

import Error from 'components/Error';

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
      return (
        <Error message="Sorry, there was an unexpected error. Our team has been notified." />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
