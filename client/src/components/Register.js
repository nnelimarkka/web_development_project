import React from 'react';
import {useState} from "react";
//import {Redirect} from "react-router-dom";
//apparently redirect is removed https://stackoverflow.com/questions/63690695/react-redirect-is-not-exported-from-react-router-dom
//and even more help... https://stackoverflow.com/questions/57778854/i-cannot-use-history-push-properly-with-reactjs
// ... and all the above sources were completely useless
// I finally decided to check the documentation for react-router... o_0
import {useNavigate} from "react-router-dom";

/*
    register page 
    help for redirecting in react: https://stackoverflow.com/questions/45089386/what-is-the-best-way-to-redirect-a-page-using-react-router
    redirecting to login page turned out to be pretty complicated (when following incorrect tips).
*/
const Register = () => {
    const [user, setUser] = useState({});
    const [errMsg, setErrMsg] = useState("");

    let navigate = useNavigate();
    const redirect = () => {
        navigate("/login", {replace: true});
    }

    const submit = (e) => {
        e.preventDefault()
    
        fetch("/users/register", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(user),
            mode: "cors"
        })
            .then(response => response.json())
            .then(data => {
                if(data.message === "ok") redirect();
                else if(data.message === "Password is not strong enough") {
                    setErrMsg("Password is not strong enough");
                } else {
                    setErrMsg("Username already in use");
                }
            }) 
}
    
    const handleChange = (e) => {
        setUser({...user, [e.target.name]: e.target.value});
    }

    return (
        <div>
            <h2>Register:</h2>
            <p className="error-container">{errMsg}</p>
            <form onSubmit={submit} onChange={handleChange}>

                <input type="text" name="username" id="username" placeholder="username" />
                <input type="password" id="password" name="password" placeholder="password" />
                <input className="btn" type="submit" id="submit" value="Register" />
            </form>
        </div>
    )
}

export default Register
