import {useParams} from 'react-router-dom'
import {useEffect, useState} from 'react'
import Book from "./Book";


function BookData() {
    const {name} = useParams()
    const [data, setData] = useState("");
    
    useEffect(() => {
        fetch("/api/book/"+ name)
            .then(response => response.json())
            .then(json => setData(json))

    }, [name])
    
    return (
        <div>
            { data?.name?.length > 0 &&
                <Book data={data} />
            }
            {data?.msg?.length > 0 &&
            <h4>404: This is not the webpage you are looking for</h4>
            }
        </div>
    )
}

export default BookData
