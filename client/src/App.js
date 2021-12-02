import './App.css';
import My404 from './components/My404';
import Footer from './components/Footer';
import Login from './components/Login';
import SnippetContainer from './components/SnippetContainer';
import Register from './components/Register';
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import {useState} from "react";
import CommentContainer from './components/CommentContainer';



/* 
  Content is rendered mainly based on routes 
  path "*" will match every path that is not in use in order to render 404-page. 

  help from: (https://stackoverflow.com/questions/48345434/how-to-display-404-when-url-doesnt-match-any-route-and-when-the-url-contains),
  and week 11 source codes 
*/
function App() {
  const [jwt, setJwt] = useState("");
  const [user, setUser] = useState({});
  const [snippets, setSnippets] = useState([]);

  return (
    <div className="container">
      <h1>Codebook</h1>
      <Router>
        <Link className="page-link" to="/">Home</Link>
        <Link className="page-link" to="/login">Login</Link>
        <Link className="page-link" to="/register">register</Link>
        <h3>{jwt ? `Logged in as: ${user.username}.` : ""}</h3>
        <hr/>
        <Routes>
          <Route path="/" element={<SnippetContainer jwt={jwt} snippets={snippets} setSnippets={setSnippets} user={user}/>}></Route>
          <Route path="/login" element={<Login setJwt={setJwt} setUser={setUser} jwt={jwt}/>}></Route>
          <Route path="/register" element={<Register />}></Route>
          <Route path="/posts/:title" element={<CommentContainer jwt={jwt} />}></Route>
          <Route path="*" element={<My404 />}></Route>

        </Routes>
      </Router>
      <hr/>
      <Footer />
    </div>
  );
}

export default App;
