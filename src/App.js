import logo from './logo.svg';
import './App.css';
import { useState } from 'react';

function App() {
  const [inputText, setInputText] = useState('');
  const [displayText, setDisplayText] = useState('Learn React');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthToggle = () => {
    setIsAuthenticated((prev) => !prev);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} />
        {isAuthenticated && (
          <button onClick={() => setDisplayText(inputText)}>Update Text</button>
        )}
        <button onClick={handleAuthToggle}>{isAuthenticated ? 'Logout' : 'Login'}</button>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          {displayText}
        </a>
      </header>
    </div>
  );
}

export default App;
