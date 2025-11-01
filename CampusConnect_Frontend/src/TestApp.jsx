import React from 'react';

const TestApp = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🎉 CampusConnect Test Page</h1>
      <p>If you can see this, React is working!</p>
      <p>Backend URL: {import.meta.env.VITE_API_URL || 'https://campusconnect-rgx2.onrender.com/api'}</p>
      <button onClick={() => alert('Frontend is working!')}>
        Test Button
      </button>
    </div>
  );
};

export default TestApp;
