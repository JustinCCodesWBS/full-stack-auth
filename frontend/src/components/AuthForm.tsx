import { useState, type SubmitEvent } from 'react';
import { Navigate } from 'react-router';
import { z } from 'zod/v4';
import { useAuth } from '../context/AuthContext';
import { credentialsSchema } from '../data/auth';
import { errorMessage } from '../data/http';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
    const { signedIn, signIn, signUp, checkSession, signingIn } = useAuth();
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ email?: string[]; password?: string[] }>({});
    const label = mode === 'login' ? 'Anmelden' : 'Registrieren';

    if (checkSession) return <p role="status">Sitzung wird geprüft …</p>;
    if (signedIn) return <Navigate to="/create" replace />;

    async function submit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const result = credentialsSchema.safeParse({ email: form.get('email'), password: form.get('password') });

        setError('');
        setFieldErrors({});
        if (!result.success) {
            setFieldErrors(z.flattenError(result.error).fieldErrors);
            return;
        }

        try {
            const authenticate = mode === 'login' ? signIn : signUp;
            await authenticate(result.data);
        } catch (error) {
            setError(errorMessage(error));
        }
    }

    return (
        <section>
            <h1>{label}</h1>
            <form onSubmit={submit} noValidate>
                <p>
                    <label htmlFor="email">E-Mail-Adresse</label><br />
                    <input id="email" name="email" type="email" autoComplete="email" required
                        aria-invalid={Boolean(fieldErrors.email)}
                        aria-describedby={fieldErrors.email ? 'email-error' : undefined} />
                    {fieldErrors.email && <span id="email-error" role="alert">{fieldErrors.email[0]}</span>}
                </p>
                <p>
                    <label htmlFor="password">Passwort</label><br />
                    <input id="password" name="password" type="password" required
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        aria-invalid={Boolean(fieldErrors.password)}
                        aria-describedby={fieldErrors.password ? 'password-error' : undefined} />
                    {fieldErrors.password && <span id="password-error" role="alert">{fieldErrors.password[0]}</span>}
                </p>
                <button type="submit" disabled={signingIn}>{signingIn ? 'Bitte warten …' : label}</button>
                {error && <p role="alert">{error}</p>}
            </form>
        </section>
    );
}
