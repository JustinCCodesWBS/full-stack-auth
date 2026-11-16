import { Link } from 'react-router';

export function NotFoundPage() {
    return (
        <section>
            <h1>Seite nicht gefunden</h1>
            <Link to="/">Zur Drink-Liste</Link>
        </section>
    );
}
