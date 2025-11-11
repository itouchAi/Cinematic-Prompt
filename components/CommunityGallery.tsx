import React, { useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { AuthContext, PublishedImage, ImageHistoryItem } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { communityGalleryItems } from '../constants';
import { LockClosedIcon, ClipboardIcon, CheckIcon, DownloadIcon, ArrowsPointingOutIcon, XMarkIcon, HandThumbUpIcon, HandThumbDownIcon, HeartIcon, UserIcon, XCircleIcon, ChevronLeftIcon, ChevronRightIcon, ArrowPathIcon, SparklesIcon, ArrowUpOnSquareIcon } from './ui';
import { GoogleGenAI, Modality } from '@google/genai';


interface CommunityGalleryProps {
    onUsePrompt?: (item: PublishedImage) => void;
    filter?: 'latest' | 'mostLiked';
}

const buildPrompt = (item: PublishedImage): string => {
    return item.prompt;
};

const CommunityGallery: React.FC<CommunityGalleryProps> = ({ onUsePrompt, filter = 'latest' }) => {
    const { currentUser, setAppView, setCurrentPage, publishedImages, globalVoteData, userVotes, favorites, handleVote, toggleFavorite, addImageHistoryItem, publishImage } = useContext(AuthContext);
    const { t } = useTranslation();
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [processingError, setProcessingError] = useState<string>('');
    const [showEnhanceUpscaleModal, setShowEnhanceUpscaleModal] = useState<'enhance' | 'upscale' | null>(null);

    const isSubscribed = currentUser?.isSubscribed ?? false;

    const allImages = useMemo(() => {
        const combined = [...publishedImages, ...communityGalleryItems];
        const uniqueImages = Array.from(new Map(combined.map(item => [item.id, item])).values());
        
        if (filter === 'mostLiked') {
            return uniqueImages.sort((a, b) => {
                const likesA = globalVoteData[a.id]?.likes ?? 0;
                const likesB = globalVoteData[b.id]?.likes ?? 0;
                return likesB - likesA;
            });
        }
        return uniqueImages;

    }, [publishedImages, filter, globalVoteData]);

    const selectedImage = selectedImageIndex !== null ? allImages[selectedImageIndex] : null;

    const resetModalState = useCallback(() => {
        setIsProcessing(false);
        setProcessingError('');
        setShowEnhanceUpscaleModal(null);
        setIsFullscreen(false);
    }, []);

    const navigateToPreviousImage = useCallback(() => {
        if (selectedImageIndex !== null && selectedImageIndex > 0) {
            setSelectedImageIndex(selectedImageIndex - 1);
            resetModalState();
        }
    }, [selectedImageIndex, resetModalState]);

    const navigateToNextImage = useCallback(() => {
        if (selectedImageIndex !== null && selectedImageIndex < allImages.length - 1) {
            setSelectedImageIndex(selectedImageIndex + 1);
            resetModalState();
        }
    }, [selectedImageIndex, allImages.length, resetModalState]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (selectedImageIndex === null) return;
            if (event.key === 'ArrowLeft') navigateToPreviousImage();
            else if (event.key === 'ArrowRight') navigateToNextImage();
            else if (event.key === 'Escape') {
                setIsFullscreen(false);
                setSelectedImageIndex(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImageIndex, navigateToPreviousImage, navigateToNextImage]);

    const handleCopy = (item: PublishedImage) => {
        const promptToCopy = buildPrompt(item);
        navigator.clipboard.writeText(promptToCopy).then(() => {
          setCopiedId(item.id);
          setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const handleDownload = () => {
        if (!selectedImage) return;
        const a = document.createElement('a');
        a.href = selectedImage.imageUrl;
        a.download = `cinematic-prompt-${selectedImage.id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    
    const openViewer = (index: number) => {
        setSelectedImageIndex(index);
        resetModalState();
    };
    const closeViewer = () => setSelectedImageIndex(null);

    const handleProcessImage = async (prompt: string, image?: PublishedImage) => {
        setIsProcessing(true);
        setProcessingError('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let contents: any = { parts: [{ text: prompt }] };
            if (image) {
                const base64ImageData = image.imageUrl.split(',')[1];
                contents = { parts: [{ inlineData: { data: base64ImageData, mimeType: 'image/png' } }, { text: prompt }] };
            }
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: contents,
                config: { responseModalities: [Modality.IMAGE] },
            });

            let foundImage = false;
            if (response?.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const newImageItem: ImageHistoryItem = {
                            id: Date.now().toString(),
                            imageUrl: `data:image/png;base64,${part.inlineData.data}`,
                            prompt: image?.prompt || prompt,
                        };
                        addImageHistoryItem(newImageItem);
                        foundImage = true;
                        closeViewer();
                        setAppView('history');
                        break;
                    }
                }
            }
            if (!foundImage) throw new Error("The API did not return a valid image.");

        } catch (e) {
            console.error("Failed to process image", e);
            setProcessingError(t('generator_image_error'));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleGenerateVariant = () => {
        if (!selectedImage) return;
        handleProcessImage(selectedImage.prompt);
    };

    const handleEnhanceOrUpscale = (type: 'enhance' | 'upscale', level: '2x' | '4x') => {
        if (!selectedImage) return;
        setShowEnhanceUpscaleModal(null);
        let newPrompt = type === 'enhance'
            ? (level === '2x' ? t('ai_prompt_enhance_2x') : t('ai_prompt_enhance_4x'))
            : (level === '2x' ? t('ai_prompt_upscale_2x') : t('ai_prompt_upscale_4x'));
        handleProcessImage(newPrompt, selectedImage);
    };

    const selectedImageVotes = selectedImage ? globalVoteData[selectedImage.id] : null;
    const selectedUserVote = selectedImage ? userVotes[selectedImage.id] : null;
    const isFavorite = selectedImage ? favorites.includes(selectedImage.id) : false;
    const isOwner = selectedImage?.creatorEmail === currentUser?.email;

    return (
        <>
        <section className="mt-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {allImages.map((item, index) => {
                    const fullPrompt = buildPrompt(item);
                    return (
                        <div key={item.id} className="group perspective aspect-[3/4] block">
                            <div className={`relative w-full h-full preserve-3d rounded-lg shadow-lg transition-transform duration-700 ${isSubscribed ? 'group-hover:rotate-y-180' : ''}`}>
                                {/* Front */}
                                <div
                                    className="absolute w-full h-full backface-hidden cursor-pointer"
                                    onClick={() => {
                                        if (isSubscribed) {
                                            openViewer(index);
                                        } else if (currentUser) {
                                            setAppView('subscription');
                                        } else {
                                            setCurrentPage('subscription');
                                        }
                                    }}
                                >
                                    <img src={item.imageUrl} alt="Community generated cinematic art" className="w-full h-full object-cover rounded-lg" />
                                    <div 
                                        onClick={(e) => {
                                            if (isSubscribed && item.creatorEmail !== 'system@cinematic.ai') {
                                                e.stopPropagation();
                                                setAppView('profile', item.creatorEmail);
                                            }
                                        }}
                                        className={`absolute top-2 left-2 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm ${isSubscribed && item.creatorEmail !== 'system@cinematic.ai' ? 'hover:bg-black/70' : 'cursor-default'} transition-colors`}
                                    >
                                        <UserIcon className="w-3 h-3" />
                                        <span>{item.creatorNickname}</span>
                                    </div>
                                    {!isSubscribed && (
                                        <div className="absolute inset-0 bg-black/40 rounded-lg flex flex-col items-center justify-center text-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <LockClosedIcon className="w-8 h-8 text-white mb-2" />
                                            <p className="text-white font-semibold">{t('community_subscribe_to_reveal')}</p>
                                        </div>
                                    )}
                                </div>
                                {/* Back */}
                                <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-[rgb(var(--color-bg-panel))] border border-[rgb(var(--color-border))] rounded-lg p-4 flex flex-col items-start justify-between">
                                    <div className="flex-grow overflow-y-auto w-full pr-2">
                                      <p className="text-xs text-[rgb(var(--color-text-secondary))] font-mono whitespace-pre-wrap">{fullPrompt}</p>
                                    </div>
                                    {isSubscribed && (
                                      <div className="flex-shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-[rgb(var(--color-border))] w-full">
                                          <button 
                                            onClick={() => handleCopy(item)}
                                            aria-label={t('btn_copy')}
                                            className="inline-flex items-center justify-center gap-1.5 p-1.5 border border-[rgb(var(--color-border))] text-xs font-medium rounded-md text-[rgb(var(--color-text-secondary))] bg-[rgba(var(--color-bg-secondary),0.4)] hover:bg-[rgba(var(--color-bg-secondary),0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-gray-500 transition-colors"
                                          >
                                            {copiedId === item.id ? <CheckIcon className="w-3.5 h-3.5 text-green-500"/> : <ClipboardIcon className="w-3.5 h-3.5"/>}
                                            <span className="hidden sm:inline">{copiedId === item.id ? t('btn_copied') : t('btn_copy')}</span>
                                          </button>
                                          {onUsePrompt && (
                                            <button 
                                              onClick={() => onUsePrompt(item)}
                                              aria-label={t('btn_use_prompt')}
                                              className="inline-flex items-center justify-center gap-1.5 p-1.5 border border-[rgb(var(--color-border))] text-xs font-medium rounded-md text-[rgb(var(--color-text-secondary))] bg-[rgba(var(--color-bg-secondary),0.4)] hover:bg-[rgba(var(--color-bg-secondary),0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-gray-500 transition-colors"
                                            >
                                                <svg className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-13.34-3.536a8.25 8.25 0 0 1 0-11.667l-3.181 3.183m3.181-3.183L2.985 6.353m13.34 13.34-3.181-3.183m3.181 3.183 3.181-3.183M3.75 6.75h4.992v4.992" /></svg>
                                              <span className="hidden sm:inline">{t('btn_use_prompt')}</span>
                                            </button>
                                          )}
                                           <button 
                                            onClick={() => handleDownload()}
                                            aria-label={t('btn_download')}
                                            className="inline-flex items-center justify-center gap-1.5 p-1.5 border border-[rgb(var(--color-border))] text-xs font-medium rounded-md text-[rgb(var(--color-text-secondary))] bg-[rgba(var(--color-bg-secondary),0.4)] hover:bg-[rgba(var(--color-bg-secondary),0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-gray-500 transition-colors"
                                          >
                                            <DownloadIcon className="w-3.5 h-3.5"/>
                                            <span className="hidden sm:inline">{t('btn_save')}</span>
                                          </button>
                                          <button 
                                            onClick={() => openViewer(index)}
                                            aria-label={t('btn_view')}
                                            className="inline-flex items-center justify-center gap-1.5 p-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-[rgb(var(--color-primary-600))] hover:bg-[rgb(var(--color-primary-700))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-[rgb(var(--color-primary-500))] transition-colors"
                                          >
                                            <ArrowsPointingOutIcon className="w-3.5 h-3.5"/>
                                            <span className="hidden sm:inline">{t('btn_view')}</span>
                                          </button>
                                      </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
        
        {selectedImage && !isFullscreen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={closeViewer}>
            <div className="relative w-full max-w-2xl bg-[rgb(var(--color-bg-panel))] border border-[rgb(var(--color-border))] rounded-xl shadow-lg p-4 flex flex-col" onClick={(e) => { e.stopPropagation(); if (showEnhanceUpscaleModal) setShowEnhanceUpscaleModal(null); }}>
                <button
                    onClick={closeViewer}
                    className="absolute -top-3 -right-3 text-white/70 bg-[rgb(var(--color-bg-panel))] rounded-full p-1 hover:text-white transition-colors z-20"
                    aria-label="Close image view"
                >
                    <XMarkIcon className="w-8 h-8" />
                </button>
                <div className="relative aspect-square bg-black/20 rounded-lg flex items-center justify-center">
                    {isProcessing ? (
                         <div className="flex flex-col items-center justify-center h-full">
                            <svg className="animate-spin h-10 w-10 text-[rgb(var(--color-primary-400))]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <p className="mt-4 text-sm text-[rgb(var(--color-text-secondary))]">{t('generator_variant_loading')}</p>
                        </div>
                    ) : processingError ? (
                         <div className="text-center p-4">
                           <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
                           <p className="text-red-400">{processingError}</p>
                        </div>
                    ) : (
                        <img src={selectedImage.imageUrl} alt="Community generated cinematic art" className="w-full h-full object-contain rounded-lg" />
                    )}
                    <div 
                        onClick={(e) => {
                            if (isSubscribed && selectedImage.creatorEmail !== 'system@cinematic.ai') {
                                e.stopPropagation();
                                setAppView('profile', selectedImage.creatorEmail);
                                closeViewer();
                            }
                        }}
                        className={`absolute top-2 left-2 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm ${isSubscribed && selectedImage.creatorEmail !== 'system@cinematic.ai' ? 'hover:bg-black/70 cursor-pointer' : 'cursor-default'} transition-colors`}
                    >
                        <UserIcon className="w-3 h-3" />
                        <span>{selectedImage.creatorNickname}</span>
                    </div>
                     {allImages.length > 1 && !isProcessing && (
                        <>
                            <button onClick={(e) => { e.stopPropagation(); navigateToPreviousImage(); }} disabled={selectedImageIndex === 0} className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/60 transition-colors disabled:opacity-20 disabled:cursor-not-allowed z-10" aria-label="Previous image"><ChevronLeftIcon className="w-6 h-6" /></button>
                            <button onClick={(e) => { e.stopPropagation(); navigateToNextImage(); }} disabled={selectedImageIndex === allImages.length - 1} className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/60 transition-colors disabled:opacity-20 disabled:cursor-not-allowed z-10" aria-label="Next image"><ChevronRightIcon className="w-6 h-6" /></button>
                        </>
                    )}
                </div>
                 <div className="flex items-center justify-between gap-4 mt-4">
                     <div className="flex items-center gap-2">
                        <button 
                            onClick={() => handleVote(selectedImage.id, 'like')}
                            aria-label={t('vote_like')}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${selectedUserVote === 'like' ? 'bg-[rgba(var(--color-primary-500),0.3)] text-[rgb(var(--color-primary-300))]' : 'bg-transparent text-[rgb(var(--color-text-secondary))] hover:bg-[rgba(var(--color-bg-secondary),0.6)]'}`}
                        >
                            <HandThumbUpIcon className="w-5 h-5"/>
                            <span>{selectedImageVotes?.likes ?? 0}</span>
                        </button>
                        <button 
                            onClick={() => handleVote(selectedImage.id, 'dislike')}
                            aria-label={t('vote_dislike')}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${selectedUserVote === 'dislike' ? 'bg-red-500/20 text-red-400' : 'bg-transparent text-[rgb(var(--color-text-secondary))] hover:bg-[rgba(var(--color-bg-secondary),0.6)]'}`}
                        >
                            <HandThumbDownIcon className="w-5 h-5"/>
                            <span>{selectedImageVotes?.dislikes ?? 0}</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        {isOwner && (
                            <button onClick={() => publishImage(selectedImage)} className={`inline-flex items-center justify-center gap-2 px-3 py-2 border text-sm font-medium rounded-md transition-colors border-green-500/50 text-green-400 bg-green-950/40`}>
                                <CheckIcon className={`w-4 h-4`}/> {t('btn_unpublish')}
                            </button>
                        )}
                        <button onClick={() => toggleFavorite(selectedImage.id)} aria-label={t('btn_favorite')} className="p-2 rounded-md bg-[rgba(var(--color-bg-secondary),0.4)] hover:bg-[rgba(var(--color-bg-secondary),0.6)] transition-colors">
                            <HeartIcon className={`w-5 h-5 ${isFavorite ? 'text-rose-500 fill-current' : 'text-[rgb(var(--color-text-secondary))]'}`}/>
                        </button>
                    </div>
                </div>
                 <div className="pt-4 mt-4 border-t border-[rgb(var(--color-border))] flex flex-wrap justify-end items-center gap-2">
                     <div className="flex-grow flex flex-wrap gap-2">
                        <button onClick={handleGenerateVariant} disabled={isProcessing} className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-[rgb(var(--color-border))] text-sm font-medium rounded-md text-[rgb(var(--color-text-secondary))] bg-[rgba(var(--color-bg-secondary),0.4)] hover:bg-[rgba(var(--color-bg-secondary),0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <ArrowPathIcon className="w-4 h-4" /> {t('btn_generate_variant')}
                        </button>
                        <button onClick={() => setShowEnhanceUpscaleModal('enhance')} disabled={isProcessing} className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-[rgb(var(--color-border))] text-sm font-medium rounded-md text-[rgb(var(--color-text-secondary))] bg-[rgba(var(--color-bg-secondary),0.4)] hover:bg-[rgba(var(--color-bg-secondary),0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <SparklesIcon className="w-4 h-4"/> {t('btn_enhance')}
                        </button>
                        <button onClick={() => setShowEnhanceUpscaleModal('upscale')} disabled={isProcessing} className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-[rgb(var(--color-border))] text-sm font-medium rounded-md text-[rgb(var(--color-text-secondary))] bg-[rgba(var(--color-bg-secondary),0.4)] hover:bg-[rgba(var(--color-bg-secondary),0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <ArrowUpOnSquareIcon className="w-4 h-4"/> {t('btn_upscale')}
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setIsFullscreen(true)} disabled={isProcessing || !!processingError} className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-[rgb(var(--color-border))] text-sm font-medium rounded-md text-[rgb(var(--color-text-secondary))] bg-[rgba(var(--color-bg-panel),0.6)] hover:bg-[rgba(var(--color-bg-panel),0.8)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <ArrowsPointingOutIcon className="w-4 h-4" />
                        </button>
                        <button onClick={handleDownload} disabled={isProcessing || !!processingError} className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[rgb(var(--color-primary-600))] hover:bg-[rgb(var(--color-primary-700))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-[rgb(var(--color-primary-500))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <DownloadIcon className="w-4 h-4" /> {t('btn_download')}
                        </button>
                    </div>
                </div>

                {showEnhanceUpscaleModal && (
                   <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center p-4 rounded-xl" onClick={(e) => { e.stopPropagation(); setShowEnhanceUpscaleModal(null); }}>
                       <div className="bg-[rgb(var(--color-bg-secondary))] p-6 rounded-lg shadow-xl animate-fade-in w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                           <h3 className="text-xl font-bold mb-2 text-center text-[rgb(var(--color-text-primary))]">{showEnhanceUpscaleModal === 'enhance' ? t('modal_enhance_title') : t('modal_upscale_title')}</h3>
                           <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-6 text-center">{t('modal_enhance_desc')}</p>
                           <div className="flex gap-4">
                               <button onClick={() => handleEnhanceOrUpscale(showEnhanceUpscaleModal!, '2x')} className="w-full flex-1 px-4 py-2 border border-[rgb(var(--color-border))] text-base font-semibold rounded-md text-[rgb(var(--color-text-secondary))] bg-[rgba(var(--color-bg-panel),0.6)] hover:bg-[rgba(var(--color-bg-panel),0.8)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-secondary))] focus:ring-gray-500 transition-colors">2x</button>
                               <button onClick={() => handleEnhanceOrUpscale(showEnhanceUpscaleModal!, '4x')} className="w-full flex-1 px-4 py-2 border border-transparent text-base font-semibold rounded-md text-white bg-[rgb(var(--color-primary-600))] hover:bg-[rgb(var(--color-primary-700))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-secondary))] focus:ring-[rgb(var(--color-primary-500))] transition-colors">4x</button>
                           </div>
                       </div>
                   </div>
                )}
            </div>
          </div>
        )}
        
        {isFullscreen && selectedImage && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsFullscreen(false)}>
                <button onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors" aria-label="Close fullscreen view"><XMarkIcon className="w-10 h-10" /></button>
                <img src={selectedImage.imageUrl} alt="Fullscreen favorite" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
                {allImages.length > 1 && (
                    <>
                       <button onClick={(e) => { e.stopPropagation(); navigateToPreviousImage(); }} disabled={selectedImageIndex === 0} className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/60 transition-colors disabled:opacity-20 disabled:cursor-not-allowed z-10" aria-label="Previous image"><ChevronLeftIcon className="w-8 h-8" /></button>
                       <button onClick={(e) => { e.stopPropagation(); navigateToNextImage(); }} disabled={selectedImageIndex === allImages.length - 1} className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/60 transition-colors disabled:opacity-20 disabled:cursor-not-allowed z-10" aria-label="Next image"><ChevronRightIcon className="w-8 h-8" /></button>
                    </>
                )}
            </div>
        )}
        </>
    );
};

export default CommunityGallery;