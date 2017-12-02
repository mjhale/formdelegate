import React from 'react';
import FluidContainer from 'components/FluidContainer';

const CodeExample = () => (
  <div className="example">
    <FluidContainer>
      <h2>Take the plunge</h2>
      <h3 className="step-one">
        Step 1: Replace your form's action attribute.
      </h3>
      <code>
        {`<form `}
        <span className="highlight">{`action="https://www.formdelegate.com/f/########"`}</span>
        {` method="POST">`}
        <div className="tab">{`<input type="text" placeholder="Message">`}</div>
        <div className="tab">{`<button type="Submit">Send</button>`}</div>
        {`</form>`}
      </code>
      <h3 className="step-two">Step 2: Relax.</h3>
    </FluidContainer>
  </div>
);

const Welcome = () => (
  <div className="welcome">
    <div className="hero">
      <FluidContainer>
        <h1 className="hero-title">Simple Form Processing</h1>
        <div className="hero-message">
          Send your forms to us. We'll handle the rest.
        </div>
        <div className="hero-action">
          <button className="btn signup">Try It For Free</button>
        </div>
      </FluidContainer>
    </div>
    <div className="action-bar">
      Want to see it in action? <a href="#">Watch our demo.</a>
    </div>
    <div className="features">
      <FluidContainer>
        <h2>Give your forms flexibility</h2>
        <h3>Add powerful features to your forms. No coding required.</h3>
        <ul className="feature-list">
          <li>Send form submissions to multiple e-mail users.</li>
          <li>View and manage every submission with our ad-free interface.</li>
          <li>Create endless integrations with Zappier.</li>
          <li>Keep spam out of your life with our automatic filtering.</li>
        </ul>
      </FluidContainer>
    </div>
    <CodeExample />
    <div className="cards">
      <FluidContainer>
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
      </FluidContainer>
    </div>
  </div>
);

export default Welcome;
