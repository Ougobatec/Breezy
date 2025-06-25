import Image from "next/image";
import Link from "next/link";

export default function IconButton({ href, icon, activeIcon, alt, isActive, size = 24, ...props }) {
    const iconSrc = `/${isActive ? activeIcon : icon}`;

    if (href) {
        return (
            <Link href={href} aria-label={alt} {...props}>
                <Image src={iconSrc} alt={alt} width={size} height={size} />
            </Link>
        );
    }
    return (
        <button aria-label={alt} {...props}>
            <Image src={iconSrc} alt={alt} width={size} height={size} />
        </button>
    );
}