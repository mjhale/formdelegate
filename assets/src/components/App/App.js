import PropTypes from 'prop-types';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import { addNotification, hideNotification } from 'actions/notifications';
import { fetchUser } from 'actions/users';
import { resendUserConfirmation } from 'actions/userConfirmation';
import { getCurrentUser } from 'selectors';
import { getCurrentUserId, isTokenCurrent } from 'utils';

import Link from 'components/Link';
import Routes from 'components/Routes';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.handleResendUserConfirmation = this.handleResendUserConfirmation.bind(
      this
    );
  }

  componentDidMount() {
    const currentUserId = getCurrentUserId();

    if (currentUserId && isTokenCurrent()) {
      this.props.fetchUser(currentUserId);
    }

    // Show alpha notice
    this.props.addNotification({
      dismissable: false,
      level: 'notice',
      message:
        'Form Delegate is currently in alpha and should be considered unstable.',
    });

    if (this.props.currentUser?.confirmed_at === null) {
      this.showUserUnconfirmedNotification();
    }
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.currentUser?.confirmed_at !==
      this.props.currentUser?.confirmed_at
    ) {
      if (this.props.currentUser?.confirmed_at === null) {
        this.showUserUnconfirmedNotification();
      }
    }
  }

  showUserUnconfirmedNotification() {
    this.props.addNotification({
      dismissable: false,
      key: 'UNCONFIRMED_USER',
      level: 'notice',
      message: (
        <>
          Please verify your e-mail address.{' '}
          <Link
            href="/user-confirmation"
            onPress={this.handleResendUserConfirmation}
          >
            Resend email
          </Link>
        </>
      ),
    });
  }

  handleResendUserConfirmation(evt) {
    evt.preventDefault();
    this.props.hideNotification({
      key: 'UNCONFIRMED_USER',
    });

    this.props.addNotification({
      dismissable: true,
      level: 'success',
      message: 'The confirmation email should appear in your inbox shortly.',
    });

    this.props.resendUserConfirmation(this.props.currentUser);
  }

  render() {
    return (
      <BrowserRouter>
        <Routes />;
      </BrowserRouter>
    );
  }
}

App.propTypes = {
  addNotification: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
};

const mapStateToProps = state => ({
  currentUser: getCurrentUser(state),
});

const mapDispatchToProps = {
  addNotification,
  hideNotification,
  fetchUser,
  resendUserConfirmation,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
