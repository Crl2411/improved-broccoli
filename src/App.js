import logo from './logo.svg';
import './App.css';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState(null);
  
  const toggleAuth = (username = '', password = '') => {
    if (!isAuthenticated) {
      // Login
      setCredentials({ username, password });
      setIsAuthenticated(true);
    } else {
      // Logout
      setCredentials(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, toggleAuth, credentials }}>
      {children}
    </AuthContext.Provider>
  );
};

function FieldUpdateWhenAuthenticated() {
  const { isAuthenticated, toggleAuth } = useContext(AuthContext);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div>
      {!isAuthenticated && (
        <>
          <p>User name:</p><input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} />
          <p>Password:</p><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={() => {
            toggleAuth(userName, password)
          }}>Log in</button>
        </>
      )}
      {isAuthenticated && (
        <>
        <p>Welcome back, {userName}!</p>
        <button onClick={() => {
            toggleAuth()
            setUserName('')
            setPassword('')
          }}>Log out</button>
        </>
      )}
    </div>
  );
}

function DatabaseData() {
  const { credentials } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!credentials) {
      setLoading(false);
      return;
    }

    fetch('/api/get_db_items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password
      })
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.text()}`);
        }
        return response.json();
      })
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [credentials]);

  if (!credentials) {
    return <p>Please log in to view database items.</p>;
  }

  if (loading) {
    return <p>Loading database items…</p>;
  }

  if (error) {
    return <p>Error loading items: {error}</p>;
  }

  return (
    <div>
      <h2>Database Items</h2>
      <ul>
        {items.length > 0 ? (
          items.map((item) => (
            <li key={item.SchemeID}>
              <strong>{item.SchemeName}</strong>: {item.Regulator}
            </li>
          ))
        ) : (
          <li>No items found.</li>
        )}
      </ul>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <FieldUpdateWhenAuthenticated />
          <DatabaseData />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    </AuthProvider>
  );
}

export default App;
