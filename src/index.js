import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Landing from './pages/landing';
import About from './pages/about';
import Pricing from './pages/pricing';
import HowItWorks from './pages/howitworks';
import App from './App';
import Alter from './pages/alter';
import Blur from './pages/blur';
import Zeroshot from './pages/product';
import ObjectTracker from './pages/object';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// import Home from './pages/Home';
// import About from './pages/About';
import Contact from './pages/contact';

import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <Router>
{/*      
       <nav style={{ padding: '1rem', background: '#eee' }}>
        <Link to="/" style={{ marginRight: 10 }}>Home</Link>
        
        <Link to="/contact">Contact</Link>
      </nav> */}
      <Routes>
        
        <Route path="/App" element={<App />} />
        {/* <Route path="/about" element={<About />} /> */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/blur" element={<Blur />} />
         <Route path="/Alter" element={<Alter />} />    
        <Route path="/object" element={<ObjectTracker />} />
        <Route path="/Zeroshot" element={<Zeroshot />} />
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
      </Routes>
    </Router>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
