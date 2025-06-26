import Image from "next/image";

export default function Avatar({ user, size = 48, className = "" }) {
  const sizeClass = size === 32 ? "w-8 h-8" : size === 40 ? "w-10 h-10" : "w-12 h-12";
  
  if (user?.avatar) {
    return (
      <Image
        src={
          user.avatar.startsWith("http")
            ? user.avatar
            : `${process.env.NEXT_PUBLIC_BACKEND_URL}${user.avatar}`
        }
        alt={`Avatar de ${user.name || user.username || "utilisateur"}`}
        width={size}
        height={size}
        className={`${sizeClass} rounded-full object-cover ${className}`}
      />
    );
  }

  // Avatar par défaut avec initiales ou icône
  const initials = user?.name 
    ? user.name.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase()
    : user?.username?.substring(0, 2).toUpperCase() || "?";

  return (
    <div 
      className={`${sizeClass} rounded-full flex items-center justify-center text-sm font-semibold ${className}`}
      style={{ 
        backgroundColor: "var(--input)",
        color: "var(--text-secondary)"
      }}
    >
      {initials}
    </div>
  );
}
