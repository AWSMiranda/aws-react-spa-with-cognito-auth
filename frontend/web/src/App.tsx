import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";

import Amplify from "aws-amplify";
import { AuthState, onAuthUIStateChange } from "@aws-amplify/ui-components";
import {
  Authenticator,
} from "@aws-amplify/ui-react";
import { getTime } from "./api";
process.env.AWS_REGION = 'us-west-2'
process.env.USER_POOL_ID = 'us-west-2_w7VLgrmlb'
process.env.USER_POOL_CLIENT_ID = '1e3poehrfq4mun8vgkdu85v1vk'
process.env.API_ENDPOINT = 'https://vb9lkptm4k.execute-api.us-west-2.amazonaws.com/api/'
Amplify.configure({
  Auth: {
    region: process.env.AWS_REGION,
    userPoolId: process.env.USER_POOL_ID, // Please change this value.
    userPoolWebClientId: process.env.USER_POOL_CLIENT_ID, // Please change this value.
  },
});

export const apiEndpoint = process.env.API_ENDPOINT; // Please change this value. (Don't include '/api')

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>();
  const [user, setUser] = useState<object | undefined>();
  const [time, setTime] = useState<string>();

  useEffect(() => {
    return onAuthUIStateChange((nextAuthState, authData) => {
      setAuthState(nextAuthState);
      setUser(authData);
    });
  }, []);

  useEffect(() => {
    const _getTime = async () => {
      const res = await getTime();
      setTime(res.cur_date);
    };

    _getTime();
  }, []);

  return authState === AuthState.SignedIn && user ? (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Update Time: {time}</p>
      </header>
    </div>
  ) : (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1>Hello {user?.username}</h1>
          <button onClick={signOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
  );
};

export default App;
