import React from 'react';

class ReceiveSuccessContainer extends React.Component {
  render() {
    return (
      <div className="receive-success">
        <h1>Thanks!</h1>
        <p>
          Your message has been sent. Please <a href="#">click here</a> to go
          back to the previous page.
        </p>
      </div>
    );
  }
}

export default ReceiveSuccessContainer;
