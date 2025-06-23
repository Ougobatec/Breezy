import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 text-center" style={{ backgroundColor: "var(--primary)", color: "var(--text-inverted)" }}>
        <h1 className="text-3xl font-bold">Bienvenue sur Breezy</h1>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center px-4">
        <div className="text-2xl font-bold mb-6">Bienvenue sur Breezy</div>
        <p className="text-center mb-4">
            Le reseau social léger et rapide pour partager vos pensées et vos passions.
        </p>
        <Link href="/auth/login" className="text-blue-600 hover:underline">
          Se connecter
        </Link>
      </main>
    </div>
  );
}
