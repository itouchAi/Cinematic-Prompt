import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

const Subscription: React.FC = () => {
    const { currentUser, subscribeUser, setAppView, setCurrentPage, previousAppView } = useContext(AuthContext);
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = () => {
        if (!currentUser) {
            setCurrentPage('signup');
            return;
        }
        setIsLoading(true);
        // Simulate a network request
        setTimeout(() => {
            subscribeUser();
            setIsLoading(false);
            // The AuthContext will automatically switch the view back to the generator
        }, 1500);
    };

    const handleGoBack = () => {
        if (!currentUser) {
            setCurrentPage('landing');
        } else {
            setAppView(previousAppView || 'landing');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-bg-gradient-from))] to-[rgb(var(--color-bg-gradient-to))] text-[rgb(var(--color-text-primary))] flex items-center justify-center p-4">
            <div className="w-full max-w-2xl mx-auto">
                <main className="bg-[rgba(var(--color-bg-panel),0.7)] backdrop-blur-xl border border-[rgba(var(--color-border),0.5)] p-8 sm:p-12 rounded-2xl shadow-2xl shadow-[rgba(var(--color-primary-950),0.3)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        {/* Placeholder for a future image */}
                        <div className="bg-[rgba(var(--color-bg-secondary),0.4)] border-2 border-dashed border-[rgb(var(--color-border))] rounded-lg flex items-center justify-center h-64 md:h-full">
                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Visual Content Here</p>
                        </div>
                        
                        <div className="text-center md:text-left">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-[rgb(var(--color-primary-400))]">{t('subscription_tag')}</h2>
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--color-primary-400))] to-purple-500 mt-2">
                                <span dangerouslySetInnerHTML={{ __html: t('subscription_title').replace('Full Potential', '<br />Full Potential') }} />
                            </h1>
                            <p className="mt-4 text-lg text-[rgb(var(--color-text-secondary))]">
                                {t('subscription_desc')}
                            </p>
                            
                            <div className="my-6">
                                <span className="text-5xl font-bold text-[rgb(var(--color-text-primary))]">{t('subscription_price', 20)}</span>
                                <span className="text-lg text-[rgb(var(--color-text-secondary))]">{t('subscription_period')}</span>
                            </div>

                            <ul className="space-y-2 text-left text-[rgb(var(--color-text-secondary))]">
                                <li className="flex items-center"><svg className="w-5 h-5 mr-2 text-[rgb(var(--color-primary-500))]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>{t('subscription_feature1')}</li>
                                <li className="flex items-center"><svg className="w-5 h-5 mr-2 text-[rgb(var(--color-primary-500))]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>{t('subscription_feature2')}</li>
                                <li className="flex items-center"><svg className="w-5 h-5 mr-2 text-[rgb(var(--color-primary-500))]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>{t('subscription_feature3')}</li>
                            </ul>

                             <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleGoBack}
                                    className="w-full inline-flex items-center justify-center px-6 py-3 border border-[rgb(var(--color-border))] text-base font-medium rounded-md shadow-md text-[rgb(var(--color-text-secondary))] bg-[rgba(var(--color-bg-panel),0.6)] hover:bg-[rgba(var(--color-bg-panel),0.8)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-gray-500 transition-all"
                                >
                                    {t('btn_go_back')}
                                </button>
                                <button
                                    onClick={handleSubscribe}
                                    disabled={isLoading}
                                    className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-[rgb(var(--color-primary-600))] hover:bg-[rgb(var(--color-primary-700))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-[rgb(var(--color-primary-500))] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {isLoading ? t('btn_processing') : !currentUser ? t('btn_signup') : t('btn_subscribe_now')}
                                </button>
                             </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Subscription;