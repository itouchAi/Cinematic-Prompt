import React, { useState, useCallback, useEffect, useContext } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { styles, cameras, lenses, lighting, postProduction, examples, communityGalleryItems, subjects, subCategories } from '../constants';
import type { Option, Example } from '../constants';
import { Selector, ResultDisplay, ShuffleIcon, XCircleIcon, SparklesIcon, LockClosedIcon, PaintBrushIcon, FilmIcon, DownloadIcon, ArrowPathIcon, ArrowsPointingOutIcon, XMarkIcon, ArrowUpOnSquareIcon, ToggleSwitch, HandThumbUpIcon, HandThumbDownIcon, HeartIcon, CheckIcon } from '../components/ui';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useTranslation } from '../context/LanguageContext';
import { AuthContext, HistoryItem, ImageHistoryItem, PublishedImage } from '../context/AuthContext';
import ProfileDropdown from '../components/ProfileDropdown';
import CommunityGallery from '../components/CommunityGallery';


const generatePromptFromExample = (example: Example): string => {
    return `A hyper-realistic, ultra-detailed cinematic shot of ${example.scene.trim()}.
Style: ${example.style}.
Shot on: ${example.camera} with a ${example.lens}.
Lighting: ${example.light}.
Post-production: ${example.postProd}.
8k, masterpiece, photorealistic, high quality.`;
};

const getRandomOption = (options: Option[]): string => {
  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex].value;
};

