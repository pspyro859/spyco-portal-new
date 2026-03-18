import React, { useEffect, useState } from 'react';
import './App.css';

// Load portal CSS
const portalCSSLink = document.createElement('link');
portalCSSLink.rel = 'stylesheet';
portalCSSLink.href = '/api/portal/css';
document.head.appendChild(portalCSSLink);

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to portal
    window.location.href = '/api/portal';
  }, []);

  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading Spyco Portal...</p>
    </div>
  );
}

export default App;
