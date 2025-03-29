import AuthContext from "@/AuthContext";
import Link from "next/link";
import { useContext } from "react";


export default function Nav() {

    const auth = useContext(AuthContext);

    return (
        <>
            <div style={{ padding: '1em 2em', 'display': 'flex', 'gap': '1em', }}>
                <div><Link href="/map">Map View</Link></div>
                {
                    auth.id === undefined && (<div><Link href="/login">Sign up or Login</Link></div>)
                }
                <div>User ID: {auth.id}</div>
            </div>
        </>
    )

}