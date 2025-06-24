import Image from "next/image";
import Link from "next/link";

export default function NavIconButton({ href, icon, activeIcon, alt, isActive }) {
    return (
        <Link href={href}>
            <button className="p-2 cursor-pointer" aria-label={alt}>
                <Image
                    src={isActive ? `/${activeIcon}` : `/${icon}`}
                    alt={alt}
                    width={24}
                    height={24}
                />
            </button>
        </Link>
    );
}