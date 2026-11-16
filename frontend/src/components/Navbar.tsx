import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../data/http';

export function Navbar() {
    const { user, signedIn, checkSession, signingIn, signOut, error } = useAuth();
    const [logoutError, setLogoutError] = useState('');
    const [loggingOut, setLoggingOut] = useState(false);
    const navigate = useNavigate();

    async function handleLogout() {
        setLogoutError('');
        setLoggingOut(true);
        try {
            await signOut();
            void navigate('/', { replace: true });
        } catch (error) {
            setLogoutError(errorMessage(error));
        } finally {
            setLoggingOut(false);
        }
    }

    return (
        <header>
            <nav aria-label="Hauptnavigation">
                <ul>
                    <li><Link to="/">Drinks</Link></li>
                    {!checkSession && !signingIn && (signedIn ? (
                        <>
                            <li><Link to="/create">Drink anlegen</Link></li>
                            <li><button type="button" disabled={loggingOut} onClick={handleLogout}>Abmelden</button></li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/login">Anmelden</Link></li>
                            <li><Link to="/register">Registrieren</Link></li>
                        </>
                    ))}
                </ul>
            </nav>
            {user && <p>Willkommen, {user.email}.</p>}
            {(error || logoutError) && <p role="alert">{error || logoutError}</p>}
        </header>
    );
}
