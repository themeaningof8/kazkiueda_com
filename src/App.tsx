import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import Layout from '@/components/layout'
import AboutPage from '@/pages/AboutPage'
import HomePage from '@/pages/HomePage'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/about' element={<AboutPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