const PromptGenerator: React.FC = () => {
  const { 
    currentUser, 
    addHistoryItem,
    addImageHistoryItem,
    itemToReuse, 
    clearItemToReuse, 
    useCredit, 
    setAppView,
    globalVoteData,
    userVotes,
    handleVote,
    publishImage,
    publishedImages,
    toggleFavorite,
    favorites,
  } = useContext(AuthContext);
  const { t } = useTranslation();

  const [style, setStyle] = useState<string>(styles[0].value);
  const [camera, setCamera] = useState<string>(cameras[0].value);
  const [lens, setLens] = useState<string>(lenses[0].value);
  const [light, setLight] = useState<string>(lighting[0].value);
  const [postProd, setPostProd] = useState<string>(postProduction[0].value);
  const [scene, setScene] = useState<string>('');
  const [subjectOne, setSubjectOne] = useState<string>('random');
  const [subCategoryOne, setSubCategoryOne] = useState<string>('random');
  const [subjectTwo, setSubjectTwo] = useState<string>('random');
  const [subCategoryTwo, setSubCategoryTwo] = useState<string>('random');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const [isEnhancedScene, setIsEnhancedScene] = useState<boolean>(false);
  const [originalScene, setOriginalScene] = useState<string>('');
  const [isEnhancingScene, setIsEnhancingScene] = useState<boolean>(false);
  
  const [aiInspiration, setAiInspiration] = useState<Example | null>(null);
  const [isGeneratingInspiration, setIsGeneratingInspiration] = useState<boolean>(false);
  const [inspirationError, setInspirationError] = useState<string>('');

  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [isGeneratingVariant, setIsGeneratingVariant] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<ImageHistoryItem | null>(null);
  const [imageError, setImageError] = useState<string>('');
  
  const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string>('');
  const [videoMessage, setVideoMessage] = useState<string>('');
  
  const [showGenerationModal, setShowGenerationModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showEnhanceUpscaleModal, setShowEnhanceUpscaleModal] = useState<'enhance' | 'upscale' | null>(null);

  useEffect(() => {
    if (subjectOne === 'random') {
      setSubjectTwo('random');
    }
  }, [subjectOne]);

  useEffect(() => {
    setSubCategoryOne('random');
  }, [subjectOne]);

  useEffect(() => {
    setSubCategoryTwo('random');
  }, [subjectTwo]);


  // Handle re-using a prompt from the history page
  useEffect(() => {
    if (itemToReuse) {
      setStyle(itemToReuse.style);
      setCamera(itemToReuse.camera);
      setLens(itemToReuse.lens);
      setLight(itemToReuse.light);
      setPostProd(itemToReuse.postProd);
      setScene(itemToReuse.scene);
      setGeneratedPrompt(itemToReuse.prompt);
      setGeneratedImage(null);
      setGeneratedVideoUrl(null);
      setIsEnhancedScene(false);
      clearItemToReuse(); // Clear it after using it
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [itemToReuse, clearItemToReuse]);

  const resetGenerationModalState = () => {
    setIsGeneratingImage(false);
    setIsGeneratingVariant(false);
    setGeneratedImage(null);
    setImageError('');
    setIsGeneratingVideo(false);
    setGeneratedVideoUrl(null);
    setVideoError('');
    setVideoMessage('');
    setShowEnhanceUpscaleModal(null);
  };

  const closeModal = () => {
    setShowGenerationModal(false);
    setIsFullscreen(false);
    // Delay reset to allow for closing animation
    setTimeout(resetGenerationModalState, 300);
  };

  const handleGeneratePrompt = useCallback(() => {
    if (!scene.trim()) {
      setError(t('generator_error_scene_required'));
      return;
    }
    if (currentUser && !currentUser.isSubscribed && currentUser.promptCredits <= 0) {
      setAppView('subscription');
      return;
    }

    setError('');
    setIsLoading(true);
    setGeneratedImage(null);
    setGeneratedVideoUrl(null);
    
    setTimeout(() => {
      const prompt = `A hyper-realistic, ultra-detailed cinematic shot of ${scene.trim()}.
Style: ${style}.
Shot on: ${camera} with a ${lens}.
Lighting: ${light}.
Post-production: ${postProd}.
8k, masterpiece, photorealistic, high quality.`;
      
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        prompt,
        scene,
        style,
        camera,
        lens,
        light,
        postProd,
      };

      addHistoryItem(newHistoryItem);
      useCredit();
      setGeneratedPrompt(prompt);
      setIsLoading(false);
    }, 500);
  }, [scene, style, camera, lens, light, postProd, currentUser, addHistoryItem, useCredit, setAppView, t]);
  
  const handleGenerateImage = async (isVariant = false, prompt = generatedPrompt) => {
    if (!prompt) {
        setImageError("Please generate a prompt first.");
        return;
    }

    if(isVariant) {
      setIsGeneratingVariant(true);
    } else {
      setIsGeneratingImage(true);
    }
    
    setGeneratedImage(null);
    setGeneratedVideoUrl(null);
    setImageError('');
    setVideoError('');
    setShowGenerationModal(true); 

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: { responseModalities: [Modality.IMAGE] },
        });

        let foundImage = false;
        if (response?.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes = part.inlineData.data;
                    const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                    const newImageId = Date.now().toString();
                    
                    const newImage: ImageHistoryItem = {
                        id: newImageId,
                        imageUrl,
                        prompt,
                    };

                    setGeneratedImage(newImage);
                    addImageHistoryItem(newImage);
                    foundImage = true;
                    break;
                }
            }
        }
        if (!foundImage) throw new Error("The API did not return a valid image.");
    } catch (e) {
        console.error("Failed to generate image", e);
        setImageError(t('generator_image_error'));
        setGeneratedImage(null);
    } finally {
        setIsGeneratingImage(false);
        setIsGeneratingVariant(false);
    }
  };
  
    const handleEnhanceOrUpscale = async (type: 'enhance' | 'upscale', level: '2x' | '4x') => {
        if (!generatedImage) return;

        setShowEnhanceUpscaleModal(null);
        setIsGeneratingVariant(true); // Reuse the variant loading state
        setImageError('');
        
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
            const base64ImageData = generatedImage.imageUrl.split(',')[1];
            
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
                        const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                        const newImage: ImageHistoryItem = {
                            id: Date.now().toString(),
                            imageUrl,
                            prompt: generatedPrompt, 
                        };
                        setGeneratedImage(newImage);
                        addImageHistoryItem(newImage);
                        foundImage = true;
                        break;
                    }
                }
            }
            if (!foundImage) throw new Error("The API did not return a valid image.");

        } catch (e) {
            console.error("Failed to process image", e);
            setImageError(t('generator_image_error'));
        } finally {
            setIsGeneratingVariant(false);
        }
    };

    const handleGenerateVideo = async () => {
        if (!generatedImage || !generatedPrompt) return;

        try {
            const hasApiKey = await window.aistudio.hasSelectedApiKey();
            if (!hasApiKey) {
                await window.aistudio.openSelectKey();
            }
        } catch (e) {
            console.error('API key selection failed', e);
            setVideoError('API key selection is required for video generation.');
            return;
        }

        setIsGeneratingVideo(true);
        setVideoError('');
        setGeneratedVideoUrl(null);
        setVideoMessage('Initializing video generation...');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const base64ImageData = generatedImage.imageUrl.split(',')[1];

            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: generatedPrompt,
                image: { imageBytes: base64ImageData, mimeType: 'image/png' },
                config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
            });

            setVideoMessage('Processing frames... this may take a few minutes.');
            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }
            
            setVideoMessage('Finalizing video... almost there!');
            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (!downloadLink) throw new Error("Video generation succeeded but no download link was provided.");
            
            const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
            if (!videoResponse.ok) throw new Error(`Failed to fetch video file: ${videoResponse.statusText}`);

            const videoBlob = await videoResponse.blob();
            const videoUrl = URL.createObjectURL(videoBlob);
            setGeneratedVideoUrl(videoUrl);
            setGeneratedImage(null); // Hide the image to show the video

        } catch (e: any) {
            console.error("Failed to generate video", e);
            const errorMessage = e.message.includes("Requested entity was not found")
                ? "Video generation failed. Please try selecting your API key again."
                : t('generator_video_error');
            setVideoError(errorMessage);
        } finally {
            setIsGeneratingVideo(false);
            setVideoMessage('');
        }
    };
    
    const handleDownload = () => {
        const link = document.createElement('a');
        if (generatedVideoUrl) {
            link.href = generatedVideoUrl;
            link.download = `cinematic-video-${Date.now()}.mp4`;
        } else if (generatedImage) {
            link.href = generatedImage.imageUrl;
            link.download = `cinematic-image-${Date.now()}.png`;
        } else {
            return;
        }
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

  const handleUseExample = (example: Example) => {
    setStyle(example.style);
    setCamera(example.camera);
    setLens(example.lens);
    setLight(example.light);
    setPostProd(example.postProd);
    setScene(example.scene);
    setGeneratedImage(null);
    setGeneratedVideoUrl(null);
    setIsEnhancedScene(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUseCommunityPrompt = (item: PublishedImage) => {
    const promptText = item.prompt;
    
    const normalizedPrompt = promptText.replace(/\n/g, '. ');

    let scene = '';
    let styleVal = styles[0].value;
    let cameraVal = cameras[0].value;
    let lensVal = '';
    let lightVal = lighting[0].value;
    let postProdVal = postProduction[0].value;

    const styleMatch = /Style: (.*?)(?=\. Shot on:|\. Lighting:|\. Post-production:|$)/.exec(normalizedPrompt);
    const shotOnMatch = /Shot on: (.*?)(?=\. Style:|\. Lighting:|\. Post-production:|$)/.exec(normalizedPrompt);
    const lightMatch = /Lighting: (.*?)(?=\. Style:|\. Shot on:|\. Post-production:|$)/.exec(normalizedPrompt);
    const postProdMatch = /Post-production: (.*?)(?=\. Style:|\. Shot on:|\. Lighting:|$)/.exec(normalizedPrompt);
    
    let sceneEndIndex = normalizedPrompt.length;
    if (styleMatch) sceneEndIndex = Math.min(sceneEndIndex, styleMatch.index);
    if (shotOnMatch) sceneEndIndex = Math.min(sceneEndIndex, shotOnMatch.index);
    if (lightMatch) sceneEndIndex = Math.min(sceneEndIndex, lightMatch.index);
    if (postProdMatch) sceneEndIndex = Math.min(sceneEndIndex, postProdMatch.index);

    scene = normalizedPrompt.substring(0, sceneEndIndex).replace('A hyper-realistic, ultra-detailed cinematic shot of ', '').trim().replace(/\.$/, '');

    if (styleMatch) styleVal = styleMatch[1].trim();
    if (shotOnMatch) {
        const shotOn = shotOnMatch[1].trim();
        if (shotOn.includes(' with a ')) {
            [cameraVal, lensVal] = shotOn.split(' with a ').map(s => s.trim());
        } else {
            cameraVal = shotOn;
        }
    }
    if (lightMatch) lightVal = lightMatch[1].trim();
    if (postProdMatch) postProdVal = postProdMatch[1].trim();

    setScene(scene);
    setStyle(styleVal);
    setCamera(cameraVal);
    setLens(lensVal);
    setLight(lightVal);
    setPostProd(postProdVal);
    setGeneratedPrompt(''); // Clear old prompt
    setGeneratedImage(null);
    setGeneratedVideoUrl(null);
    setIsEnhancedScene(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
};


  const handleRandomizeAll = useCallback(() => {
    setStyle(getRandomOption(styles));
    setCamera(getRandomOption(cameras));
    setLens(getRandomOption(lenses));
    setLight(getRandomOption(lighting));
    setPostProd(getRandomOption(postProduction));
  }, []);
  
  const handleClearAll = useCallback(() => {
    setStyle(styles[0].value);
    setCamera(cameras[0].value);
    setLens(lenses[0].value);
    setLight(lighting[0].value);
    setPostProd(postProduction[0].value);
    setScene('');
    setGeneratedPrompt('');
    setError('');
    setGeneratedImage(null);
    setGeneratedVideoUrl(null);
    setImageError('');
    setShowGenerationModal(false);
    setIsFullscreen(false);
    setIsEnhancedScene(false);
    setOriginalScene('');
  }, []);

  const handleGenerateAIInspiration = async () => {
    if (!currentUser?.isSubscribed) {
      setAppView('subscription');
      return;
    };
    
    setIsGeneratingInspiration(true);
    setInspirationError('');
    setAiInspiration(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let prompt: string;

      const buildSubjectString = (subject: string, subCategory: string): string => {
        if (subject === 'random') return t('ai_prompt_random_topic');
        
        const subjectLabel = t(subjects.find(s => s.value === subject)?.label || subject);
        
        if (subCategory !== 'random' && subCategories[subject]) {
            const subCategoryLabel = t(subCategories[subject].find(sc => sc.value === subCategory)?.label || subCategory);
            return `${subCategoryLabel} ${subjectLabel}`;
        }
        
        return subjectLabel;
      };

      const finalSubjectOne = buildSubjectString(subjectOne, subCategoryOne);

      if (subjectOne !== 'random' && subjectTwo !== 'random') {
          const finalSubjectTwo = buildSubjectString(subjectTwo, subCategoryTwo);
          prompt = t('ai_prompt_dual_subject', finalSubjectOne, finalSubjectTwo);
      } else {
          prompt = t('ai_prompt_single_subject', finalSubjectOne);
      }
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const sceneDescription = response.text.trim();

      if (!sceneDescription) {
        throw new Error("Received an empty response from the AI.");
      }

      const newInspiration: Example = {
        title: 'AI-Generated Idea',
        scene: sceneDescription,
        style: getRandomOption(styles),
        camera: getRandomOption(cameras),
        lens: getRandomOption(lenses),
        light: getRandomOption(lighting),
        postProd: getRandomOption(postProduction),
      };

      setAiInspiration(newInspiration);

    } catch (e) {
      console.error("Failed to generate AI inspiration", e);
      setInspirationError(t('generator_inspiration_error'));
    } finally {
      setIsGeneratingInspiration(false);
    }
  };

  const handleToggleEnhance = async () => {
    if (isEnhancingScene) return;

    if (isEnhancedScene) { // Turning it OFF
        setIsEnhancedScene(false);
        setScene(originalScene);
    } else { // Turning it ON
        if (!scene.trim()) {
            setError(t('generator_error_scene_for_enhance'));
            return;
        }
        setError('');
        setIsEnhancingScene(true);
        setOriginalScene(scene); // Save the original scene
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = t('ai_prompt_enhance_scene', scene);
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            
            const enhancedText = response.text.trim();
            if (!enhancedText) {
                throw new Error("Received an empty response from the AI.");
            }
            setScene(enhancedText);
            setIsEnhancedScene(true);
        } catch (e) {
            console.error("Failed to enhance scene", e);
            setError(t('generator_error_enhance_failed'));
            setScene(originalScene); // Revert on failure
        } finally {
            setIsEnhancingScene(false);
        }
    }
  };


  const hasCredits = currentUser?.isSubscribed || (currentUser?.promptCredits ?? 0) > 0;
  const creditsLeft = currentUser?.isSubscribed ? t('generator_credits_unlimited') : t('generator_credits_left', currentUser?.promptCredits ?? 0);
  const isSubscribed = currentUser?.isSubscribed ?? false;
  
  const currentImageVotes = generatedImage ? globalVoteData[generatedImage.id] : { likes: 0, dislikes: 0 };
  const currentUserVote = generatedImage ? userVotes[generatedImage.id] : null;
  const isPublished = generatedImage ? publishedImages.some(p => p.id === generatedImage.id) : false;
  const isFavorite = generatedImage ? favorites.includes(generatedImage.id) : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-bg-gradient-from))] to-[rgb(var(--color-bg-gradient-to))] text-[rgb(var(--color-text-primary))]">
      
      {/* --- FIXED HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[rgba(var(--color-bg-panel),0.7)] backdrop-blur-xl border-b border-[rgba(var(--color-border),0.5)] shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center p-4">
          <button onClick={() => setAppView('landing')} className="text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--color-primary-500))] to-purple-600">
              {t('header_title')}
            </h1>
            <p className="text-xs text-[rgb(var(--color-text-secondary))] hidden sm:block">{t('header_subtitle')}</p>
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
          
          {/* --- Placeholder for Banner/Image --- */}
          <div className="h-40 bg-[rgba(var(--color-bg-panel),0.3)] border-2 border-dashed border-[rgba(var(--color-border),0.5)] rounded-lg flex items-center justify-center mb-6">
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">{t('generator_banner_placeholder')}</p>
          </div>

          <main className="bg-[rgba(var(--color-bg-panel),0.5)] backdrop-blur-sm border border-[rgba(var(--color-border),0.5)] p-6 sm:p-8 rounded-xl shadow-lg shadow-[rgba(var(--color-primary-950),0.2)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Selector label={t('label_style')} options={styles} selected={style} onSelect={setStyle} />
              <Selector label={t('label_camera')} options={cameras} selected={camera} onSelect={setCamera} />
              <Selector label={t('label_lens')} options={lenses} selected={lens} onSelect={setLens} />
              <Selector label={t('label_lighting')} options={lighting} selected={light} onSelect={setLight} />
              <Selector label={t('label_post_production')} options={postProduction} selected={postProd} onSelect={setPostProd} />
            </div>

            <div className="mt-8">
                <div className="relative">
                    <label htmlFor="scene" className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                        {t('label_scene_description')}
                    </label>
                    <textarea
                        id="scene"
                        rows={isEnhancedScene ? 8 : 4}
                        value={scene}
                        onChange={(e) => {
                           setScene(e.target.value);
                            if (isEnhancedScene) {
                                setIsEnhancedScene(false);
                                setOriginalScene(e.target.value);
                            }
                            if (error) setError('');
                        }}
                        className="w-full bg-[rgba(var(--color-bg-secondary),0.3)] border border-[rgb(var(--color-border))] rounded-md shadow-sm p-3 pr-16 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary-500))] focus:border-[rgb(var(--color-primary-500))] sm:text-sm text-[rgb(var(--color-text-primary))] placeholder-[rgb(var(--color-text-secondary))] transition-all duration-300"
                        placeholder={t('placeholder_scene')}
                    />
                     <div className="absolute bottom-3 right-3">
                        <ToggleSwitch 
                            enabled={isEnhancedScene}
                            onChange={handleToggleEnhance}
                            loading={isEnhancingScene}
                            onLabel={t('tooltip_enhance_scene_on')}
                            offLabel={t('tooltip_enhance_scene_off')}
                        />
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4">
               <button
                  onClick={handleClearAll}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-[rgb(var(--color-border))] text-base font-medium rounded-md shadow-md text-[rgb(var(--color-text-secondary))] bg-[rgba(var(--color-bg-panel),0.6)] hover:bg-[rgba(var(--color-bg-panel),0.8)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-gray-500 transition-all duration-300 transform hover:scale-105"
              >
                  <XCircleIcon className="h-5 w-5 mr-2" />
                  {t('btn_clear_all')}
              </button>
              <button
                  onClick={handleRandomizeAll}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-[rgb(var(--color-primary-500))] text-base font-medium rounded-md shadow-md text-[rgb(var(--color-primary-400))] bg-[rgba(var(--color-primary-950),0.4)] hover:bg-[rgba(var(--color-primary-900),0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-[rgb(var(--color-primary-500))] transition-all duration-300 transform hover:scale-105"
              >
                  <ShuffleIcon className="h-5 w-5 mr-2" />
                  {t('btn_randomize_all')}
              </button>
               <div className="relative w-full sm:w-auto">
                  <button
                  onClick={handleGeneratePrompt}
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center px-12 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-[rgb(var(--color-primary-600))] hover:bg-[rgb(var(--color-primary-700))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-[rgb(var(--color-primary-500))] disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                  >
                  {isLoading ? (
                      <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('btn_generating')}
                      </>
                  ) : hasCredits ? (
                      t('btn_generate_prompt')
                  ) : (
                      t('btn_upgrade_for_more')
                  )}
                  </button>
                  {!isLoading && (
                      <span className="absolute -top-2 -right-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[rgb(var(--color-primary-500))] text-white shadow-md">
                          {creditsLeft}
                      </span>
                  )}
              </div>
               <button
                    onClick={() => handleGenerateImage(false)}
                    disabled={!generatedPrompt || isLoading || isGeneratingImage}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-md text-white bg-[rgb(var(--color-primary-500))] hover:bg-[rgb(var(--color-primary-600))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-[rgb(var(--color-primary-400))] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                >
                    <PaintBrushIcon className="h-5 w-5 mr-2" />
                    {isGeneratingImage ? t('btn_creating') : t('btn_generate_image')}
                </button>
            </div>
            
            {generatedPrompt && <ResultDisplay 
              prompt={generatedPrompt} 
              copyBtnLabel={t('btn_copy')} 
              copiedBtnLabel={t('btn_copied')}
              jsonFormatBtnLabel={t('btn_json_format')}
              textFormatBtnLabel={t('btn_text_format')}
            />}
          </main>
          
          <section className="mt-16">
            <h2 className="text-3xl font-bold text-center text-[rgb(var(--color-text-primary))] mb-8">{t('generator_inspiration_gallery_title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[rgba(var(--color-bg-panel),0.4)] border border-dashed border-[rgb(var(--color-primary-500),0.6)] rounded-lg p-6 flex flex-col justify-between">
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-4">
                        <Selector label={t('label_subject1')} options={subjects.map(s => ({...s, label: t(s.label)}))} selected={subjectOne} onSelect={setSubjectOne} />
                        {subjectOne !== 'random' && (
                            <div className="animate-fade-in">
                                <Selector label={t('label_subcategory1')} options={(subCategories[subjectOne] || []).map(s => ({...s, label: t(s.label)}))} selected={subCategoryOne} onSelect={setSubCategoryOne} />
                            </div>
                        )}
                    </div>
                    <div className={`space-y-4 ${subjectOne === 'random' ? 'opacity-50' : ''}`}>
                        <Selector label={t('label_subject2')} options={subjects.map(s => ({...s, label: t(s.label)}))} selected={subjectTwo} onSelect={setSubjectTwo} disabled={subjectOne === 'random'} />
                        {subjectOne !== 'random' && subjectTwo !== 'random' && (
                             <div className="animate-fade-in">
                                <Selector label={t('label_subcategory2')} options={(subCategories[subjectTwo] || []).map(s => ({...s, label: t(s.label)}))} selected={subCategoryTwo} onSelect={setSubCategoryTwo} />
                            </div>
                        )}
                    </div>
                  </div>
                  {isGeneratingInspiration ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[150px]">
                      <svg className="animate-spin h-8 w-8 text-[rgb(var(--color-primary-400))]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="mt-3 text-sm text-[rgb(var(--color-text-secondary))]">{t('generator_inspiration_loading')}</p>
                    </div>
                  ) : aiInspiration && isSubscribed ? (
                    <>
                      <h3 className="font-bold text-lg text-[rgb(var(--color-primary-400))] mb-2">{aiInspiration.title}</h3>
                      <p className="text-sm text-[rgb(var(--color-text-secondary))] font-mono whitespace-pre-wrap">
                        {generatePromptFromExample(aiInspiration)}
                      </p>
                    </>
                  ) : (
                    <div className="text-center">
                      <SparklesIcon className="w-10 h-10 text-[rgb(var(--color-primary-500))] mb-4 mx-auto" />
                      <h3 className="font-bold text-lg text-[rgb(var(--color-text-primary))] mb-2">{t('generator_inspiration_feeling_stuck')}</h3>
                      <p className="text-sm text-[rgb(var(--color-text-secondary))]">{t('generator_inspiration_description')}</p>
                    </div>
                  )}
                  {inspirationError && <p className="text-red-500 text-sm mt-2 text-center">{inspirationError}</p>}
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  {aiInspiration && isSubscribed && (
                    <button 
                      onClick={() => handleUseExample(aiInspiration)} 
                      className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[rgb(var(--color-primary-600))] hover:bg-[rgb(var(--color-primary-700))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-[rgb(var(--color-primary-500))] transition-all duration-200"
                    >
                      {t('btn_use_this_idea')}
                    </button>
                  )}
                   {isSubscribed ? (
                      <button 
                        onClick={handleGenerateAIInspiration} 
                        disabled={isGeneratingInspiration}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-[rgb(var(--color-primary-500))] text-sm font-medium rounded-md text-[rgb(var(--color-primary-300))] bg-[rgba(var(--color-primary-950),0.4)] hover:bg-[rgba(var(--color-primary-900),0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-[rgb(var(--color-primary-500))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <SparklesIcon className="w-4 h-4 mr-2" />
                        {isGeneratingInspiration ? t('btn_generating') : aiInspiration ? t('btn_generate_another') : t('btn_generate_idea')}
                      </button>
                    ) : (
                       <button 
                        onClick={() => setAppView('subscription')}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-[rgb(var(--color-primary-800))] text-sm font-medium rounded-md text-[rgb(var(--color-primary-300))] bg-[rgba(var(--color-primary-950),0.3)] hover:bg-[rgba(var(--color-primary-900),0.4)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-[rgb(var(--color-primary-500))] transition-colors"
                      >
                        <LockClosedIcon className="w-4 h-4 mr-2" />
                        {t('btn_unlock_with_pro')}
                      </button>
                    )}
                </div>
              </div>
              {examples.map((example, index) => (
                <div key={index} className="bg-[rgba(var(--color-bg-panel),0.5)] border border-[rgba(var(--color-border),0.5)] rounded-lg p-6 flex flex-col justify-between transition-all hover:border-[rgb(var(--color-primary-500))]">
                  <div>
                    <h3 className="font-bold text-lg text-[rgb(var(--color-primary-500))] mb-2">{example.title}</h3>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))] font-mono whitespace-pre-wrap">
                      {generatePromptFromExample(example)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUseExample(example)}
                    className="mt-4 w-full sm:w-auto self-start px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[rgb(var(--color-primary-600))] hover:bg-[rgb(var(--color-primary-700))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-[rgb(var(--color-primary-500))] transition-all duration-200"
                  >
                    {t('btn_use_this_example')}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <CommunityGallery onUsePrompt={handleUseCommunityPrompt} />

          <footer className="text-center mt-10 text-sm text-[rgb(var(--color-text-secondary))] opacity-60">
            <p>{t('generator_footer')}</p>
          </footer>
        </div>
      </div>

      {/* --- GENERATION MODAL --- */}
      {showGenerationModal && !isFullscreen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={closeModal}>
              <div className="relative w-full max-w-2xl bg-[rgb(var(--color-bg-panel))] border border-[rgb(var(--color-border))] rounded-xl shadow-lg p-4 flex flex-col" onClick={(e) => { e.stopPropagation(); if (showEnhanceUpscaleModal) setShowEnhanceUpscaleModal(null); }}>
                  <button onClick={closeModal} className="absolute -top-3 -right-3 text-white/70 bg-[rgb(var(--color-bg-panel))] rounded-full p-1 hover:text-white transition-colors z-10" aria-label="Close image view">
                      <XCircleIcon className="w-8 h-8" />
                  </button>
                  
                  <div className="aspect-video w-full flex-grow flex items-center justify-center bg-black/20 rounded-lg overflow-hidden">
                    {isGeneratingImage || isGeneratingVariant ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <svg className="animate-spin h-10 w-10 text-[rgb(var(--color-primary-400))]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-4 text-sm text-[rgb(var(--color-text-secondary))]">{isGeneratingVariant ? t('generator_variant_loading') : t('generator_image_loading')}</p>
                        </div>
                    ) : isGeneratingVideo ? (
                         <div className="flex flex-col items-center justify-center h-full text-center p-4">
                            <svg className="animate-spin h-10 w-10 text-[rgb(var(--color-primary-400))]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-4 text-lg font-semibold text-[rgb(var(--color-text-primary))]">{t('generator_video_loading_title')}</p>
                            <p className="mt-1 text-sm text-[rgb(var(--color-text-secondary))]">{videoMessage || 'Please wait...'}</p>
                        </div>
                    ) : generatedVideoUrl ? (
                        <video src={generatedVideoUrl} className="w-full h-full object-contain" controls autoPlay loop muted />
                    ) : generatedImage ? (
                        <img src={generatedImage.imageUrl} alt="AI generated cinematic art from prompt" className="w-full h-full object-contain" />
                    ) : imageError || videoError ? (
                        <div className="text-center p-4">
                           <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
                           <p className="text-red-400">{imageError || videoError}</p>
                        </div>
                    ) : null}
                  </div>
                  
                   {generatedImage && (
                    <div className="flex items-center justify-between gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleVote(generatedImage.id, 'like')}
                          aria-label={t('vote_like')}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${currentUserVote === 'like' ? 'bg-[rgba(var(--color-primary-500),0.3)] text-[rgb(var(--color-primary-300))]' : 'bg-transparent text-[rgb(var(--color-text-secondary))] hover:bg-[rgba(var(--color-bg-secondary),0.6)]'}`}
                        >
                          <HandThumbUpIcon className="w-5 h-5"/>
                          <span>{currentImageVotes?.likes ?? 0}</span>
                        </button>
                        <button 
                          onClick={() => handleVote(generatedImage.id, 'dislike')}
                          aria-label={t('vote_dislike')}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${currentUserVote === 'dislike' ? 'bg-red-500/20 text-red-400' : 'bg-transparent text-[rgb(var(--color-text-secondary))] hover:bg-[rgba(var(--color-bg-secondary),0.6)]'}`}
                        >
                           <HandThumbDownIcon className="w-5 h-5"/>
                           <span>{currentImageVotes?.dislikes ?? 0}</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                         <button onClick={() => publishImage(generatedImage)} className={`inline-flex items-center justify-center gap-2 px-3 py-2 border text-sm font-medium rounded-md transition-colors ${isPublished ? 'border-green-500/50 text-green-400 bg-green-950/40 cursor-default' : 'border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] bg-[rgba(var(--color-bg-secondary),0.4)] hover:bg-[rgba(var(--color-bg-secondary),0.6)]'}`}>
                            <CheckIcon className={`w-4 h-4 ${!isPublished && 'hidden'}`}/> {isPublished ? t('btn_published') : t('btn_publish')}
                         </button>
                         <button onClick={() => toggleFavorite(generatedImage.id)} aria-label={t('btn_favorite')} className="p-2 rounded-md bg-[rgba(var(--color-bg-secondary),0.4)] hover:bg-[rgba(var(--color-bg-secondary),0.6)] transition-colors">
                            <HeartIcon className={`w-5 h-5 ${isFavorite ? 'text-rose-500 fill-current' : 'text-[rgb(var(--color-text-secondary))]'}`}/>
                         </button>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 mt-4 border-t border-[rgb(var(--color-border))] flex flex-wrap justify-center items-center gap-2">
                      <button onClick={() => handleGenerateImage(true, generatedPrompt)} disabled={isGeneratingImage || isGeneratingVariant || isGeneratingVideo} className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-[rgb(var(--color-border))] text-sm font-medium rounded-md text-[rgb(var(--color-text-secondary))] bg-[rgba(var(--color-bg-secondary),0.4)] hover:bg-[rgba(var(--color-bg-secondary),0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                          <ArrowPathIcon className="w-4 h-4"/> {t('btn_generate_variant')}
                      </button>
                      <button onClick={() => setShowEnhanceUpscaleModal('enhance')} disabled={!generatedImage || isGeneratingImage || isGeneratingVariant || isGeneratingVideo} className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-[rgb(var(--color-border))] text-sm font-medium rounded-md text-[rgb(var(--color-text-secondary))] bg-[rgba(var(--color-bg-secondary),0.4)] hover:bg-[rgba(var(--color-bg-secondary),0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                          <SparklesIcon className="w-4 h-4"/> {t('btn_enhance')}
                      </button>
                      <button onClick={() => setShowEnhanceUpscaleModal('upscale')} disabled={!generatedImage || isGeneratingImage || isGeneratingVariant || isGeneratingVideo} className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-[rgb(var(--color-border))] text-sm font-medium rounded-md text-[rgb(var(--color-text-secondary))] bg-[rgba(var(--color-bg-secondary),0.4)] hover:bg-[rgba(var(--color-bg-secondary),0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                          <ArrowUpOnSquareIcon className="w-4 h-4"/> {t('btn_upscale')}
                      </button>
                       <button onClick={handleDownload} disabled={(!generatedImage && !generatedVideoUrl) || isGeneratingVideo || isGeneratingImage || isGeneratingVariant} className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-[rgb(var(--color-border))] text-sm font-medium rounded-md text-[rgb(var(--color-text-secondary))] bg-[rgba(var(--color-bg-secondary),0.4)] hover:bg-[rgba(var(--color-bg-secondary),0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                          <DownloadIcon className="w-4 h-4"/> {t('btn_download')}
                      </button>
                      <button onClick={() => setIsFullscreen(true)} disabled={(!generatedImage && !generatedVideoUrl) || isGeneratingVideo || isGeneratingImage || isGeneratingVariant} className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-[rgb(var(--color-border))] text-sm font-medium rounded-md text-[rgb(var(--color-text-secondary))] bg-[rgba(var(--color-bg-secondary),0.4)] hover:bg-[rgba(var(--color-bg-secondary),0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                          <ArrowsPointingOutIcon className="w-4 h-4"/> {t('btn_fullscreen')}
                      </button>
                      <button onClick={handleGenerateVideo} disabled={!generatedImage || isGeneratingVideo || isGeneratingImage || isGeneratingVariant} className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[rgb(var(--color-primary-600))] hover:bg-[rgb(var(--color-primary-700))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                          <FilmIcon className="w-4 h-4"/> {t('btn_generate_video')}
                      </button>
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
      {isFullscreen && generatedImage && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in">
              <button
                  onClick={() => setIsFullscreen(false)}
                  className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                  aria-label="Close fullscreen view"
              >
                  <XMarkIcon className="w-10 h-10" />
              </button>
              <img
                  src={generatedImage.imageUrl}
                  alt="Fullscreen view of AI generated cinematic art"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
          </div>
      )}
    </div>
  );
};

export default PromptGenerator;