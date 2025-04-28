import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Settings from './pages/Settings'
import ColorBlindnessModes from './pages/ColorBlindnessModes'


export default function App() {
  return (
    <Router>
      <div className="extension-container" role="application" aria-label="AccessMate">
        <header className="top-bar">
          <img src="icons/logo.png" alt="AccessMate Logo" className="logo" />
          <h1 className="title">AccessMate</h1>
          <button className="close-btn" onClick={() => window.close()} aria-label="Close">
            ×
          </button>
        </header>

        <nav className="nav-bar" aria-label="Main">
          <Link to="/">Home</Link>
          <Link to="/settings">Settings</Link>
          <Link to="/colorblind">Color-Blindness Mode</Link>
        </nav>

        <div className="page-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/colorblind" element={<ColorBlindnessModes />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}
