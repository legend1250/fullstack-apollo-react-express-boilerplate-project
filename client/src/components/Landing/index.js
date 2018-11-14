import React from 'react';
import withSession from '../Session/withSession';
import { EventCreate, Events } from '../Event';

const Landing = ({ session }) => (
  <div>
    <h2>Landing Page</h2>

    {session && session.me && <EventCreate />}
    <hr />
    <hr />
    <Events me={session.me} limit={2} />
  </div>
);

export default withSession(Landing)