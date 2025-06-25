"use client";
import Image from "next/image";
import IconButton from "@/components/IconButton";
import { usePathname } from "next/navigation";

const headerNavItems = [
    { href: "/notifications", icon: "notification.svg", activeIcon: "notification-active.svg", alt: "Notifications" },
    { href: "/messages", icon: "message.svg", activeIcon: "message-active.svg", alt: "Messages" },
];

export default function Header({ title = "Breezy", showButtons = true }) {
    const pathname = usePathname();

    return (
        <header className="w-full flex items-center justify-between px-6 py-4 fixed top-0 left-0 z-50" style={{ backgroundColor: "var(--UI)", borderBottom: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2">
                <Image src="/logo.svg" alt="Logo Breezy" width={32} height={32} />
                <span className="text-xl font-bold">{title}</span>
            </div>
            {showButtons && (
                <div className="flex gap-2">
                    {headerNavItems.map(({ href, icon, activeIcon, alt }) => {
                        const isActive = pathname === href || pathname.startsWith(href + "/");
                        return (
                            <IconButton key={href} href={href} icon={icon} activeIcon={activeIcon} alt={alt} isActive={isActive} className="p-2" />
                        );
                    })}
                </div>
            )}
        </header>
    );
}