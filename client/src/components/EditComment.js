import React from 'react';
import {useState, useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {Link} from "react-router-dom";

/*
    View to edit Comments. If users id does not match the author of the comment that is being edited,
    then user is redirected to /404 in order to prevent unauthorized editing.
*/

const EditComment = ({jwt, user}) => {

    const {title, id} = useParams();
    let navigate = useNavigate();
    const [commentText, setcommentText] = useState("");
    const [comment, setComment] = useState({});
    const [commentData, setCommentData] = useState({});

    const fetchData = () => {
        fetch(`/users/post/${title}`)
            .then(response => response.json())
            .then(json => {
                if (json.message) {
                    redirect404();
                } else {
                    
                    for (let i = 0; i < json.comments.length; i++) {
                        if(id === json.comments[i]._id) {
                            setcommentText(json.comments[i].body);
                            setComment({date: json.comments[i].date, author: json.comments[i].author, body: json.comments[i].body, username: json.comments[i].username});
                            if(!(user.username === "ADMIN") && !(user.id === json.comments[i].author)) {
                                redirect404();
                            }
                        }
                    }
                    
                }
            })
    }

    const redirect404 = () => {
        navigate("/404", {replace: true});
    }

    const submit = (e) => {
        e.preventDefault()

        fetch(`/users/update/comment/${title}/${id}`, {
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
                    fetchData();
                    return;
                }
            }) 
    }

    const handleChange = (e) => {
        setCommentData({...commentData, [e.target.name]: e.target.value});
    }

    useEffect(() => {
        fetchData();
    }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div>
            <div className='content-container col s12'>
            { comment?.date?.length > 0 &&
                <div className='comment-container'>
                    <div className='comment-header'>
                        {comment.date.split("T")[0]} {comment.date.split("T")[1].split(".")[0]} by <Link to={"/profile/"+comment.username}>{comment.username}</Link>:
                    </div>
                    {comment.body}
                </div>
            }
                <h4>Edit comment:</h4>
                <form onSubmit={submit} onChange={handleChange}>
                    <textarea name="body" placeholder="post body" onChange={(e) => setcommentText(e.target.value)} value={commentText} ></textarea>
                    <input className="btn container-button" type="submit" value="Edit"></input>
                </form>
            </div>
        </div>
    )
}

export default EditComment
