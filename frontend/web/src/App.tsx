import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import '@aws-amplify/ui-react/styles.css';

import Amplify from "aws-amplify";
import { AuthState, onAuthUIStateChange } from "@aws-amplify/ui-components";
import {
  Authenticator,
} from "@aws-amplify/ui-react";
import { getTime } from "./api";
const AWS_REGION = 'us-west-2'
const USER_POOL_ID = 'us-west-2_w7VLgrmlb'
const USER_POOL_CLIENT_ID = '1e3poehrfq4mun8vgkdu85v1vk'
const API_ENDPOINT = 'https://vb9lkptm4k.execute-api.us-west-2.amazonaws.com/api/'
Amplify.configure({
  aws_cognito_region: AWS_REGION,
  Auth: {
    region: AWS_REGION,
    userPoolId: USER_POOL_ID, // Please change this value.
    userPoolWebClientId: USER_POOL_CLIENT_ID, // Please change this value.
  },
});

export const apiEndpoint = API_ENDPOINT; // Please change this value. (Don't include '/api')

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
