import React, { useState, useContext, useEffect, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import type { HistoryItem, ImageHistoryItem } from '../context/AuthContext';
import { ClockIcon, TrashIcon, ArrowPathIcon, CheckIcon, ClipboardIcon, ArrowLeftIcon, DownloadIcon, XMarkIcon, ArrowsPointingOutIcon, SparklesIcon, ArrowUpOnSquareIcon, XCircleIcon, ChevronLeftIcon, ChevronRightIcon, HandThumbUpIcon, HandThumbDownIcon, HeartIcon } from '../components/ui';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import ProfileDropdown from '../components/ProfileDropdown';
import { GoogleGenAI, Modality } from "@google/genai";


const HistoryPage: React.FC = () => {
    const { 
        currentUser,
        promptHistory, 
        imageHistory, 
        clearHistory, 
        reuseHistoryItem, 
        deleteImageHistoryItem, 
        setAppView, 
        addImageHistoryItem,
        globalVoteData,
        userVotes,
        handleVote,
        publishImage,
        publishedImages,
        toggleFavorite,
        favorites,
    } = useContext(AuthContext);
    const { t } = useTranslation();
    const [copiedHistoryId, setCopiedHistoryId] = useState<string | null>(null);
    const [showClearConfirmModal, setShowClearConfirmModal] = useState<boolean>(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [showEnhanceUpscaleModal, setShowEnhanceUpscaleModal] = useState<'enhance' | 'upscale' | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [processingError, setProcessingError] = useState<string>('');

    const selectedImage = selectedImageIndex !== null ? imageHistory[selectedImageIndex] : null;
    const selectedImageVotes = selectedImage ? globalVoteData[selectedImage.id] : { likes: 0, dislikes: 0 };
    const selectedUserVote = selectedImage ? userVotes[selectedImage.id] : null;
    const isPublished = selectedImage ? publishedImages.some(p => p.id === selectedImage.id) : false;
    const isFavorite = selectedImage ? favorites.includes(selectedImage.id) : false;

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
        if (selectedImageIndex !== null && selectedImageIndex < imageHistory.length - 1) {
            setSelectedImageIndex(selectedImageIndex + 1);
            resetModalState();
        }
    }, [selectedImageIndex, imageHistory.length, resetModalState]);


    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (selectedImageIndex === null) return;

            if (event.key === 'ArrowLeft') {
                navigateToPreviousImage();
            } else if (event.key === 'ArrowRight') {
                navigateToNextImage();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedImageIndex, navigateToPreviousImage, navigateToNextImage]);

    const handleCopyHistoryItem = (item: HistoryItem) => {
        navigator.clipboard.writeText(item.prompt).then(() => {
            setCopiedHistoryId(item.id);
            setTimeout(() => setCopiedHistoryId(null), 2000);
        });
    };

    const handleConfirmClear = () => {
        clearHistory();
        setShowClearConfirmModal(false);
    };

    const openImageViewer = (index: number) => {
        setSelectedImageIndex(index);
        resetModalState();
    }

    const closeImageViewer = () => {
        setSelectedImageIndex(null);
    };
    
    const handlePreviousImageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigateToPreviousImage();
    };

    const handleNextImageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigateToNextImage();
    };

    const handleDownloadImage = () => {
        if (!selectedImage) return;
        const a = document.createElement('a');
        a.href = selectedImage.imageUrl;
        a.download = `cinematic-prompt-${selectedImage.id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    
    const handleDeleteImage = () => {
        if (!selectedImage) return;
        deleteImageHistoryItem(selectedImage.id);
        closeImageViewer(); // Close modal after deleting to avoid index issues
    };

    const handleGenerateVariant = async () => {
        if (selectedImageIndex === null || !selectedImage) return;

        setIsProcessing(true);
        setProcessingError('');
        setShowEnhanceUpscaleModal(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: selectedImage.prompt }] },
                config: { responseModalities: [Modality.IMAGE] },
            });

            let foundImage = false;
            if (response?.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const base64ImageBytes = part.inlineData.data;
                        const newImageUrl = `data:image/png;base64,${base64ImageBytes}`;
                        
                        const newImageItem: ImageHistoryItem = {
                            id: Date.now().toString(),
                            imageUrl: newImageUrl,
                            prompt: selectedImage.prompt,
                        };
                        addImageHistoryItem(newImageItem);
                        setSelectedImageIndex(0); // The new image is added to the start of the history
                        foundImage = true;
                        break;
                    }
                }
            }
            if (!foundImage) throw new Error("The API did not return a valid image.");

        } catch (e) {
            console.error("Failed to generate variant", e);
            setProcessingError(t('generator_image_error'));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEnhanceOrUpscale = async (type: 'enhance' | 'upscale', level: '2x' | '4x') => {
        if (selectedImageIndex === null || !selectedImage) return;

        setShowEnhanceUpscaleModal(null);
        setIsProcessing(true);
        setProcessingError('');
        
        let newPrompt = '';
        if (type === 'enhance') {
            newPrompt = level === '2x' 
                ? t('ai_prompt_enhance_2x')
                : t('ai_prompt_enhance_4x');
        } else { // upscale
            newPrompt = level === '2x'
                ? t('ai_prompt_upscale_2x')
                : t('ai_prompt_upscale_4x');
        }
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const base64ImageData = selectedImage.imageUrl.split(',')[1];
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { inlineData: { data: base64ImageData, mimeType: 'image/png' } },
                        { text: newPrompt },
                    ]
                },
                config: { responseModalities: [Modality.IMAGE] },
            });

            let foundImage = false;
            if (response?.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const base64ImageBytes = part.inlineData.data;
                        const newImageUrl = `data:image/png;base64,${base64ImageBytes}`;
                        
                        const newImageItem = {
                            id: Date.now().toString(),
                            imageUrl: newImageUrl,
                            prompt: selectedImage.prompt,
                        };
                        addImageHistoryItem(newImageItem);
                        setSelectedImageIndex(0); // New image is added to the start
                        foundImage = true;
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


    return (
         <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-bg-gradient-from))] to-[rgb(var(--color-bg-gradient-to))] text-[rgb(var(--color-text-primary))]">
            
            {/* --- FIXED HEADER --- */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[rgba(var(--color-bg-panel),0.7)] backdrop-blur-xl border-b border-[rgba(var(--color-border),0.5)] shadow-md">
                <div className="max-w-4xl mx-auto flex justify-between items-center p-4">
                    <button onClick={() => setAppView('landing')} className="text-left">
                        <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--color-primary-500))] to-purple-600">
                            {t('header_title')}
                        </h1>
                        <p className="text-xs text-[rgb(var(--color-text-secondary))] hidden sm:flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1.5"/>
                            {t('header_history_subtitle')}
                        </p>
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

            {/* --- SCROLLABLE CONTENT --- */}
            <div className="p-4 sm:p-6 lg:p-8 pt-28">
                <div className="max-w-4xl mx-auto">
                    
                    <main>
                         <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-6 border-b border-[rgb(var(--color-border))] pb-2">
                            {t('history_prompts_title')}
                        </h2>
                        {promptHistory.length > 0 ? (
                            <div className="space-y-4">
                            {promptHistory.map((item) => (
                                <div key={item.id} className="bg-[rgba(var(--color-bg-panel),0.5)] border border-[rgba(var(--color-border),0.5)] rounded-lg p-4 transition-all hover:border-[rgb(var(--color-primary-500))]">
                                <p className="text-sm text-[rgb(var(--color-text-secondary))] font-mono whitespace-pre-wrap mb-3">{item.prompt}</p>
                                <div className="flex items-center gap-2">
                                    <button 
                                    onClick={() => handleCopyHistoryItem(item)}
                                    className="inline-flex items-center px-3 py-1.5 border border-[rgb(var(--color-border))] text-xs font-medium rounded-md text-[rgb(var(--color-text-secondary))] bg-[rgba(var(--color-bg-panel),0.6)] hover:bg-[rgba(var(--color-bg-panel),0.8)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-gray-500 transition-colors"
                                    >
                                    {copiedHistoryId === item.id ? <CheckIcon className="w-4 h-4 mr-1.5 text-green-500"/> : <ClipboardIcon className="w-4 h-4 mr-1.5"/>}
                                    {copiedHistoryId === item.id ? t('btn_copied') : t('btn_copy')}
                                    </button>
                                    <button 
                                    onClick={() => reuseHistoryItem(item)}
                                    className="inline-flex items-center px-3 py-1.5 border border-[rgb(var(--color-primary-500))] text-xs font-medium rounded-md text-[rgb(var(--color-primary-300))] bg-[rgba(var(--color-primary-950),0.4)] hover:bg-[rgba(var(--color-primary-900),0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-[rgb(var(--color-primary-500))] transition-colors"
                                    >
                                    <ArrowPathIcon className="w-4 h-4 mr-1.5"/>
                                    {t('btn_reuse')}
                                    </button>
                                </div>
                                </div>
                            ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-[rgba(var(--color-bg-panel),0.5)] border border-dashed border-[rgba(var(--color-border),0.5)] rounded-lg">
                               <ClockIcon className="mx-auto h-12 w-12 text-[rgb(var(--color-text-secondary))]" />
                               <h3 className="mt-2 text-lg font-medium text-[rgb(var(--color-text-primary))]">{t('history_no_prompts_title')}</h3>
                               <p className="mt-1 text-sm text-[rgb(var(--color-text-secondary))]">{t('history_no_prompts_desc')}</p>
                            </div>
                        )}
                        

                        <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mt-12 mb-6 border-b border-[rgb(var(--color-border))] pb-2">
                            {t('history_images_title')}
                        </h2>
                        {imageHistory.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {imageHistory.map((item, index) => (
                                    <div key={item.id} className="group relative aspect-square cursor-pointer" onClick={() => openImageViewer(index)}>
                                        <img src={item.imageUrl} alt="Generated history image" className="w-full h-full object-cover rounded-lg shadow-md" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                            <p className="text-white text-sm font-semibold">{t('btn_view')} Image</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-[rgba(var(--color-bg-panel),0.5)] border border-dashed border-[rgba(var(--color-border),0.5)] rounded-lg">
                                <ClockIcon className="mx-auto h-12 w-12 text-[rgb(var(--color-text-secondary))]" />
                                <h3 className="mt-2 text-lg font-medium text-[rgb(var(--color-text-primary))]">{t('history_no_images_title')}</h3>
                                <p className="mt-1 text-sm text-[rgb(var(--color-text-secondary))]">{t('history_no_images_desc')}</p>
                            </div>
                        )}

                        
                        <div className="flex justify-between items-center mt-12">
                            <button
                                onClick={() => setAppView('generator')}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[rgb(var(--color-primary-600))] hover:bg-[rgb(var(--color-primary-700))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-[rgb(var(--color-primary-500))] transition-colors"
                            >
                                <ArrowLeftIcon className="w-5 h-5 mr-2 -ml-1" />
                                {t('btn_back_to_generator')}
                            </button>

                            <button 
                                onClick={() => setShowClearConfirmModal(true)}
                                disabled={promptHistory.length === 0 && imageHistory.length === 0}
                                className="inline-flex items-center px-4 py-2 border border-red-500/50 text-sm font-medium rounded-md text-red-400 bg-red-950/40 hover:bg-red-900/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <TrashIcon className="w-4 h-4 mr-2"/>
                                {t('btn_clear_all_history')}
                            </button>
                        </div>
                    </main>
                </div>
            </div>

            {/* --- IMAGE VIEWER MODAL --- */}
            {selectedImage && !isFullscreen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={closeImageViewer}>
                    <div className="relative w-full max-w-2xl bg-[rgb(var(--color-bg-panel))] border border-[rgb(var(--color-border))] rounded-xl shadow-lg p-4 flex flex-col" onClick={(e) => { e.stopPropagation(); if (showEnhanceUpscaleModal) setShowEnhanceUpscaleModal(null); }}>
                        <button
                            onClick={closeImageViewer}
                            className="absolute -top-3 -right-3 text-white/70 bg-[rgb(var(--color-bg-panel))] rounded-full p-1 hover:text-white transition-colors z-20"
                            aria-label="Close image view"
                        >
                            <XMarkIcon className="w-8 h-8" />
                        </button>
                        <div className="relative aspect-square bg-black/20 rounded-lg flex items-center justify-center">
                            {isProcessing ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <svg className="animate-spin h-10 w-10 text-[rgb(var(--color-primary-400))]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="mt-4 text-sm text-[rgb(var(--color-text-secondary))]">{t('generator_variant_loading')}</p>
                                </div>
                            ) : processingError ? (
                                <div className="text-center p-4">
                                   <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                   <p className="text-red-400">{processingError}</p>
                                </div>
                            ) : (
                                <img src={selectedImage.imageUrl} alt="AI generated cinematic art from prompt" className="w-full h-full object-contain rounded-lg" />
                            )}
                             {imageHistory.length > 1 && (
                                <>
                                    <button 
                                        onClick={handlePreviousImageClick} 
                                        disabled={selectedImageIndex === 0 || isProcessing}
                                        className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/60 transition-colors disabled:opacity-20 disabled:cursor-not-allowed z-10"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeftIcon className="w-6 h-6" />
                                    </button>
                                    <button 
                                        onClick={handleNextImageClick} 
                                        disabled={selectedImageIndex === imageHistory.length - 1 || isProcessing}
                                        className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/60 transition-colors disabled:opacity-20 disabled:cursor-not-allowed z-10"
                                        aria-label="Next image"
                                    >
                                        <ChevronRightIcon className="w-6 h-6" />
                                    </button>
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
                                <button onClick={() => publishImage(selectedImage)} className={`inline-flex items-center justify-center gap-2 px-3 py-2 border text-sm font-medium rounded-md transition-colors ${isPublished ? 'border-green-500/50 text-green-400 bg-green-950/40' : 'border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] bg-[rgba(var(--color-bg-secondary),0.4)] hover:bg-[rgba(var(--color-bg-secondary),0.6)]'}`}>
                                    <CheckIcon className={`w-4 h-4 ${!isPublished && 'hidden'}`}/> {isPublished ? t('btn_unpublish') : t('btn_publish')}
                                </button>
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
                                <button onClick={handleDeleteImage} disabled={isProcessing} className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-red-500/50 text-sm font-medium rounded-md text-red-400 bg-red-950/40 hover:bg-red-900/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => setIsFullscreen(true)} disabled={isProcessing || !!processingError} className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-[rgb(var(--color-border))] text-sm font-medium rounded-md text-[rgb(var(--color-text-secondary))] bg-[rgba(var(--color-bg-panel),0.6)] hover:bg-[rgba(var(--color-bg-panel),0.8)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                    <ArrowsPointingOutIcon className="w-4 h-4" />
                                </button>
                                <button onClick={handleDownloadImage} disabled={isProcessing || !!processingError} className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[rgb(var(--color-primary-600))] hover:bg-[rgb(var(--color-primary-700))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-[rgb(var(--color-primary-500))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
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

            {/* --- FULLSCREEN OVERLAY --- */}
            {isFullscreen && selectedImage && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsFullscreen(false)}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                        aria-label="Close fullscreen view"
                    >
                        <XMarkIcon className="w-10 h-10" />
                    </button>
                    <img
                        src={selectedImage.imageUrl}
                        alt="Fullscreen view of AI generated cinematic art"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}


            {/* --- CLEAR HISTORY CONFIRMATION MODAL --- */}
            {showClearConfirmModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="clear-history-title">
                    <div
                        className="absolute inset-0"
                        onClick={() => setShowClearConfirmModal(false)}
                        aria-hidden="true"
                    ></div>
                    <div className="relative w-full max-w-md bg-[rgb(var(--color-bg-panel))] border border-[rgb(var(--color-border))] rounded-xl shadow-lg p-8">
                        <h2 id="clear-history-title" className="text-2xl font-bold text-center text-[rgb(var(--color-text-primary))]">{t('history_clear_modal_title')}</h2>
                        <p className="mt-2 text-center text-sm text-[rgb(var(--color-text-secondary))]">
                           {t('history_clear_modal_desc')}
                        </p>
                        <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
                            <button
                                onClick={handleConfirmClear}
                                className="w-full inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-red-500 transition"
                            >
                                {t('btn_yes_clear_history')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowClearConfirmModal(false)}
                                className="w-full inline-flex items-center justify-center px-6 py-2.5 border border-[rgb(var(--color-border))] text-base font-medium rounded-md shadow-sm text-[rgb(var(--color-text-secondary))] bg-[rgba(var(--color-bg-panel),0.6)] hover:bg-[rgba(var(--color-bg-panel),0.8)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-gray-500 transition"
                            >
                                {t('btn_cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryPage;