import React from 'react'
import {useState, useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";

const CommentContainer = ({jwt}) => {
    const {title} = useParams()
    const [data, setData] = useState({});
    const [commentData, setcommentData] = useState({});
    const [errMsg, setErrMsg] = useState("");
    let navigate = useNavigate();
    console.log(title);
    
    const fetchData = () => {
        fetch(`/users/post/${title}`)
            .then(response => response.json())
            .then(json => {
                if (json.message) {
                    redirect404();
                } else {
                    setData(json);
                    console.log(json);
                }
            })
    }

    useEffect(() => {
        fetchData();
    }, [])

    //redirecting to /404 which doesn't exist so my404 is rendered
    const redirect404 = () => {
        navigate("/404", {replace: false});
    }

    const submit = (e) => {
        e.preventDefault()

        fetch(`/users/posts/update/${title}`, {
            method: "POST",
            headers: {
                "authorization": "Bearer " + jwt,
                "Content-type": "application/json"
            },
            body: JSON.stringify(commentData),
            mode: "cors"
        
        })
            .then(response => response.json())
            .then(data => {
                if(data.message === 'ok') {
                    setErrMsg("");
                    fetchData();
                    return;
                } else {
                    setErrMsg("Error in posting comment.");
                }
            })
    }

    const handleChange = (e) => {
        setcommentData({...commentData, [e.target.name]: e.target.value});
    }

    return (
        <div className="row">
            <div>
                <h4 className="posts-header">Comment section</h4>
            </div>
            <p>{data.author ? "" : "Post not found :("}</p>
            {data?.author && 
                
                <div className="content-container col s12">
                    <p className="post-time">
                        Posted: {data.date.split("T")[0]} {data.date.split("T")[1].split(".")[0]} by {data.username}
                    </p>
                    <p className="post-header">{data.title}</p>
                    <pre><code>{data.body}</code></pre>
                    <hr />
                    <p className="post-header">Comments:</p>
                    <ul>
                        {data?.comments?.length > 0 &&
                            data.comments.map((comment, i) => {
                                return(
                                <li key={comment.author}>
                                    {data.date.split("T")[0]} {comment.date.split("T")[1].split(".")[0]} by {comment.username}: {comment.body}
                                </li>
                                )
                            })
                        }
                        {data?.comments?.length === 0 && <li>No comments yet...</li>}
                    </ul>
                    </div>
            }
            {jwt?.length > 0 &&
            <div className="content-container col s12">
            <p className="error-container" >{errMsg}</p>
            <p>Comment input:</p>
            <form onSubmit={submit} onChange={handleChange}>
                <input type="text" name="body" placeholder="comment text" ></input>
                <input className="btn container-button" type="submit" value="Comment"></input>
            </form>
            </div>
            }

        </div>
    )
}

export default CommentContainer
