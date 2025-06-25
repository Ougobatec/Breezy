import Image from "next/image";

export default function LoadingScreen({ text = "Chargement…" }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <Image src="/logo.svg" alt="Logo Breezy" width={64} height={64} className="mb-6 animate-bounce" />
            <div className="text-xl font-semibold mb-2">{text}</div>
        </div>
    );
}