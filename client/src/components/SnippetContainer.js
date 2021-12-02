import React from 'react'
import {useState, useEffect} from "react";

/*
    main content of the page is rendered in this component ie. all of the code snippets found in database.

    Content posting is limited to authenticated users with conditional rendering.
*/

const SnippetContainer = ({jwt, snippets, setSnippets, user}) => {
    const hljs = require('highlight.js'); //code highlighting
    const [postData, setData] = useState({});
    const [errMsg, setErrMsg] = useState("");

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
    }, [])
    

    const submit = (e) => {
        e.preventDefault()
    
            fetch("/users/posts/post", {
                method: "POST",
                headers: {
                    "authorization": "Bearer " + jwt,
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
    
    
    const handleChange = (e) => {
        setData({...postData, [e.target.name]: e.target.value});
    }

    // some ideas from https://stackoverflow.com/questions/47402365/how-to-have-nested-loops-with-map-in-jsx
    return (
        <div className="row">
            {jwt?.length > 0 &&
            <div className="content-container col s12">
            <p className="error-container" >{errMsg}</p>
            <p>Post input:</p>
            <form onSubmit={submit} onChange={handleChange}>
                <input type="text" name="title" placeholder="title"></input>
                <input type="text" name="body" placeholder="post body"></input>
                <input className="btn container-button" type="submit" value="Post"></input>
            </form>
            </div>
            }
            <div>
                <h4 className="posts-header">Current posts:</h4>
            </div>
            {snippets?.length === 0 && <p>No posts found :(</p>}
            {snippets?.length > 0 && 
                snippets.map((item, i) => {
                    return( 
                    <div className="content-container col s12" key={item.id}>
                        <p className="post-time">
                            Posted: {item.date.split("T")[0]} {item.date.split("T")[1].split(".")[0]} by {item.username}
                        </p>
                        <p className="post-header">{item.title}</p>
                        <pre><code>{item.body}</code></pre>
                     </div>
                    )
                 })     
            }
        </div>
    )
}

export default SnippetContainer
