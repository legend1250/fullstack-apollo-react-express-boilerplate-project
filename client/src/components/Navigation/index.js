import React from 'react';
import { Link } from 'react-router-dom';

import * as routes from '../../constants/routes';
import SignOutButton from '../SignOut';
import Loading from '../Loading'

const Navigation = ({ session }) => (
  <div>
    {session && session.me ? (
      <NavigationAuth session={session} />
    ) : (
      <NavigationNonAuth />
    )}
    <APIStatus />
  </div>
);

const NavigationAuth = ({ session }) => (
  <ul>
    <li>
      <Link to={routes.LANDING}>Landing</Link>
    </li>
    <li>
      <Link to={routes.ACCOUNT}>Account ({session.me.username})</Link>
    </li>
    {session &&
      session.me &&
      session.me.role === 'ADMIN' && (
        <li>
          <Link to={routes.ADMIN}>Admin</Link>
        </li>
      )}
    <li>
      <SignOutButton />
    </li>
  </ul>
);

const NavigationNonAuth = () => (
  <ul>
    <li>
      <Link to={routes.SIGN_IN}>Sign In</Link>
    </li>
    <li>
      <Link to={routes.SIGN_UP}>Sign Up</Link>
    </li>
    <li>
      <Link to={routes.LANDING}>Landing</Link>
    </li>
  </ul>
);

class APIStatus extends React.Component{

  state = {
    loading: false,
    status: ''
  }

  componentDidMount = () => {
    // console.log('route: ' ,routes.API_STATUS)
    this.setState({ loading: true}, () => {
      fetch(routes.API_STATUS)
      .then( res => res.json())
      .then( data => {
        this.setState({
          loading: false,
          status: data.status
        })
      })
      .catch(err => console.log('err: ',err))
    })
  }

  render() {
    if(this.state.loading){
      return(<Loading />)
    }

    return (
      <div>
        API Status: {this.state.status}
      </div>
    )
  }
}

export default Navigation;
