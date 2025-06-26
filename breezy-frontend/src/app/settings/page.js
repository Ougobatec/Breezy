"use client";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const { theme, changeTheme } = useTheme();

  if (loading) return <LoadingScreen text={t('loading')} />;
  if (!user) return null;

  return (
    <Layout headerProps={{ title: t('settings'), showButtons: true }}>
      <div className="p-4 space-y-6">
        {/* Section Langue */}
        <div className="rounded-xl overflow-hidden border" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              {t('language')}
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <button
              onClick={() => changeLanguage('fr')}
              className="w-full p-3 rounded-xl border text-left flex items-center justify-between hover:opacity-80"
              style={{
                backgroundColor: language === 'fr' ? 'var(--primary)' : 'var(--input)',
                borderColor: language === 'fr' ? 'var(--primary)' : 'var(--border)',
                color: language === 'fr' ? 'white' : "var(--text-primary)"
              }}
            >
              <span>{t('french')}</span>
              {language === 'fr' && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className="w-full p-3 rounded-xl border text-left flex items-center justify-between hover:opacity-80"
              style={{
                backgroundColor: language === 'en' ? 'var(--primary)' : 'var(--input)',
                borderColor: language === 'en' ? 'var(--primary)' : 'var(--border)',
                color: language === 'en' ? 'white' : "var(--text-primary)"
              }}
            >
              <span>{t('english')}</span>
              {language === 'en' && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </button>
          </div>
        </div>

        {/* Section Thème */}
        <div className="rounded-xl overflow-hidden border" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              {t('theme')}
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <button
              onClick={() => changeTheme('light')}
              className="w-full p-3 rounded-xl border text-left flex items-center justify-between hover:opacity-80"
              style={{
                backgroundColor: theme === 'light' ? 'var(--primary)' : 'var(--input)',
                borderColor: theme === 'light' ? 'var(--primary)' : 'var(--border)',
                color: theme === 'light' ? 'white' : "var(--text-primary)"
              }}
            >
              <span>{t('light')}</span>
              {theme === 'light' && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </button>
            <button
              onClick={() => changeTheme('dark')}
              className="w-full p-3 rounded-xl border text-left flex items-center justify-between hover:opacity-80"
              style={{
                backgroundColor: theme === 'dark' ? 'var(--primary)' : 'var(--input)',
                borderColor: theme === 'dark' ? 'var(--primary)' : 'var(--border)',
                color: theme === 'dark' ? 'white' : "var(--text-primary)"
              }}
            >
              <span>{t('dark')}</span>
              {theme === 'dark' && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </button>
            <button
              onClick={() => changeTheme('system')}
              className="w-full p-3 rounded-xl border text-left flex items-center justify-between hover:opacity-80"
              style={{
                backgroundColor: theme === 'system' ? 'var(--primary)' : 'var(--input)',
                borderColor: theme === 'system' ? 'var(--primary)' : 'var(--border)',
                color: theme === 'system' ? 'white' : "var(--text-primary)"
              }}
            >
              <span>{t('system')}</span>
              {theme === 'system' && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </button>
          </div>
        </div>

        {/* Section Administration */}
        {(user?.role === 'moderator' || user?.role === 'admin') && (
          <div className="rounded-xl overflow-hidden border" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Administration
              </h2>
            </div>
            <div className="p-4">
              <button
                onClick={() => window.location.href = '/admin'}
                className="w-full p-3 rounded-xl border text-left flex items-center justify-between hover:opacity-80"
                style={{
                  backgroundColor: 'var(--input)',
                  borderColor: 'var(--border)',
                  color: "var(--text-primary)"
                }}
              >
                <span>
                  {user?.role === 'admin' ? 'Panel Administrateur' : 'Panel Modérateur'}
                </span>
                <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  →
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Section Compte */}
        <div className="rounded-xl overflow-hidden border" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Compte
            </h2>
          </div>
          <div className="p-4">
            <button
              onClick={logout}
              className="w-full p-3 rounded-xl border hover:opacity-80"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgb(239, 68, 68)',
                color: 'rgb(239, 68, 68)'
              }}
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}