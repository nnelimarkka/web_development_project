import React from 'react';
import {useState, useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";

/*
    View to edit posts. If users id does not match the author of the post that is being edited,
    then user is redirected to /404 in order to prevent unauthorized editing.
*/

const EditPost = ({jwt, user}) => {

    const {title} = useParams();
    let navigate = useNavigate();
    const [postText, setPostText] = useState("");
    const [post, setPost] = useState({});
    const [postData, setPostData] = useState({});

    const fetchData = () => {
        fetch(`/users/post/${title}`)
            .then(response => response.json())
            .then(json => {
                if (json.message) {
                    redirect404();
                } else {
                    setPostText(json.body);
                    setPost(json);
                    if(!(user.username === "ADMIN") && !(user.id === json.author)) {
                        redirect404();
                    }
                    console.log(json);
                }
            })
    }

    const redirect404 = () => {
        navigate("/404", {replace: true});
    }

    const submit = (e) => {
        e.preventDefault()

        fetch(`/users/update/post/${title}`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + jwt,
                "Content-type": "application/json"
            },
            body: JSON.stringify(postData),
            mode: "cors"
        })
            .then(response => response.json())
            .then(data => {
                if(data.message === 'ok') {
                    fetchData();
                    return;
                }
            }) 
    }

    const handleChange = (e) => {
        setPostData({...postData, [e.target.name]: e.target.value});
    }

    useEffect(() => {
        fetchData();
    }, [title]) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div>
            <div className="content-container col s12">
                <p className="post-header">{post.title}</p>
                <div className='code-container'>
                    <pre><code dangerouslySetInnerHTML={{__html: post.formattedBody}}></code></pre>
                </div>
            </div>
            <div className='content-container col s12'>
                <h4>Edit post:</h4>
                <form onSubmit={submit} onChange={handleChange}>
                    <textarea name="body" placeholder="post body" onChange={(e) => setPostText(e.target.value)} value={postText} ></textarea>
                    <input className="btn container-button" type="submit" value="Edit"></input>
                </form>
            </div>
        </div>
    )
}

export default EditPost
