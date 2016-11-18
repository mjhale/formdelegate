import React from 'react';

class ReceiveSuccessContainer extends React.Component {
  render() {
    return (
      <div className="receive-failure">
        <h1>We're Sorry!</h1>
        <p>
          We've received your message, but delivery to the recipient may take
          longer than usual. Our team has been notified of this incident.
        </p>
      </div>
    );
  }
}

export default ReceiveSuccessContainer;