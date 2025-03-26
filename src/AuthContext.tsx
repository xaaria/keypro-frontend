"use client";

import { createContext } from 'react';

// TODO: move types to another file?
type User = {
    id: number;
    token?: string;
}
  
export type AuthUser = User | undefined;
  
// Context of the Authenticated user. Undefined if not auth.
const AuthContext = createContext<AuthUser>(undefined);

export default AuthContext;