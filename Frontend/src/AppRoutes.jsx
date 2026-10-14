import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Register from './pages/Register'
import Login from './pages/Login'

const Home = lazy(() => import('./pages/Home'))

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Suspense fallback={null}>
                <Routes>
                    <Route path='/' element={<Landing />} />
                    <Route path='/home' element={<Home />} />
                    <Route path='/register' element={<Register />} />
                    <Route path='/login' element={<Login />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

export default AppRoutes