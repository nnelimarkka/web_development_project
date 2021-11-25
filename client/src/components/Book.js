import React from 'react'

const Book = (props) => {
    let data = props.data;
    return (
        <div>
            <h1>Books</h1>
                <p>name - {data.name}</p>
                <p>author - {data.author}</p>
                <p>pages - {data.pages}</p>
        </div>
    )
}

export default Book
