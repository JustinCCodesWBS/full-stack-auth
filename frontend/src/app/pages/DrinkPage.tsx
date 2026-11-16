import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { deleteDrink, getDrink, updateDrink, type Drink } from '../../data/drinks';
import { errorMessage } from '../../data/http';

function DrinkDetails({ id }: { id: string }) {
    const { user, request } = useAuth();
    const [drink, setDrink] = useState<Drink | null>(null);
    const [error, setError] = useState('');
    const [pending, setPending] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();
        void getDrink(id, controller.signal).then(setDrink, error => {
            if (!controller.signal.aborted) setError(errorMessage(error));
        });
        return () => controller.abort();
    }, [id]);

    if (!drink) {
        return error ? <p role="alert">{error}</p> : <p role="status">Drink wird geladen …</p>;
    }

    const canEdit = user !== null && (user.id === drink.ownerId || user.roles.includes('admin'));

    async function runAction(action: () => Promise<void>) {
        setPending(true);
        setError('');
        try {
            await action();
        } catch (error) {
            setError(errorMessage(error));
        } finally {
            setPending(false);
        }
    }

    return (
        <section>
            <h1>{drink.name}</h1>
            <p>{drink.onMenu ? 'Auf der Karte' : 'Nicht auf der Karte'}</p>
            {canEdit && (
                <>
                    <button type="button" disabled={pending} onClick={() => void runAction(async () => {
                        setDrink(await updateDrink(request, id, !drink.onMenu));
                    })}>
                        {drink.onMenu ? 'Von der Karte nehmen' : 'Auf die Karte setzen'}
                    </button>
                    <button type="button" disabled={pending} onClick={() => void runAction(async () => {
                        await deleteDrink(request, id);
                        void navigate('/');
                    })}>Löschen</button>
                </>
            )}
            {error && <p role="alert">{error}</p>}
        </section>
    );
}

export function DrinkPage() {
    const { id } = useParams();
    return id ? <DrinkDetails key={id} id={id} /> : <p>Drink nicht gefunden.</p>;
}
