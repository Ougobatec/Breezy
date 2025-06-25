import Link from 'next/link';
import Layout from '@/components/Layout';
import PrimaryButton from '@/components/PrimaryButton';

export default function Home() {
  return (
    <Layout headerProps={{ showButtons: false }} showNav={false}>
      <div className="flex flex-col flex-1">
        <div className="flex flex-col justify-center items-center gap-6 flex-1 p-4">
          <h1 className="text-3xl font-bold text-center" style={{ color: "var(--primary)" }}>
            Bienvenue sur Breezy
          </h1>
          <p className="text-center">
            Le réseau social léger et rapide pour partager vos pensées et vos passions.
          </p>
        </div>
        <div className="p-4">
          <PrimaryButton href="/auth/login" type="button">
            Se connecter
          </PrimaryButton>
        </div>
      </div>
    </Layout>
  );
}