import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'
import Layout from './components/Layout'
import AuthForm from './components/AuthForm'
import Dashboard from './pages/Dashboard'
import Nutrition from './pages/Nutrition'
import FoodLibrary from './pages/FoodLibrary'
import Workouts from './pages/Workouts'
import ExerciseLibrary from './pages/ExerciseLibrary'
import BodyMetrics from './pages/BodyMetrics'
import Settings from './pages/Settings'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <AuthForm />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/nutrition/foods" element={<FoodLibrary />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/workouts/exercises" element={<ExerciseLibrary />} />
        <Route path="/body" element={<BodyMetrics />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
