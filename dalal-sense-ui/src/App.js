import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Score from './pages/Score'
import Navbar from './components/Navbar'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{background:'#0a0a0a',color:'#fff'}}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/score" element={<Score />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}