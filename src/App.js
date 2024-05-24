import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginForm from './comps/loginForm';
import RegisterForm from './comps/RegisterForm';
import Home from './comps/Home';
import AddWord from './comps/AddWord';
import Report from './comps/Report'

function App() {
  
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/" element={<LoginForm />} />
            <Route path="/home" element={<Home />} />
            <Route path="/add-word" element={<AddWord />} />
            <Route path="/report" element={<Report />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
