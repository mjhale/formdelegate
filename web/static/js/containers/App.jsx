import React, { PropTypes } from 'react';
import { Link } from 'react-router-dom';
import { Routes } from '../router';
import Nav from './Nav';

const App = () =>
  <div className="home">
    <nav className="navigation">
      <Link to="/" className="logo">
        form delegate
      </Link>
      <Nav />
    </nav>
    <div className="content-container">
      <div className="content">
        <Routes />
      </div>
    </div>
  </div>;

export default App;
