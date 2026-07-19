import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
    <main className="grid-texture flex min-h-dvh flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="mono text-xs uppercase tracking-wider text-warn">HTTP 404</p>
        <h1 className="mono text-2xl font-bold text-fg sm:text-3xl">service not found</h1>
        <p className="max-w-sm text-fg-muted">
            Nothing's deployed at this route. Head back to the console.
        </p>
        <Link
            to="/"
            className="mono mt-2 flex min-h-11 items-center rounded-md bg-accent px-4 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
        >
            ~/home
        </Link>
    </main>
);

export default NotFound;
