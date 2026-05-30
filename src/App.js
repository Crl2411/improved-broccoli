import logo from './logo.svg';
import './App.css';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const toggleAuth = () => {
    setIsAuthenticated((prev) => {
      if (prev) {
        window.location.href = '/logout';
        return false;
      }
      window.location.href = '/login';
      return true;
    });
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

function DatabaseData() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/items')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
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
  }, []);

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
            <li key={item.id}>
              <strong>{item.name}</strong>: {item.value}
            </li>
          ))
        ) : (
          <li>No items found.</li>
        )}
      </ul>
    </div>
  );
}

function AuthenticationToggle() {
  const { isAuthenticated, toggleAuth } = useContext(AuthContext);
  return (
    <button onClick={toggleAuth}>
      {isAuthenticated ? 'Logout' : 'Login'}
    </button>
  );
}

function CheckHealth() {
  const [health, setHealth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/health')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading health data…</p>;
  }

  if (error) {
    return <p>Error loading health data: {error}</p>;
  }

  return (
    <div>
      <h2>Health Data</h2>
      <ul>
        {health.length > 0 ? (
          health.map((item) => (
            <li key={item.status}>
              <strong>{item.status}</strong>: {item.status}
            </li>
          ))
        ) : (
          <li>No health data found.</li>
        )}
      </ul>
    </div>
  );
}


function NewMessage() {
  const [data, setData] = useState('');
  
  useEffect(() => {
    (async function () {
      const { text } = await( await fetch(`/api/message`)).charset;
      setData(text);
    })();
  });

  return (<div>
      <h2>Message from API:</h2>
      <p>{data}</p>
    </div>
  );

}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <TextUpdateWhenAuthenticated />
          <AuthenticationToggle />
          <CheckHealth />
          <DatabaseData />
          <NewMessage />
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
