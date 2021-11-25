import './App.css';
import BookInput from './components/BookInput';
import BookData from './components/BookData';
import My404 from './components/My404';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';



function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/book/:name" element={<BookData />}></Route>
          <Route path="/" element={<BookInput />}></Route>
          <Route path="*" element={<My404 />}></Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
