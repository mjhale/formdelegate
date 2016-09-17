import React from 'react';
import { Link } from 'react-router';

class HomeContainer extends React.Component {
	render() {
    return (
      <div className="welcome">
        <div className="logo">Form Delegate</div>
        <ul className="nav" role="nav">
					<li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/accounts">Accounts</Link></li>
        </ul>
				<div className="content">
					{this.props.children}
				</div>
      </div>
    );
  }
}

export default HomeContainer;
