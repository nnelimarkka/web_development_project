import React from 'react'
import {useState} from "react";
import {useNavigate} from "react-router-dom";

//login page help from week 11 source codes
const Login = ({setJwt, jwt, setUser}) => {
    const [userData, setUserData] = useState({});
    const [errMsg, setErrMsg] = useState("");

    let navigate = useNavigate();
    const redirect = () => {
        navigate("/", {replace: true});
    }

    const submit = (e) => {
        e.preventDefault()
    
            fetch("/users/login", {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(userData),
                mode: "cors"
            })
                .then(response => response.json())
                .then(data => {
                    if(data.token) {
                        setJwt(data.token);
                        setUser(JSON.parse(Buffer.from(data.token.split(".")[1], "base64").toString()));
                        redirect();
                    } else {
                        setErrMsg("Invalid credentials");
                    }
                }) 
    }
    
    const handleChange = (e) => {
        setUserData({...userData, [e.target.name]: e.target.value});
    }

    return (
        <div>
            <h2>Login:</h2>
            <p className="error-container">{errMsg}</p>
            <form onSubmit={submit} onChange={handleChange}>

                <input type="text" name="username" id="username" placeholder="username" />
                <input type="password" id="password" name="password" placeholder="password" />
                <input className="btn" type="submit" id="submit" value="Login" />
            </form>
        </div>
    )
}

export default Login
