"use client";
import { useState } from "react";
import { API_URL, setAuthToLocalStorage } from "../../../utils";

export default function LoginForm() {
    
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const [errMsg, setErrMsg] = useState<string>("");

  
    return (
      <>
        <h1>Sign Up or Login</h1>

        <div style={{display: 'flex', flexDirection: 'column', gap: '1em', }}>
            <div>
                { errMsg?.length ? <div id="error" onClick={() => setErrMsg("")}>{errMsg}</div> : <></> }
            </div>

            <div>
                <label htmlFor="username">Username</label>
                <input name="username" minLength={1} type="text" autoComplete="off" value={username}
                    onChange={(e) => setUsername(e.target.value)} required />
            </div>

            <div>
                <label htmlFor="password">Password</label>
                <input name="password" minLength={4} type="password" autoComplete="off" value={password}
                onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div style={{display: 'flex', gap: '1em', }}>
                <button onClick={(e: any) => handleSignUp(e)}>Register</button>
                <button onClick={(e: any)=> handleLogin(e)}>Login</button>
            </div>
          </div>
      </>
    );

    async function handleSignUp(e: Event): Promise<void> {
        e.preventDefault();
    
        try {
        
          const response = await fetch(`${API_URL}/api/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({ username, password }),
          });
    
          if (!response.ok) {
            setErrMsg("Something went wrong!")
          }
    
          const data = await response.json();
          alert(`Signup successful! Username ${data.username}`); // Replace with navigation or state update
        } catch (err: any) {
            setErrMsg(err?.message);
        }
    }


    async function handleLogin(e: Event): Promise<void> {
        e.preventDefault();
    
        try {
        
          const response = await fetch(`${API_URL}/api/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });
    
          if (!response.ok) {
            setErrMsg("Something went wrong!")
            return;
          }
    
          const data = await response.json();
          const id = data.id;
          const token = data.token;
          console.info(id, token);
          setAuthToLocalStorage(id, token);
          alert("Logged in! Welcome user ID " + id)
    
        } catch (err: any) {
            setErrMsg(err?.message);
        }
    }

}