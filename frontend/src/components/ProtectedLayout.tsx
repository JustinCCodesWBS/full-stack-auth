import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';

export function ProtectedLayout() {
    const { signedIn, checkSession } = useAuth();

    if (checkSession) return <p role="status">Sitzung wird geprüft …</p>;
    return signedIn ? <Outlet /> : <Navigate to="/login" replace />;
}
