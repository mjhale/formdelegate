import React from 'react';

const Welcome = () => {
  return (
    <div className="welcome">
      <div className="hero">
        <div className="content">
          <h1 className="hero-title">Simple Form Processing</h1>
          <div className="hero-message">
            Send your forms to us. We'll handle the rest.
          </div>
          <div className="hero-action">
            <button className="btn signup">Try It For Free</button>
          </div>
        </div>
      </div>
      <div className="action-bar">
        Want to see it in action? <a href="#">Watch our demo.</a>
      </div>
      <div className="features">
        <div className="content">
          <h2>Give your forms flexibility</h2>
          <h3>Add powerful features to your forms. No coding required.</h3>
          <ul className="feature-list">
            <li>Send form submissions to multiple e-mail accounts.</li>
            <li>
              View and manage every submission with our ad-free interface.
            </li>
            <li>Create endless integrations with Zappier.</li>
            <li>Keep spam out of your life with our automatic filtering.</li>
          </ul>
        </div>
      </div>
      <div className="cards">
        <div className="content">
          <div className="item">
            <h2>You own your data.</h2>
            <p>Export or permanently delete your data at any time.</p>
          </div>
          <div className="item">
            <h2>No ads.</h2>
            <p>
              Your data isn't used for our monetization. We'll never sell your
              information.
            </p>
          </div>
          <div className="item">
            <h2>Strong privacy.</h2>
            <p>
              Our guides help you ensure that your data is safe during transit.
            </p>
          </div>
          <div className="item">
            <h2>Encryption.</h2>
            <p>
              Enroll in our client-side PGP beta and encrypt your form
              submissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
