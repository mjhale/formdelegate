import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Routes } from '../router';
import Nav from './Nav';
import Notifications from './Notifications';

const App = () => (
  <div className="home">
    <nav className="navigation">
      <Link to="/" className="logo">
        form delegate
      </Link>
      <Nav />
    </nav>
    <div className="content-container">
      <Notifications />
      <Routes />
    </div>
  </div>
);

export default App;
