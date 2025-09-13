import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Contact from './pages/Contact';
import LoginPage from './pages/Login';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <div className="App" dir="rtl">
        <Header />
        <div className="pt-20 pb-0"> 
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<LoginPage/>} />
            <Route path="/admin" element={<AdminPanel />}/>
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;