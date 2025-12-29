import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth/*" element={<AuthLayout />} />
          
          {/* Main App Routes - Remove /dashboard prefix */}
          <Route path="/*" element={<DashboardLayout />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App