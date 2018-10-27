import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
class Footer extends Component {
  render() {
    const { isAuthenticated, user } = this.props.auth;
    console.log(this.props.auth);
    const authFooter = (
      <footer className="footer mt-5 bg-dark text-white p-4 text-center">
        Copyright &copy; {new Date().getFullYear()} | Dillan Teagle
      </footer>
    );
    const guestFooter = (
      <footer className="footer bg-dark text-white mt-5 p-4 text-center">
        Copyright &copy; {new Date().getFullYear()} | Dillan Teagle
      </footer>
    );

    return (
      <div>
        <div>
          {/* <footer className="footer mt-5 p-4 text-center">
            Copyright &copy; {new Date().getFullYear()} | Dillan Teagle
          </footer> */}
          {isAuthenticated ? authFooter : guestFooter}
        </div>
      </div>
    );
  }
}

Footer.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(
  mapStateToProps,
  null
)(Footer);
