import { useEffect, useState } from "react";
import { API_URL } from "../utils";
import  AuthContext, { AuthUser } from "./AuthContext";


export const AuthContextProvider = ({ children }: React.PropsWithChildren<{}>) => {


    const [data, setData] = useState<AuthUser>({
        id: undefined, 
        token: undefined,
    });
    
    useEffect(() => {

        console.info("Run Auth Ctx")

        async function fetchAPI() {

            const body = JSON.stringify({
                username: "root",
                password: "keypro",
            });

            const res = await fetch(`${API_URL}/api/token`, {
                method: 'POST',
                body,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            const auth = await res.json();
            console.info("!!",auth)
            setData(auth);
        }
        fetchAPI();
    }, []);

    return (<AuthContext.Provider value={data}>{children}</AuthContext.Provider>);

}