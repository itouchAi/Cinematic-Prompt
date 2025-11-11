import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { CheckIcon, ArrowLeftIcon } from '../components/ui';

const Login: React.FC = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, setCurrentPage } = useContext(AuthContext);

    // State for Forgot Password Modal
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isResetting, setIsResetting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError(t('error.allFieldsRequired'));
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
        } catch (err: any) {
            setError(t(err.message) || 'Failed to log in.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handlePasswordResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsResetting(true);
        setResetMessage(null);
        if (!resetEmail) {
            setResetMessage({ type: 'error', text: t('login_forgot_modal_error_email') });
            setIsResetting(false);
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        setResetMessage({
            type: 'success',
            text: t('login_forgot_modal_success')
        });

        setIsResetting(false);

        setTimeout(() => {
            setShowForgotPassword(false);
            setResetMessage(null);
            setResetEmail('');
        }, 3500);
    };

    const openForgotPassword = () => {
        setError('');
        setShowForgotPassword(true);
    };

    const closeForgotPassword = () => {
        if (isResetting) return;
        setShowForgotPassword(false);
        setResetMessage(null);
        setResetEmail('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-bg-gradient-from))] to-[rgb(var(--color-bg-gradient-to))] text-[rgb(var(--color-text-primary))] flex items-center justify-center p-4">
            <button
                onClick={() => setCurrentPage('landing')}
                className="absolute top-6 left-6 z-10 inline-flex items-center gap-2 text-sm text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors duration-200"
                aria-label={t('btn_back_to_home')}
            >
                <ArrowLeftIcon className="w-5 h-5" />
                <span className="hidden sm:inline">{t('btn_back_to_home')}</span>
            </button>
            <div className="w-full max-w-md">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--color-primary-500))] to-purple-600">
                        {t('login_title')}
                    </h1>
                    <p className="mt-2 text-lg text-[rgb(var(--color-text-secondary))]">{t('login_subtitle')}</p>
                </header>
                <main className="bg-[rgba(var(--color-bg-panel),0.5)] backdrop-blur-sm border border-[rgba(var(--color-border),0.5)] p-8 rounded-xl shadow-lg shadow-[rgba(var(--color-primary-950),0.2)]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                                {t('label_email')}
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[rgba(var(--color-bg-secondary),0.3)] border border-[rgb(var(--color-border))] rounded-md shadow-sm p-3 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary-500))] focus:border-[rgb(var(--color-primary-500))] sm:text-sm text-[rgb(var(--color-text-primary))] placeholder-[rgb(var(--color-text-secondary))] transition"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                                    {t('label_password')}
                                </label>
                                <button
                                    type="button"
                                    onClick={openForgotPassword}
                                    className="text-sm font-medium text-[rgb(var(--color-primary-400))] hover:text-[rgb(var(--color-primary-300))] focus:outline-none"
                                >
                                    {t('login_forgot_password')}
                                </button>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 w-full bg-[rgba(var(--color-bg-secondary),0.3)] border border-[rgb(var(--color-border))] rounded-md shadow-sm p-3 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary-500))] focus:border-[rgb(var(--color-primary-500))] sm:text-sm text-[rgb(var(--color-text-primary))] placeholder-[rgb(var(--color-text-secondary))] transition"
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-[rgb(var(--color-primary-600))] hover:bg-[rgb(var(--color-primary-700))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-[rgb(var(--color-primary-500))] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                            >
                                {isLoading ? `${t('btn_login')}...` : t('btn_login')}
                            </button>
                        </div>
                    </form>
                    <p className="mt-6 text-center text-sm text-[rgb(var(--color-text-secondary))]">
                        {t('login_no_account')}{' '}
                        <button onClick={() => setCurrentPage('signup')} className="font-medium text-[rgb(var(--color-primary-400))] hover:text-[rgb(var(--color-primary-300))]">
                            {t('btn_signup')}
                        </button>
                    </p>
                </main>
            </div>

            {showForgotPassword && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="forgot-password-title">
                    <div
                        className="absolute inset-0"
                        onClick={closeForgotPassword}
                        aria-hidden="true"
                    ></div>
                    <div className="relative w-full max-w-md bg-[rgb(var(--color-bg-panel))] border border-[rgb(var(--color-border))] rounded-xl shadow-lg p-8">
                        <h2 id="forgot-password-title" className="text-2xl font-bold text-center text-[rgb(var(--color-text-primary))]">{t('login_forgot_modal_title')}</h2>
                        
                        {resetMessage?.type === 'success' ? (
                            <div className="mt-6 text-center flex flex-col items-center">
                                <CheckIcon className="w-12 h-12 p-2 text-green-400 bg-green-500/20 rounded-full mb-4" />
                                <p className="text-green-300">{resetMessage.text}</p>
                            </div>
                        ) : (
                            <>
                                <p className="mt-2 text-center text-sm text-[rgb(var(--color-text-secondary))]">
                                    {t('login_forgot_modal_desc')}
                                </p>
                                <form onSubmit={handlePasswordResetRequest} className="space-y-6 mt-6">
                                    <div>
                                        <label htmlFor="reset-email" className="sr-only">
                                            {t('label_email')}
                                        </label>
                                        <input
                                            id="reset-email"
                                            name="reset-email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            placeholder={t('login_forgot_modal_placeholder')}
                                            className="w-full bg-[rgba(var(--color-bg-secondary),0.3)] border border-[rgb(var(--color-border))] rounded-md shadow-sm p-3 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary-500))] sm:text-sm text-[rgb(var(--color-text-primary))] placeholder-[rgb(var(--color-text-secondary))] transition"
                                        />
                                    </div>
                                    {resetMessage?.type === 'error' && <p className="text-red-500 text-sm text-center">{resetMessage.text}</p>}
                                    <div className="flex flex-col sm:flex-row-reverse gap-3">
                                        <button
                                            type="submit"
                                            disabled={isResetting}
                                            className="w-full inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-md text-white bg-[rgb(var(--color-primary-600))] hover:bg-[rgb(var(--color-primary-700))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-[rgb(var(--color-primary-500))] disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >
                                            {isResetting ? t('login_forgot_modal_btn_sending') : t('login_forgot_modal_btn_send')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={closeForgotPassword}
                                            className="w-full inline-flex items-center justify-center px-6 py-2.5 border border-[rgb(var(--color-border))] text-base font-medium rounded-md shadow-sm text-[rgb(var(--color-text-secondary))] bg-[rgba(var(--color-bg-panel),0.6)] hover:bg-[rgba(var(--color-bg-panel),0.8)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-gray-500 transition"
                                        >
                                            {t('btn_cancel')}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
