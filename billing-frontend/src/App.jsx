import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Calls your API Gateway on port 8000
    // Change "/api/plans" to match your actual Java REST Controller endpoint path
    axios.get('http://localhost:8000/api/plans')
        .then(response => {
          setData(response.data);
        })
        .catch(err => {
          setError(err.message);
        });
  }, []);

  return (
      <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
        <h1>Billing System Dashboard</h1>
        {error && <p style={{ color: 'red' }}>Error fetching data: {error}</p>}

        <h3>Backend Data:</h3>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
  );
}

export default App;