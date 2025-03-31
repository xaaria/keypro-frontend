import { createContext } from 'react';

export type AuthUser = {
    id: number | undefined;
    token: string | undefined;
}
  
  
// Context of the Authenticated user
// Fields will be undefinded if not authenticated
const AuthContext = createContext<AuthUser>({
    id: undefined, 
    token: undefined,
});

export default AuthContext;