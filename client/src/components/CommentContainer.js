import React from 'react'
import {useState, useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import { Link } from 'react-router-dom';

/*
    Comments in this component.

    Comment posting is limited to authenticated users with conditional rendering.

    Codesnippets are highlighted on server-side before saving into database so Post.formattedBody contains html code,
    which is why I use dangerouslySetInnerHtml to render the body as html

    edit button is only rendered in comments where the comment author is equal to the logged in user
*/

const CommentContainer = ({jwt, user}) => {
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
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    //redirecting to /404 which doesn't exist so my404 is rendered
    const redirect404 = () => {
        navigate("/404", {replace: true});
    }

    const submit = (e) => {
        e.preventDefault()

        fetch(`/users/posts/comment/${title}`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + jwt,
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

    const deleteComment = (title, id) => {
        fetch(`/users/delete/comment/${title}/${id}`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + jwt,
                "Content-type": "application/json"
            },
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
                        Posted: {data.date.split("T")[0]} {data.date.split("T")[1].split(".")[0]} by <Link to={"/profile/"+data.username}>{data.username}</Link>
                    </p>
                    { !(data?.lastEdited === data?.date) &&
                        <p className='edit-time'>(Edited: {data.lastEdited.split("T")[0]} {data.lastEdited.split("T")[1].split(".")[0]})</p>
                    }
                    <p className="post-header">{data.title}</p>
                    <div className='code-container'>
                        <pre><code dangerouslySetInnerHTML={{__html: data.formattedBody}}></code></pre>
                    </div>
                    <hr />
                    <p className="post-header">Comments:</p>
                    <ul className='comment-container'>
                        {data?.comments?.length > 0 &&
                            data.comments.map((comment, i) => {
                                return(
                                <li key={comment.author}>
                                    <div className='comment-header'>
                                        {comment.date.split("T")[0]} {comment.date.split("T")[1].split(".")[0]} by <Link to={"/profile/"+comment.username}>{comment.username}</Link> { !(comment?.lastEdited === comment?.date) && <span className="edit-time">(Edited: {comment.lastEdited.split("T")[0]} {comment.lastEdited.split("T")[1].split(".")[0]})</span>}:
                                        { (comment?.username === user?.username || user?.username === "ADMIN") &&
                                            <span className='edit-link-container'><Link className='edit-link' to={"/edit/comment/"+data.title+"/"+comment._id}>Edit</Link></span>
                                        }
                                        { user?.username === "ADMIN" &&
                                            <span className='delete-link-container'><span className='edit-link' onClick={() => deleteComment(data.title, comment._id)}>DELETE</span></span>
                                        }
                                    </div>
                                    {comment.body}
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
