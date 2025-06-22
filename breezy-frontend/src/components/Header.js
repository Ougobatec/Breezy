"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header({ title = "Breezy", showButtons = true }) {
    const pathname = usePathname();

    return (
        <header className="w-full flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
                <Image src="/logo.svg" alt="Logo Breezy" width={32} height={32} />
                <span className="text-xl font-bold">{title}</span>
            </div>
            {showButtons && (
                <div className="flex gap-2">
                    <Link href="/notifications">
                        <button className="p-2" aria-label="Notifications">
                            <Image
                                src={
                                    pathname.startsWith("/notifications")
                                        ? "/notification-active.svg"
                                        : "/notification.svg"
                                }
                                alt="Notifications"
                                width={24}
                                height={24}
                            />
                        </button>
                    </Link>
                    <Link href="/messages/list">
                        <button className="p-2" aria-label="Messages">
                            <Image
                                src={
                                    pathname.startsWith("/messages")
                                        ? "/message-active.svg"
                                        : "/message.svg"
                                }
                                alt="Messages"
                                width={24}
                                height={24}
                            />
                        </button>
                    </Link>
                </div>
            )}
        </header>
    );
}