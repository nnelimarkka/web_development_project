import React from 'react'
import {useState, useEffect} from "react";

const BookInput = () => {
    const [book, setBook] = useState({});

    const submit = (e) => {
        e.preventDefault()
    
            fetch("/api/book", {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(book),
                mode: "cors"
            })
                .then(response => response.json())
                .then(json => console.log(json))
    }
    
    const handleChange = (e) => {
        setBook({...book, [e.target.name]: e.target.value});
    }
    return (
        <div>
        <h1>Books</h1>
          <h2>Book Input:</h2>
            <form onSubmit={submit} onChange={handleChange}>
                <label htmlFor="name">name</label>
                <input type="text" name="name" id="name" />
                <label htmlFor="author">author</label>
                <input type="text" id="author" name="author" />
                <label htmlFor="pages">pages</label>
                <input type="number" id="pages" name="pages" />
                <input className="btn" type="submit" id="submit" />
            </form>
  
        </div>
    )
}

export default BookInput
