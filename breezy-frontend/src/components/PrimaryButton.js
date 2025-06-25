import Link from "next/link";

const baseStyle = "w-full rounded-xl px-4 py-4 text-base font-semibold flex justify-center items-center";
const baseColor = { backgroundColor: "var(--primary)", color: "var(--text-inverted)" };

export default function PrimaryButton({ children, href, type = "button", ...props }) {
  if (href) {
    return (
      <Link href={href} className={baseStyle} style={baseColor} {...props} >
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={baseStyle} style={baseColor} {...props} >
      {children}
    </button>
  );
}