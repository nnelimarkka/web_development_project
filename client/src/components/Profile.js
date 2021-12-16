import React from 'react';
import {useState, useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";

/*
    Profile page component bio editing input is only rendered if the visited user is same as logged in user.
*/

const Profile = ({jwt, loggedInUser}) => {

    const {user} = useParams();
    const [isLoggedInUser, setIsLoggedInUser] = useState(false);
    let navigate = useNavigate();
    const [data, setData] = useState({});
    const [bioData, setBio] = useState({});
    const [bioText, setBioText] = useState("");

    const fetchData = () => {
        fetch(`/users/user/${user}`)
            .then(response => response.json())
            .then(json => {
                if (json.message) {
                    redirect404();
                } else {
                    console.log(json);
                    setData(json);
                    setBioText(json.bio); //setting the bio inputs initial value to be post.bio found in db
                    console.log(json);
                }
            })
    }

    const redirect404 = () => {
        navigate("/404", {replace: true});
    }

    const submit = (e) => {
        e.preventDefault()
    
            fetch(`/users/update/${user}`, {
                method: "POST",
                headers: {
                    "authorization": "Bearer " + jwt,
                    "Content-type": "application/json"
                },
                body: JSON.stringify(bioData),
                mode: "cors"
            })
                .then(response => response.json())
                .then(data => {
                    if(data.message === 'ok') {
                        fetchData();
                        return;
                    } else {
                        return;
                    }
                }) 
    }
    
    
    const handleChange = (e) => {
        setBio({...bioData, [e.target.name]: e.target.value});
    }

    useEffect(() => {
        fetchData();
        if(user === loggedInUser.username) {
            setIsLoggedInUser(true);
        } else {
            setIsLoggedInUser(false);
        }
    }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className='content-container'>
            <h2>Profile of {user}</h2>
            {data?.bio?.length > 0 &&
                <div>
                    <p>Posting since: {data.registerDate.split("T")[0]} {data.registerDate.split("T")[1].split(".")[0]}</p>
                    <h4>Bio:</h4>
                    <p>{data.bio}</p>
                </div>
            }
            {isLoggedInUser === true &&
                <div>
                    <form onSubmit={submit} onChange={handleChange}>
                    <label for="bio">Input new bio:</label>
                    <textarea name="bio" placeholder="Lorem ipsum..." onChange={(e) => setBioText(e.target.value)} value={bioText} ></textarea>
                    <input className="btn container-button" type="submit" value="Update bio"></input>
                    </form>
                </div>
            }
        </div>
    )
}

export default Profile
