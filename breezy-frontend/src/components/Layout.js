import Header from "@/components/Header";
import BottomNav from "@/components/Nav";

export default function Layout({ children, showHeader = true, headerProps = {}, showNav = true }) {
    const paddingTop = showHeader ? "pt-18" : "";
    const paddingBottom = showNav ? "pb-14" : "";

    return (
        <div className="min-h-screen flex flex-col">
            {showHeader && <Header {...headerProps} />}
            <main className={`w-full flex flex-col flex-1 max-w-xl mx-auto ${paddingTop} ${paddingBottom}`.trim()}>
                {children}
            </main>
            {showNav && <BottomNav />}
        </div>
    );
}