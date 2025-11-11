import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { ArrowLeftIcon } from '../components/ui';

const SignUp: React.FC = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        nickname: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signup, setCurrentPage } = useContext(AuthContext);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess('');
        const { firstName, lastName, nickname, email, password } = formData;
        if (!firstName || !lastName || !nickname || !email || !password) {
            setError(t('error.allFieldsRequired'));
            return;
        }
        if (password.length < 6) {
            setError(t('error.passwordLength'));
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await signup(formData);
            setSuccess(t('signup_success_message'));
            setTimeout(() => setCurrentPage('login'), 2000);
        } catch (err: any) {
            setError(t(err.message) || 'Failed to sign up.');
        } finally {
            setIsLoading(false);
        }
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
                        {t('signup_title')}
                    </h1>
                    <p className="mt-2 text-lg text-[rgb(var(--color-text-secondary))]">{t('signup_subtitle')}</p>
                </header>
                <main className="bg-[rgba(var(--color-bg-panel),0.5)] backdrop-blur-sm border border-[rgba(var(--color-border),0.5)] p-8 rounded-xl shadow-lg shadow-[rgba(var(--color-primary-950),0.2)]">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">{t('label_first_name')}</label>
                                <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} required className="w-full bg-[rgba(var(--color-bg-secondary),0.3)] border border-[rgb(var(--color-border))] rounded-md shadow-sm p-2.5 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary-500))]"/>
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">{t('label_last_name')}</label>
                                <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} required className="w-full bg-[rgba(var(--color-bg-secondary),0.3)] border border-[rgb(var(--color-border))] rounded-md shadow-sm p-2.5 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary-500))]"/>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="nickname" className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">{t('label_nickname')}</label>
                            <input type="text" name="nickname" id="nickname" value={formData.nickname} onChange={handleChange} required className="w-full bg-[rgba(var(--color-bg-secondary),0.3)] border border-[rgb(var(--color-border))] rounded-md shadow-sm p-2.5 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary-500))]"/>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">{t('label_email')}</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="w-full bg-[rgba(var(--color-bg-secondary),0.3)] border border-[rgb(var(--color-border))] rounded-md shadow-sm p-2.5 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary-500))]"/>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">{t('label_password')}</label>
                            <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required className="w-full bg-[rgba(var(--color-bg-secondary),0.3)] border border-[rgb(var(--color-border))] rounded-md shadow-sm p-2.5 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary-500))]"/>
                        </div>

                        {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}
                        {success && <p className="text-green-400 text-sm text-center pt-2">{success}</p>}

                        <div className="pt-2">
                            <button type="submit" disabled={isLoading || !!success} className="w-full inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-[rgb(var(--color-primary-600))] hover:bg-[rgb(var(--color-primary-700))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-[rgb(var(--color-primary-500))] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                {isLoading ? `${t('btn_signup')}...` : t('btn_signup')}
                            </button>
                        </div>
                    </form>
                    <p className="mt-6 text-center text-sm text-[rgb(var(--color-text-secondary))]">
                        {t('signup_have_account')}{' '}
                        <button onClick={() => setCurrentPage('login')} className="font-medium text-[rgb(var(--color-primary-400))] hover:text-[rgb(var(--color-primary-300))]">
                            {t('btn_login')}
                        </button>
                    </p>
                </main>
            </div>
        </div>
    );
};

export default SignUp;
