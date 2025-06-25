"use client";
import { useLanguage } from "@/context/LanguageContext";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const { language, changeLanguage, t } = useLanguage();

  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage);
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) return <LoadingScreen text={t('loading')} />;
  if (!user) return null;

  return (
    <Layout headerProps={{ title: t('settings'), showButtons: true }}>
      <div className="p-4">
        {/* Section Langue */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            {t('language')}
          </h2>
          <div className="space-y-2">
            <button
              onClick={() => handleLanguageChange('fr')}
              className={`w-full p-3 rounded-xl border text-left flex items-center justify-between ${
                language === 'fr' ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              style={{ 
                backgroundColor: language === 'fr' ? 'var(--primary)20' : 'var(--card)',
                borderColor: language === 'fr' ? 'var(--primary)' : 'var(--border)',
                color: "var(--text-primary)"
              }}
            >
              <span>{t('french')}</span>
              {language === 'fr' && (
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "var(--primary)" }}></div>
              )}
            </button>
            
            <button
              onClick={() => handleLanguageChange('en')}
              className={`w-full p-3 rounded-xl border text-left flex items-center justify-between ${
                language === 'en' ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              style={{ 
                backgroundColor: language === 'en' ? 'var(--primary)20' : 'var(--card)',
                borderColor: language === 'en' ? 'var(--primary)' : 'var(--border)',
                color: "var(--text-primary)"
              }}
            >
              <span>{t('english')}</span>
              {language === 'en' && (
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "var(--primary)" }}></div>
              )}
            </button>
          </div>
        </div>

        {/* Section Compte */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Compte
          </h2>
          <button
            onClick={handleLogout}
            className="w-full p-3 rounded-xl border border-red-300 text-red-600 hover:bg-red-50"
          >
            {t('logout')}
          </button>
        </div>
      </div>
    </Layout>
  );
}
