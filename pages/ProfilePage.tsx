import React, { useState, useContext, useMemo, useEffect } from 'react';
import { AuthContext, PublishedImage, User } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { UserIcon, ArrowLeftIcon, HeartIcon, HandThumbUpIcon, HandThumbDownIcon, DownloadIcon, XMarkIcon, ArrowsPointingOutIcon, CheckIcon, SparklesIcon } from '../components/ui';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import ProfileDropdown from '../components/ProfileDropdown';

const ProfilePage: React.FC = () => {
    const {
        currentUser,
        viewingProfileEmail,
        publishedImages,
        allUsers,
        setAppView,
        globalVoteData,
        userVotes,
        favorites,
        imageHistory,
        followingBlockData,
        handleVote,
        toggleFavorite,
        handleFollow,
        handleBlock,
    } = useContext(AuthContext);
    const { t } = useTranslation();

    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [userPublishedImages, setUserPublishedImages] = useState<PublishedImage[]>([]);
    const [selectedImage, setSelectedImage] = useState<PublishedImage | null>(null);

    const isOwnProfile = currentUser?.email === viewingProfileEmail;

    const mySocials = useMemo(() => {
        return followingBlockData[currentUser?.email || ''] || { following: [], blocked: [] };
    }, [followingBlockData, currentUser]);

    useEffect(() => {
        if (viewingProfileEmail) {
            const user = allUsers.find(u => u.email === viewingProfileEmail);
            setProfileUser(user || null);
            setUserPublishedImages(publishedImages.filter(img => img.creatorEmail === viewingProfileEmail));
        }
    }, [viewingProfileEmail, allUsers, publishedImages]);
    
    // --- Analytics Calculations ---
    const analytics = useMemo(() => {
        if (!isOwnProfile || !currentUser) return null;
        
        const likesReceived = publishedImages
            .filter(p => p.creatorEmail === currentUser.email)
            .reduce((sum, p) => sum + (globalVoteData[p.id]?.likes ?? 0), 0);
            
        const dislikesReceived = publishedImages
            .filter(p => p.creatorEmail === currentUser.email)
            .reduce((sum, p) => sum + (globalVoteData[p.id]?.dislikes ?? 0), 0);
            
        const likesGiven = Object.values(userVotes).filter(v => v === 'like').length;
        const dislikesGiven = Object.values(userVotes).filter(v => v === 'dislike').length;
        
        const followers = Object.values(followingBlockData).filter((data: { following: string[] }) => data.following.includes(currentUser.email)).length;

        return {
            lastLogin: currentUser.lastLoginDate,
            creations: imageHistory.length,
            likesReceived,
            dislikesReceived,
            likesGiven,
            dislikesGiven,
            followers,
            following: mySocials.following.length,
        };

    }, [isOwnProfile, currentUser, publishedImages, imageHistory, globalVoteData, userVotes, followingBlockData, mySocials]);

    const openViewer = (image: PublishedImage) => setSelectedImage(image);
    const closeViewer = () => setSelectedImage(null);

    const selectedImageVotes = selectedImage ? globalVoteData[selectedImage.id] : null;
    const selectedUserVote = selectedImage ? userVotes[selectedImage.id] : null;
    const isFavorite = selectedImage ? favorites.includes(selectedImage.id) : false;

    if (!profileUser) {
        return (
             <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-bg-gradient-from))] to-[rgb(var(--color-bg-gradient-to))] flex items-center justify-center">
                <p>Loading profile...</p>
             </div>
        );
    }

    const isFollowing = mySocials.following.includes(profileUser.email);
    const isBlocked = mySocials.blocked.includes(profileUser.email);

    return (
         <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-bg-gradient-from))] to-[rgb(var(--color-bg-gradient-to))] text-[rgb(var(--color-text-primary))]">
            <header className="fixed top-0 left-0 right-0 z-50 bg-[rgba(var(--color-bg-panel),0.7)] backdrop-blur-xl border-b border-[rgba(var(--color-border),0.5)] shadow-md">
                <div className="max-w-4xl mx-auto flex justify-between items-center p-4">
                    <button onClick={() => setAppView('landing')} className="text-left">
                        <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--color-primary-500))] to-purple-600">
                           {t('profile_page_title', profileUser.nickname)}
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

            <div className="p-4 sm:p-6 lg:p-8 pt-28">
                <div className="max-w-4xl mx-auto">
                    <main>
                         {!isOwnProfile && (
                            <div className="flex justify-end gap-2 mb-4">
                               {isBlocked ? (
                                   <span className="px-4 py-2 text-sm font-semibold rounded-md bg-gray-700 text-gray-400">{t('btn_blocked')}</span>
                               ) : (
                                <button
                                    onClick={() => handleFollow(profileUser.email)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${isFollowing ? 'border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] bg-transparent hover:bg-[rgba(var(--color-bg-secondary),0.6)]' : 'bg-[rgb(var(--color-primary-600))] text-white hover:bg-[rgb(var(--color-primary-700))]'}`}
                                >
                                    {isFollowing ? t('btn_unfollow') : t('btn_follow')}
                                </button>
                               )}
                                <button
                                     onClick={() => handleBlock(profileUser.email)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${isBlocked ? 'border border-red-500/50 text-red-400 bg-red-950/40 hover:bg-red-900/60' : 'border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] bg-transparent hover:bg-[rgba(var(--color-bg-secondary),0.6)]'}`}
                                >
                                    {isBlocked ? t('btn_unblock') : t('btn_block')}
                                </button>
                            </div>
                        )}
                        {isOwnProfile && analytics && (
                            <section className="mb-12">
                                <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-4 border-b border-[rgb(var(--color-border))] pb-2">{t('profile_analytics_title')}</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <div className="bg-[rgba(var(--color-bg-panel),0.5)] p-4 rounded-lg">
                                        <p className="text-2xl font-bold text-[rgb(var(--color-primary-400))]">{analytics.creations}</p>
                                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">{t('profile_creations')}</p>
                                    </div>
                                    <div className="bg-[rgba(var(--color-bg-panel),0.5)] p-4 rounded-lg">
                                        <p className="text-2xl font-bold text-green-400">{analytics.likesReceived}</p>
                                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">{t('profile_likes_received')}</p>
                                    </div>
                                    <div className="bg-[rgba(var(--color-bg-panel),0.5)] p-4 rounded-lg">
                                        <p className="text-2xl font-bold text-red-400">{analytics.dislikesReceived}</p>
                                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">{t('profile_dislikes_received')}</p>
                                    </div>
                                     <div className="bg-[rgba(var(--color-bg-panel),0.5)] p-4 rounded-lg">
                                        <p className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">{analytics.lastLogin}</p>
                                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">{t('profile_last_login')}</p>
                                    </div>
                                    <div className="bg-[rgba(var(--color-bg-panel),0.5)] p-4 rounded-lg cursor-pointer hover:bg-[rgba(var(--color-bg-secondary),0.4)]">
                                        <p className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">{analytics.followers}</p>
                                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">{t('profile_followers')}</p>
                                    </div>
                                     <div className="bg-[rgba(var(--color-bg-panel),0.5)] p-4 rounded-lg cursor-pointer hover:bg-[rgba(var(--color-bg-secondary),0.4)]">
                                        <p className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">{analytics.following}</p>
                                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">{t('profile_following')}</p>
                                    </div>
                                    <div className="bg-[rgba(var(--color-bg-panel),0.5)] p-4 rounded-lg cursor-pointer hover:bg-[rgba(var(--color-bg-secondary),0.4)]">
                                        <p className="text-2xl font-bold text-green-400">{analytics.likesGiven}</p>
                                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">{t('profile_likes_given')}</p>
                                    </div>
                                    <div className="bg-[rgba(var(--color-bg-panel),0.5)] p-4 rounded-lg cursor-pointer hover:bg-[rgba(var(--color-bg-secondary),0.4)]">
                                        <p className="text-2xl font-bold text-red-400">{analytics.dislikesGiven}</p>
                                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">{t('profile_dislikes_given')}</p>
                                    </div>
                                </div>
                            </section>
                        )}
                         <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-6 border-b border-[rgb(var(--color-border))] pb-2">
                            {t('profile_page_creations')}
                        </h2>
                        {isBlocked ? (
                             <div className="text-center py-12 bg-[rgba(var(--color-bg-panel),0.5)] border border-dashed border-[rgba(var(--color-border),0.5)] rounded-lg">
                               <UserIcon className="mx-auto h-12 w-12 text-[rgb(var(--color-text-secondary))]" />
                               <h3 className="mt-2 text-lg font-medium text-[rgb(var(--color-text-primary))]">{t('profile_user_blocked')}</h3>
                            </div>
                        ) : userPublishedImages.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {userPublishedImages.map((item) => (
                                    <div key={item.id} className="group relative aspect-square cursor-pointer" onClick={() => openViewer(item)}>
                                        <img src={item.imageUrl} alt={`creation by ${profileUser.nickname}`} className="w-full h-full object-cover rounded-lg shadow-md" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                            <p className="text-white text-sm font-semibold">{t('btn_view')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-[rgba(var(--color-bg-panel),0.5)] border border-dashed border-[rgba(var(--color-border),0.5)] rounded-lg">
                               <UserIcon className="mx-auto h-12 w-12 text-[rgb(var(--color-text-secondary))]" />
                               <h3 className="mt-2 text-lg font-medium text-[rgb(var(--color-text-primary))]">{t('profile_no_images_title')}</h3>
                               <p className="mt-1 text-sm text-[rgb(var(--color-text-secondary))]">{t('profile_no_images_desc')}</p>
                            </div>
                        )}
                        <div className="flex justify-start items-center mt-12">
                            <button
                                onClick={() => setAppView('landing')}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[rgb(var(--color-primary-600))] hover:bg-[rgb(var(--color-primary-700))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-[rgb(var(--color-primary-500))] transition-colors"
                            >
                                <ArrowLeftIcon className="w-5 h-5 mr-2 -ml-1" />
                                {t('btn_back_to_home')}
                            </button>
                        </div>
                    </main>
                </div>
            </div>

            {selectedImage && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={closeViewer}>
                    <div className="relative w-full max-w-2xl bg-[rgb(var(--color-bg-panel))] border border-[rgb(var(--color-border))] rounded-xl shadow-lg p-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <button onClick={closeViewer} className="absolute -top-3 -right-3 text-white/70 bg-[rgb(var(--color-bg-panel))] rounded-full p-1 hover:text-white transition-colors z-20" aria-label="Close image view">
                            <XMarkIcon className="w-8 h-8" />
                        </button>
                        <div className="relative aspect-square bg-black/20 rounded-lg flex items-center justify-center">
                            <img src={selectedImage.imageUrl} alt={`Creation by ${profileUser.nickname}`} className="w-full h-full object-contain rounded-lg" />
                        </div>
                        <div className="flex items-center justify-between gap-4 mt-4">
                             <div className="flex items-center gap-2">
                                <button onClick={() => handleVote(selectedImage.id, 'like')} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${selectedUserVote === 'like' ? 'bg-[rgba(var(--color-primary-500),0.3)] text-[rgb(var(--color-primary-300))]' : 'bg-transparent text-[rgb(var(--color-text-secondary))] hover:bg-[rgba(var(--color-bg-secondary),0.6)]'}`}>
                                    <HandThumbUpIcon className="w-5 h-5"/>
                                    <span>{selectedImageVotes?.likes ?? 0}</span>
                                </button>
                                <button onClick={() => handleVote(selectedImage.id, 'dislike')} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${selectedUserVote === 'dislike' ? 'bg-red-500/20 text-red-400' : 'bg-transparent text-[rgb(var(--color-text-secondary))] hover:bg-[rgba(var(--color-bg-secondary),0.6)]'}`}>
                                    <HandThumbDownIcon className="w-5 h-5"/>
                                    <span>{selectedImageVotes?.dislikes ?? 0}</span>
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => toggleFavorite(selectedImage.id)} aria-label={t('btn_favorite')} className="p-2 rounded-md bg-[rgba(var(--color-bg-secondary),0.4)] hover:bg-[rgba(var(--color-bg-secondary),0.6)] transition-colors">
                                    <HeartIcon className={`w-5 h-5 ${isFavorite ? 'text-rose-500 fill-current' : 'text-[rgb(var(--color-text-secondary))]'}`}/>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;