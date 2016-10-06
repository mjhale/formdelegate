import React, { Component } from 'react';

const InvalidRoute = () => {
  return (
    <div className="invalid-route">
      <h1>Oops!</h1>
      <h2>We can't seem to find the page you're looking for.</h2>
      <p><strong>Error code: 404</strong></p>
      <p>Here are some helpful links instead:</p>
      <ul>
        <li>Home</li>
        <li>About</li>
        <li>Sitemap</li>
      </ul>
    </div>
  );
};

export default InvalidRoute;
