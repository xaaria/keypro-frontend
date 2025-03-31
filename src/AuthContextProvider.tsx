import { useEffect, useState } from "react";
import { getAuthFromLocalStorage } from "../utils";
import  AuthContext, { AuthUser } from "./AuthContext";

export default function AuthContextProvider({ children }: React.PropsWithChildren<{}>) {

    const [data, setData] = useState<AuthUser>({
        id: undefined, 
        token: undefined,
    });

    
    useEffect(() => {
        const auth = getAuthFromLocalStorage();
        console.info("From storage", auth);
        setData(auth);
    }, []);


    return (<AuthContext.Provider value={data}>
        {children}
    </AuthContext.Provider>);

}