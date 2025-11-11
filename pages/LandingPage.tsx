import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import CommunityGallery from '../components/CommunityGallery';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import ProfileDropdown from '../components/ProfileDropdown';
import { SparklesIcon } from '../components/ui';

const LandingPage: React.FC = () => {
    const { currentUser, setCurrentPage, setAppView } = useContext(AuthContext);
    const { t } = useTranslation();
    const [filter, setFilter] = useState<'latest' | 'mostLiked'>('latest');

    const LoggedOutHeader = () => (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[rgba(var(--color-bg-panel),0.7)] backdrop-blur-xl border-b border-[rgba(var(--color-border),0.5)] shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
                 <button onClick={() => setCurrentPage('landing')} className="text-left">
                    <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--color-primary-500))] to-purple-600">
                        {t('header_title')}
                    </h1>
                </button>
                <div className="flex items-center gap-2 sm:gap-4">
                    <LanguageSwitcher />
                    <button
                        onClick={() => setCurrentPage('subscription')}
                        className="px-3 sm:px-4 py-2 text-sm font-semibold rounded-md text-[rgb(var(--color-text-primary))] hover:bg-[rgba(var(--color-bg-secondary),0.7)] transition-colors"
                    >
                        {t('btn_pricing')}
                    </button>
                    <button
                        onClick={() => setCurrentPage('login')}
                        className="px-3 sm:px-4 py-2 text-sm font-semibold rounded-md text-[rgb(var(--color-text-primary))] hover:bg-[rgba(var(--color-bg-secondary),0.7)] transition-colors"
                    >
                        {t('btn_login')}
                    </button>
                    <button
                        onClick={() => setCurrentPage('signup')}
                        className="px-3 sm:px-4 py-2 text-sm font-semibold rounded-md text-white bg-[rgb(var(--color-primary-600))] hover:bg-[rgb(var(--color-primary-700))] transition-colors shadow-md"
                    >
                        {t('btn_signup')}
                    </button>
                </div>
            </div>
        </header>
    );

     const LoggedInHeader = () => {
        const { currentUser, setAppView } = useContext(AuthContext);
        return (
            <header className="fixed top-0 left-0 right-0 z-50 bg-[rgba(var(--color-bg-panel),0.7)] backdrop-blur-xl border-b border-[rgba(var(--color-border),0.5)] shadow-md">
                <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
                     <button onClick={() => setAppView('landing')} className="text-left">
                        <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--color-primary-500))] to-purple-600">
                            {t('header_title')}
                        </h1>
                    </button>
                    <div className="flex items-center gap-2 sm:gap-4">
                        {currentUser && !currentUser.isSubscribed && (
                             <button
                                onClick={() => setAppView('subscription')}
                                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-[rgb(var(--color-primary-600))] hover:bg-[rgb(var(--color-primary-700))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-[rgb(var(--color-primary-500))] transition-all duration-300 transform hover:scale-105"
                            >
                                <SparklesIcon className="w-5 h-5"/>
                                <span>{t('btn_upgrade')}</span>
                            </button>
                        )}
                        <ProfileDropdown />
                        <ThemeSwitcher />
                        <LanguageSwitcher />
                    </div>
                </div>
            </header>
        );
     };


    return (
        <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-bg-gradient-from))] to-[rgb(var(--color-bg-gradient-to))] text-[rgb(var(--color-text-primary))]">
            {currentUser ? <LoggedInHeader /> : <LoggedOutHeader />}

            <main className="pt-24 sm:pt-28 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center my-12 md:my-16">
                        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
                            <span dangerouslySetInnerHTML={{ __html: t('landing_title').replace('Cinematic Masterpiece', '<span class="text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--color-primary-400))] to-purple-500">Cinematic Masterpiece</span>') }} />
                        </h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-[rgb(var(--color-text-secondary))]">
                            {t('landing_subtitle')}
                        </p>
                    </div>

                    {currentUser && (
                        <div className="flex justify-center items-center gap-4 mb-8">
                            <button
                                onClick={() => setFilter('latest')}
                                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${filter === 'latest' ? 'bg-[rgb(var(--color-primary-600))] text-white' : 'bg-[rgba(var(--color-bg-secondary),0.5)] text-[rgb(var(--color-text-secondary))] hover:bg-[rgba(var(--color-bg-secondary),0.8)]'}`}
                            >
                                {t('filter_latest')}
                            </button>
                             <button
                                onClick={() => setFilter('mostLiked')}
                                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${filter === 'mostLiked' ? 'bg-[rgb(var(--color-primary-600))] text-white' : 'bg-[rgba(var(--color-bg-secondary),0.5)] text-[rgb(var(--color-text-secondary))] hover:bg-[rgba(var(--color-bg-secondary),0.8)]'}`}
                            >
                                {t('filter_most_liked')}
                            </button>
                        </div>
                    )}
                    
                    <CommunityGallery filter={filter} />

                </div>
            </main>

             <footer className="text-center pb-10 text-sm text-[rgb(var(--color-text-secondary))] opacity-60">
                <p>{currentUser ? t('generator_footer') : t('landing_footer')}</p>
            </footer>
        </div>
    );
};

export default LandingPage;