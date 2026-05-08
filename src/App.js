import logo from './logo.svg';
import './App.css';
import { createContext, useContext, useState } from 'react';
//import { useState } from 'react';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const toggleAuth = () => {
    setIsAuthenticated((prev) => prev ? window.location.href = '/logout' : window.location.href = '/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, toggleAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

function TextUpdateWhenAuthenticated() {
  const { isAuthenticated } = useContext(AuthContext);
  const [inputText, setInputText] = useState('');
  const [displayText, setDisplayText] = useState('Learn React');

  return (
    <div>
      {isAuthenticated && (
        <>
          <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} />
          <button onClick={() => setDisplayText(inputText)}>Update Text</button>
        </>
      )}
      <p>{displayText}</p>
    </div>
  );
}

function AunthenticationToggle({ isAuthenticated, toggleAuth }) {
  return (
    <button onClick={toggleAuth}>
      {isAuthenticated ? 'Logout' : 'Login'}
    </button>
  );
}

function App() {
  const [displayText] = useState('Learn React');
  const {isAuthenticated, toggleAuth} = useContext(AuthContext);

  return (
    <AuthProvider>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <TextUpdateWhenAuthenticated />
          <AunthenticationToggle isAuthenticated={isAuthenticated} toggleAuth={toggleAuth} />
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
    </AuthProvider>
  );
}

export default App;
