import { useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { createDrink, drinkNameSchema } from '../../data/drinks';
import { errorMessage } from '../../data/http';

export function CreateDrinkPage() {
    const { request } = useAuth();
    const navigate = useNavigate();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const [nameError, setNameError] = useState('');

    async function submit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const name = drinkNameSchema.safeParse(new FormData(event.currentTarget).get('name'));
        setError('');
        setNameError('');
        if (!name.success) {
            setNameError(name.error.issues[0].message);
            return;
        }
        setPending(true);
        try {
            const drink = await createDrink(request, name.data);
            void navigate(`/drink/${drink._id}`);
        } catch (error) {
            setError(errorMessage(error));
        } finally {
            setPending(false);
        }
    }

    return (
        <section>
            <h1>Drink anlegen</h1>
            <form onSubmit={submit} noValidate>
                <label htmlFor="name">Name</label>
                <input id="name" name="name" required aria-invalid={Boolean(nameError)}
                    aria-describedby={nameError ? 'name-error' : undefined} />
                {nameError && <p id="name-error" role="alert">{nameError}</p>}
                <button type="submit" disabled={pending}>Drink anlegen</button>
                {error && <p role="alert">{error}</p>}
            </form>
        </section>
    );
}
