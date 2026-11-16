import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { listDrinks, type Drink } from '../../data/drinks';
import { errorMessage } from '../../data/http';

export function HomePage() {
    const [drinks, setDrinks] = useState<Drink[] | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        void listDrinks(controller.signal).then(setDrinks, error => {
            if (!controller.signal.aborted) setError(errorMessage(error));
        });
        return () => controller.abort();
    }, []);

    return (
        <section>
            <h1>Drinks</h1>
            {error && <p role="alert">{error}</p>}
            {!drinks && !error && <p role="status">Drinks werden geladen …</p>}
            {drinks?.length === 0 && <p>Es gibt noch keine Drinks.</p>}
            <ul>
                {drinks?.map(drink => (
                    <li key={drink._id}>
                        <Link to={`/drink/${drink._id}`}>{drink.name}</Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
