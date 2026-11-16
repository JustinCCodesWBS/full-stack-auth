import { BrowserRouter, Route, Routes } from 'react-router';
import { Navbar } from './components/Navbar';
import { ProtectedLayout } from './components/ProtectedLayout';
import { AuthProvider } from './context/AuthProvider';
import { CreateDrinkPage, DrinkPage, HomePage, LoginPage, NotFoundPage, RegisterPage } from './app/pages';

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Navbar />
                <main>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/drink/:id" element={<DrinkPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route element={<ProtectedLayout />}>
                            <Route path="/create" element={<CreateDrinkPage />} />
                        </Route>
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </main>
            </AuthProvider>
        </BrowserRouter>
    );
}
