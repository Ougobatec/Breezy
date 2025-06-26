"use client";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function SuspendedUserMessage() {
    const { user } = useAuth();
    const { t } = useLanguage();

    if (!user?.suspended) return null;

    return (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
            <div className="flex">
                <div className="flex-shrink-0">
                    <span className="text-yellow-500 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                        <strong>Compte suspendu</strong>
                    </p>
                    <p className="text-sm text-yellow-600 mt-1">
                        Votre compte est actuellement suspendu. Vous ne pouvez pas publier de contenu ou commenter jusqu&apos;à ce que la suspension soit levée.
                    </p>
                </div>
            </div>
        </div>
    );
}
