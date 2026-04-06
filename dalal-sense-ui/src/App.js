import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Score from './pages/Score'
import Navbar from './components/Navbar'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{background:'#0a0a0a', color:'#fff', minHeight:'100vh'}}>
        <Navbar />
        <Routes>
          <Route path="/"         element={<Landing />} />
          <Route path="/screener" element={<Home />} />
          <Route path="/score"    element={<Score />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}