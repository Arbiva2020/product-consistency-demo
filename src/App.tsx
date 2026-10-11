import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import ExplorePage from './pages/ExplorePage'
import CheckPage from './pages/CheckPage'
import ReviewPage from './pages/ReviewPage'
import DashboardPage from './pages/DashboardPage'

import './App.css'


export default function App() {
 

  return (
   <Routes>
    <Route element={<AppShell/>}>
    <Route path="/check" element={<CheckPage/>}/>
    <Route path="explore" element={<ExplorePage/>}/>
    <Route path="review" element={<ReviewPage/>}/>
    <Route path="dashboard" element={<DashboardPage/>}/>

    <Route path="/" element={<Navigate to="/check" replace />} />
    </Route>
   </Routes>
  )  
    
}


