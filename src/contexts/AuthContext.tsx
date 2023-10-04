import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

import { Avatar } from 'types/UserConfig';
import { ID_ANON_SLOT, generateIdentity, getId, saveId } from 'utils/zkpid';
import { Identity } from "@semaphore-protocol/identity"

type LoginDetails = {
  username: string;
  email: string;
  password: string; // unhashed, direct user input
  // add other user properties here
};

interface AuthConsumables {
  loginData: LoginDetails | null;
  user: Avatar | null;
  anonId: Identity | null;
  login: (data: LoginDetails) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthConsumables>({
  user: null,
  anonId: null,
  login: () => {},
  logout: () => {},
  loginData: null
});

export const useAuth = (): AuthConsumables => {
    return React.useContext(AuthContext);
}

export const AuthProvider: React.FC = ({ children }: any) => {
  const [loginData, setLoginDetails] = useState<LoginDetails | null>(null);
  const [user, setUser] = useState<Avatar | null>(null);
  const [anonId, setAnonId] = useState<Identity | null>(null);

  useEffect(() => {
      if(!user) {
          // do thing to login
      }
  }, [user]);

  /**
   * @desc Generate an anonymous Semaphore identity for the user if they dont already have one
   *        Save to local storage on the phone for later use and for authentication
   */
  useEffect(() => {
    // console.log("anon id generation", anonId);
    if(!anonId) {
      getId(ID_ANON_SLOT).then((id) => {
        // console.log("anon id lookup", id);
        if(!id) {
          const _anon_ = generateIdentity();
          // console.log("anon id save", _anon_);
          setAnonId(_anon_);
          saveId(ID_ANON_SLOT, _anon_);
        } else {
          setAnonId(id as Identity);
        }
      }) 
    }
  }, [anonId]);

  const login = (data: LoginDetails) => {
    axios.post(`${process.env.API_URL}/login`, data)
      .then((response) => {
          setUser(response.data);
          setLoginDetails(null);
          // setup session stuff here
      })
      .catch((error) => {
          console.error(error);
      });
  };

  const logout = () => {
    setUser(null);
    setLoginDetails(null);
    // remove session stuff here
  };

  return (
    <AuthContext.Provider value={{ user, anonId, login, logout, loginData }}>
      {children}
    </AuthContext.Provider>
  );
};

