import React from 'react'
import {useState, useEffect} from "react";
import {Link} from "react-router-dom";


/*
    main content of the page is rendered in this component ie. all of the code snippets found in database.

    Content posting is limited to authenticated users with conditional rendering.

    Codesnippets are highlighted on server-side before saving into database so Post.formattedBody contains html code,
    which is why I use dangerouslySetInnerHtml to render the body as html

    edit button is only rendered in posts where the posts author is equal to the logged in user
*/

const SnippetContainer = ({jwt, snippets, setSnippets, user}) => {
    
    const [postData, setData] = useState({});
    const [errMsg, setErrMsg] = useState("");
    const [searchExpression, setSearchExpression] = useState("");

    const fetchSnippets = () => {
        fetch("/users/posts", {
          method: "GET"
        })
          .then(response => response.json())
          .then(data => {
            if (data.message) {
              setSnippets([]);
            } else {
              setSnippets(data); 
            }
          })
      }
    
    useEffect(() => {
        fetchSnippets();
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
    

    const submit = (e) => {
        e.preventDefault()
    
            fetch("/users/posts/post", {
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
                        setErrMsg("");
                        fetchSnippets();
                        return;
                    } else {
                        setErrMsg("Dublicate post.");
                    }
                }) 
    }

    const deletePost = (title) => {
            fetch(`/users/delete/post/${title}`, {
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
                        setErrMsg("");
                        fetchSnippets();
                        return;
                    } else {
                        setErrMsg("Nice");
                    }
                })
    }

    const filterSnippets = () => {
        if(searchExpression === "") {
            setErrMsg("");
            fetchSnippets();
            return;
        }
        else {
            fetch(`/users/posts/search/${searchExpression}`, {
                method: "GET"
              })
                .then(response => response.json())
                .then(data => {
                    if (data.length === 0) {
                        setErrMsg("No posts found with expression: "+searchExpression);
                        return;
                    }
                    if (data.message) {
                    setErrMsg("No posts found with expression: "+searchExpression);
                    return;
                } else {
                    console.log(data);
                    setErrMsg("");
                    setSnippets(data); 
                }
                })
        }
    }
    
    const handleChange = (e) => {
        setData({...postData, [e.target.name]: e.target.value});
    }

    // some ideas from https://stackoverflow.com/questions/47402365/how-to-have-nested-loops-with-map-in-jsx
    return (
        <div className='row'>
            {snippets?.length === 0 && <p>No posts found :(</p>}
            {!(snippets?.length === 0) &&
                <div className='content-container'>
                    <span>
                        <p className="error-container" >{errMsg}</p>
                        <input onChange={(e) => setSearchExpression(e.target.value)} value={searchExpression} placeholder='Search expression'></input>
                        <button className='btn container-btn' onClick={() => filterSnippets()}>Search</button>
                    </span>
                </div>
            }
            <h4 className="posts-header">Current posts:</h4>
            {snippets?.length > 0 && 
                snippets.map((item, i) => {
                    return(
                        <div key={item._id} className="content-container col s12">
                            <p className="post-time">
                                Posted: {item.date.split("T")[0]} {item.date.split("T")[1].split(".")[0]} by <Link to={"/profile/"+item.username}>{item.username}</Link>

                                { (item?.username === user?.username || user?.username === "ADMIN") &&
                                    <span className='edit-link-container'><Link className='edit-link' to={"/edit/post/"+item.title}>Edit</Link></span>
                                }
                                { user?.username === "ADMIN" &&
                                    <span className='delete-link-container'><span className='edit-link' onClick={() => deletePost(item.title)}>DELETE</span></span>
                                }
                            </p>
                            { !(item?.lastEdited === item?.date) &&
                                <p className='edit-time'>(Edited: {item.lastEdited.split("T")[0]} {item.lastEdited.split("T")[1].split(".")[0]})</p>
                            }
                            <p className="post-header">{item.title}</p>
                            <div className='code-container'>
                                <pre><code dangerouslySetInnerHTML={{__html: item.formattedBody}}></code></pre>
                            </div>
                            <Link className="page-link" to={`/posts/${item.title}`}>Comments</Link>
                        </div>
                     )
                 })     
            }
            {jwt?.length > 0 &&
            <div className="content-container col s12">
                <p className="error-container" >{errMsg}</p>
                <p>Post input:</p>
                <form onSubmit={submit} onChange={handleChange}>
                    <input type="text" name="title" placeholder="title"></input>
                    <textarea name="body" placeholder="post body" ></textarea>
                    <input className="btn container-button" type="submit" value="Post"></input>
                </form>
            </div>
            }
        </div>
    )
}

export default SnippetContainer
