import React, { useState, useCallback, useEffect, useContext, useRef } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { styles, cameras, lenses, lighting, postProduction, cameraAngles, cameraSettingsConfig, effects, examples, communityGalleryItems, subjects, subCategories, aspectRatios, imageCounts } from '../constants';
import type { Option, Example } from '../constants';
import { Selector, ResultDisplay, ShuffleIcon, XCircleIcon, SparklesIcon, LockClosedIcon, PaintBrushIcon, FilmIcon, DownloadIcon, ArrowPathIcon, ArrowsPointingOutIcon, XMarkIcon, ArrowUpOnSquareIcon, ToggleSwitch, HandThumbUpIcon, HandThumbDownIcon, HeartIcon, CheckIcon, BroomIcon, DiceIcon, TrashIcon, KeyboardIcon, PaletteIcon, PhotoIcon, ChevronLeftIcon, ChevronRightIcon, SpinnerIcon } from '../components/ui';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useTranslation } from '../context/LanguageContext';
import { AuthContext, HistoryItem, ImageHistoryItem, PublishedImage } from '../context/AuthContext';
import ProfileDropdown from '../components/ProfileDropdown';
import CommunityGallery from '../components/CommunityGallery';


const generatePromptFromExample = (example: Example): string => {
    const angleText = example.cameraAngle ? `\nCamera Angle: ${example.cameraAngle}.` : '';
    const modeText = example.cameraMode ? `\nMode: ${example.cameraMode}.` : '';
    const effectText = example.effect ? `\nEffect: ${example.effect}.` : '';
    return `A hyper-realistic, ultra-detailed cinematic shot of ${example.scene.trim()}.
Style: ${example.style}.${angleText}${modeText}${effectText}
Shot on: ${example.camera} with a ${example.lens}.
Lighting: ${example.light}.
Post-production: ${example.postProd}.
8k, masterpiece, photorealistic, high quality.`;
};

const getRandomOption = (options: Option[]): string => {
  // Filter out headers and empty values
  const selectableOptions = options.filter(opt => !opt.isHeader && opt.value !== '');
  if (selectableOptions.length === 0) return '';
  
  const randomIndex = Math.floor(Math.random() * selectableOptions.length);
  return selectableOptions[randomIndex].value;
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
  const [cameraAngle, setCameraAngle] = useState<string>(cameraAngles[0].value);
  const [cameraSettings, setCameraSettings] = useState<Record<string, string>>({});
  const [showCameraSettingsModal, setShowCameraSettingsModal] = useState<boolean>(false);
  const [effect, setEffect] = useState<string>(effects[0].value);
  const [aspectRatio, setAspectRatio] = useState<string>(aspectRatios[0].value);
  const [imageCount, setImageCount] = useState<string>(imageCounts[0].value);
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
  
  // State for batch generation navigation
  const [generatedBatch, setGeneratedBatch] = useState<ImageHistoryItem[]>([]);
  const [currentBatchIndex, setCurrentBatchIndex] = useState<number>(0);

  const [imageError, setImageError] = useState<string>('');
  
  const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string>('');
  const [videoMessage, setVideoMessage] = useState<string>('');
  
  const [showGenerationModal, setShowGenerationModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showEnhanceUpscaleModal, setShowEnhanceUpscaleModal] = useState<'enhance' | 'upscale' | null>(null);

  type AnimationState = 'default' | 'hover' | 'clicked';
  const [clearState, setClearState] = useState<AnimationState>('default');
  const [randomizeState, setRandomizeState] = useState<AnimationState>('default');
  const [generatePromptState, setGeneratePromptState] = useState<AnimationState>('default');
  const [generateImageState, setGenerateImageState] = useState<AnimationState>('default');
  const [describeState, setDescribeState] = useState<AnimationState>('default');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDescribing, setIsDescribing] = useState(false);
  const [describeMode, setDescribeMode] = useState<'describe' | 'create'>('describe');


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
      if (itemToReuse.cameraAngle) {
          setCameraAngle(itemToReuse.cameraAngle);
      }
      if (itemToReuse.cameraSettings) {
          setCameraSettings(itemToReuse.cameraSettings);
      } else {
          setCameraSettings({});
      }
      if (itemToReuse.effect) {
          setEffect(itemToReuse.effect);
      }
      setScene(itemToReuse.scene);
      setGeneratedPrompt(itemToReuse.prompt);
      setGeneratedImage(null);
      setGeneratedBatch([]);
      setCurrentBatchIndex(0);
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
    setGeneratedBatch([]);
    setCurrentBatchIndex(0);
    setImageError('');
    setIsGeneratingVideo(false);
    setGeneratedVideoUrl(null);
    setVideoError('');
    setVideoMessage('');
    setShowEnhanceUpscaleModal(null);
  };

  const closeModal = useCallback(() => {
    setShowGenerationModal(false);
    setIsFullscreen(false);
    // Delay reset to allow for closing animation
    setTimeout(resetGenerationModalState, 300);
  }, [resetGenerationModalState]);

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
    setGeneratedBatch([]);
    setCurrentBatchIndex(0);
    setGeneratedVideoUrl(null);
    
    setTimeout(() => {
      const anglePart = cameraAngle ? `\nCamera Angle: ${cameraAngle}.` : '';
      
      let modePart = '';
      const nonEmptySettings = Object.entries(cameraSettings).filter(([_, val]) => val !== '');
      if (nonEmptySettings.length > 0) {
          modePart = '\nCamera Mode:';
          // Use cameraSettingsConfig to get correct labels and order
          cameraSettingsConfig.forEach(config => {
              if (cameraSettings[config.id]) {
                  modePart += `\n${config.label}: ${cameraSettings[config.id]}`;
              }
          });
          modePart += '.';
      }

      const effectPart = effect ? `\nEffect: ${effect}.` : '';
      const prompt = `A hyper-realistic, ultra-detailed cinematic shot of ${scene.trim()}.
Style: ${style}.${anglePart}${modePart}${effectPart}
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
        cameraAngle,
        cameraSettings,
        effect,
      };

      addHistoryItem(newHistoryItem);
      useCredit();
      setGeneratedPrompt(prompt);
      setIsLoading(false);
    }, 500);
  }, [scene, style, camera, lens, light, postProd, cameraAngle, cameraSettings, effect, currentUser, addHistoryItem, useCredit, setAppView, t]);
  
    const handleGeneratePromptWithAnimation = useCallback(() => {
        setGeneratePromptState('clicked');
        handleGeneratePrompt();
        setTimeout(() => {
            setGeneratePromptState('default');
        }, 600);
    }, [handleGeneratePrompt]);
  
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
    setGeneratedBatch([]);
    setCurrentBatchIndex(0);
    setGeneratedVideoUrl(null);
    setImageError('');
    setVideoError('');
    setShowGenerationModal(true); 

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        let foundImage = false;
        
        // Initial generation with count
        const count = isVariant ? 1 : parseInt(imageCount);

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: count,
              outputMimeType: 'image/jpeg',
              aspectRatio: aspectRatio,
            },
        });

        if (response?.generatedImages && response.generatedImages.length > 0) {
            const newImages: ImageHistoryItem[] = response.generatedImages.map(img => {
                const base64ImageBytes = img.image.imageBytes;
                const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                return {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    imageUrl,
                    prompt: prompt,
                };
            });

            // Add all generated images to history
            newImages.forEach(img => addImageHistoryItem(img));
            
            // Set batch state
            setGeneratedBatch(newImages);
            setCurrentBatchIndex(0);
            setGeneratedImage(newImages[0]);
            
            foundImage = true;
        }

        if (!foundImage) {
            throw new Error("The API did not return a valid image.");
        }

    } catch (e) {
        console.error("Failed to generate image", e);
        setImageError(t('generator_image_error'));
        setGeneratedImage(null);
        setGeneratedBatch([]);
    } finally {
        setIsGeneratingImage(false);
        setIsGeneratingVariant(false);
    }
  };
  
    const navigateBatch = useCallback((direction: 'next' | 'prev') => {
        if (generatedBatch.length <= 1) return;
        
        let newIndex = currentBatchIndex;
        if (direction === 'next') {
            if (currentBatchIndex < generatedBatch.length - 1) {
                newIndex++;
            }
        } else {
            if (currentBatchIndex > 0) {
                newIndex--;
            }
        }
        
        if (newIndex !== currentBatchIndex) {
            setCurrentBatchIndex(newIndex);
            setGeneratedImage(generatedBatch[newIndex]);
        }
    }, [currentBatchIndex, generatedBatch]);

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigateBatch('next');
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigateBatch('prev');
    };

    const handleGenerateImageWithAnimation = useCallback(() => {
        if (!generatedPrompt || isLoading || isGeneratingImage) return;
        setGenerateImageState('clicked');
        handleGenerateImage(false);
        setTimeout(() => {
            setGenerateImageState('default');
        }, 600);
    }, [generatedPrompt, isLoading, isGeneratingImage, handleGenerateImage]);

    // Keyboard listener for navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!generatedImage && !generatedVideoUrl) return;
            // Only active if modal or fullscreen is showing
            if (!showGenerationModal && !isFullscreen) return;

            if (e.key === 'ArrowLeft') {
                navigateBatch('prev');
            } else if (e.key === 'ArrowRight') {
                navigateBatch('next');
            } else if (e.key === 'Escape') {
                if (isFullscreen) {
                    setIsFullscreen(false);
                } else {
                    closeModal();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [generatedImage, generatedVideoUrl, showGenerationModal, isFullscreen, navigateBatch, closeModal]);

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
                        
                        // For variants/upscales, we treat it as a new batch of 1
                        setGeneratedBatch([newImage]);
                        setCurrentBatchIndex(0);
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

            let videoAspectRatio = '16:9';
            if (aspectRatio === '9:16') {
                videoAspectRatio = '9:16';
            }

            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: generatedPrompt,
                image: { imageBytes: base64ImageData, mimeType: 'image/png' },
                config: { numberOfVideos: 1, resolution: '720p', aspectRatio: videoAspectRatio }
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
    if (example.cameraAngle) {
        setCameraAngle(example.cameraAngle);
    }
    // Simple handling for example mode string if needed, mostly reset settings
    setCameraSettings({});
    if (example.effect) {
        setEffect(example.effect);
    }
    setScene(example.scene);
    setGeneratedImage(null);
    setGeneratedBatch([]);
    setCurrentBatchIndex(0);
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
    let cameraAngleVal = cameraAngles[0].value;
    let effectVal = effects[0].value;

    const styleMatch = /Style: (.*?)(?=\. Camera Angle:|\. Camera Mode:|\. Effect:|\. Shot on:|\. Lighting:|\. Post-production:|$)/.exec(normalizedPrompt);
    const angleMatch = /Camera Angle: (.*?)(?=\. Camera Mode:|\. Effect:|\. Shot on:|\. Lighting:|\. Post-production:|$)/.exec(normalizedPrompt);
    const modeMatch = /Camera Mode:(.*?)(?=\. Effect:|\. Shot on:|\. Lighting:|\. Post-production:|$)/.exec(normalizedPrompt);
    const effectMatch = /Effect: (.*?)(?=\. Shot on:|\. Lighting:|\. Post-production:|$)/.exec(normalizedPrompt);
    const shotOnMatch = /Shot on: (.*?)(?=\. Style:|\. Camera Angle:|\. Camera Mode:|\. Effect:|\. Lighting:|\. Post-production:|$)/.exec(normalizedPrompt);
    const lightMatch = /Lighting: (.*?)(?=\. Style:|\. Camera Angle:|\. Camera Mode:|\. Effect:|\. Shot on:|\. Post-production:|$)/.exec(normalizedPrompt);
    const postProdMatch = /Post-production: (.*?)(?=\. Style:|\. Camera Angle:|\. Camera Mode:|\. Effect:|\. Shot on:|\. Lighting:|$)/.exec(normalizedPrompt);
    
    let sceneEndIndex = normalizedPrompt.length;
    if (styleMatch) sceneEndIndex = Math.min(sceneEndIndex, styleMatch.index);
    if (angleMatch) sceneEndIndex = Math.min(sceneEndIndex, angleMatch.index);
    if (modeMatch) sceneEndIndex = Math.min(sceneEndIndex, modeMatch.index);
    if (effectMatch) sceneEndIndex = Math.min(sceneEndIndex, effectMatch.index);
    if (shotOnMatch) sceneEndIndex = Math.min(sceneEndIndex, shotOnMatch.index);
    if (lightMatch) sceneEndIndex = Math.min(sceneEndIndex, lightMatch.index);
    if (postProdMatch) sceneEndIndex = Math.min(sceneEndIndex, postProdMatch.index);

    scene = normalizedPrompt.substring(0, sceneEndIndex).replace('A hyper-realistic, ultra-detailed cinematic shot of ', '').trim().replace(/\.$/, '');

    if (styleMatch) styleVal = styleMatch[1].trim();
    if (angleMatch) cameraAngleVal = angleMatch[1].trim();
    if (effectMatch) effectVal = effectMatch[1].trim();
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
    setCameraAngle(cameraAngleVal);
    setCameraSettings({}); // Reset explicit settings for community prompt import as parsing is complex
    setEffect(effectVal);
    setGeneratedPrompt(''); // Clear old prompt
    setGeneratedImage(null);
    setGeneratedBatch([]);
    setCurrentBatchIndex(0);
    setGeneratedVideoUrl(null);
    setIsEnhancedScene(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
};


  const handleRandomizeAllWithAnimation = useCallback(() => {
    setRandomizeState('clicked');
    setTimeout(() => {
        handleRandomizeAll();
        setRandomizeState('default');
    }, 500);
  }, []);
  
  const handleClearAllWithAnimation = useCallback(() => {
    setClearState('clicked');
    setTimeout(() => {
        handleClearAll();
        setClearState('default');
    }, 400);
  }, []);

  const handleRandomizeAll = useCallback(() => {
    setStyle(getRandomOption(styles));
    setCamera(getRandomOption(cameras));
    setLens(getRandomOption(lenses));
    setLight(getRandomOption(lighting));
    setPostProd(getRandomOption(postProduction));
    // Exclude the first option (empty/None)
    const validAngles = cameraAngles.slice(1);
    if (validAngles.length > 0) {
        setCameraAngle(getRandomOption(validAngles));
    }
    
    // Randomize Camera Settings
    const newSettings: Record<string, string> = {};
    cameraSettingsConfig.forEach(config => {
        const randomIndex = Math.floor(Math.random() * config.options.length);
        newSettings[config.id] = config.options[randomIndex];
    });
    setCameraSettings(newSettings);

    setEffect(getRandomOption(effects));

    setAspectRatio(getRandomOption(aspectRatios));
  }, []);
  
  const handleClearAll = useCallback(() => {
    setStyle(styles[0].value);
    setCamera(cameras[0].value);
    setLens(lenses[0].value);
    setLight(lighting[0].value);
    setPostProd(postProduction[0].value);
    setCameraAngle(cameraAngles[0].value); // This is ''
    setCameraSettings({}); 
    setEffect(effects[0].value); // This is ''
    setAspectRatio(aspectRatios[0].value);
    setScene('');
    setGeneratedPrompt('');
    setError('');
    setGeneratedImage(null);
    setGeneratedBatch([]);
    setCurrentBatchIndex(0);
    setGeneratedVideoUrl(null);
    setImageError('');
    setShowGenerationModal(false);
    setIsFullscreen(false);
    setIsEnhancedScene(false);
    setOriginalScene('');
  }, []);

  const handleRandomizeCameraSettings = () => {
      const newSettings: Record<string, string> = {};
      cameraSettingsConfig.forEach(config => {
          const randomIndex = Math.floor(Math.random() * config.options.length);
          newSettings[config.id] = config.options[randomIndex];
      });
      setCameraSettings(newSettings);
  };

  const handleResetCameraSettings = () => {
      setCameraSettings({});
  };

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

      const validAngles = cameraAngles.slice(1);
      
      const newInspiration: Example = {
        title: 'AI-Generated Idea',
        scene: sceneDescription,
        style: getRandomOption(styles),
        camera: getRandomOption(cameras),
        lens: getRandomOption(lenses),
        light: getRandomOption(lighting),
        postProd: getRandomOption(postProduction),
        cameraAngle: validAngles.length > 0 ? getRandomOption(validAngles) : '',
        // cameraMode: getRandomOption(cameraModes), // Deprecated string
        effect: getRandomOption(effects),
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
            setError(t('generator_error_scene_required'));
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

  const handleImageDescription = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (currentUser && !currentUser.isSubscribed && (currentUser?.promptCredits ?? 0) <= 0) {
        setAppView('subscription');
        return;
    }

    setIsDescribing(true);
    setError('');

    try {
        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        // Strip prefix
        const base64Content = base64Data.split(',')[1];

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: file.type, data: base64Content } },
                    { text: "Provide a detailed scene description of this image. Focus on the subject, action, setting, and lighting atmosphere. Do not mention camera equipment or specific post-production techniques. Keep it under 100 words." }
                ]
            }
        });

        const description = response.text.trim();
        if (description) {
            setScene(description);
            // Use a credit
            useCredit();

            if (describeMode === 'create') {
                // If in "Describe & Create" mode, immediately generate an image using the extracted description
                const anglePart = cameraAngle ? `\nCamera Angle: ${cameraAngle}.` : '';
                let modePart = '';
                const nonEmptySettings = Object.entries(cameraSettings).filter(([_, val]) => val !== '');
                if (nonEmptySettings.length > 0) {
                    modePart = '\nCamera Mode:';
                    cameraSettingsConfig.forEach(config => {
                        if (cameraSettings[config.id]) {
                            modePart += `\n${config.label}: ${cameraSettings[config.id]}`;
                        }
                    });
                    modePart += '.';
                }
                const effectPart = effect ? `\nEffect: ${effect}.` : '';
                
                const fullPrompt = `A hyper-realistic, ultra-detailed cinematic shot of ${description.trim()}.
Style: ${style}.${anglePart}${modePart}${effectPart}
Shot on: ${camera} with a ${lens}.
Lighting: ${light}.
Post-production: ${postProd}.
8k, masterpiece, photorealistic, high quality.`;

                setGeneratedPrompt(fullPrompt);
                
                // Add to history
                const newHistoryItem: HistoryItem = {
                    id: Date.now().toString(),
                    prompt: fullPrompt,
                    scene: description,
                    style,
                    camera,
                    lens,
                    light,
                    postProd,
                    cameraAngle,
                    cameraSettings,
                    effect,
                };
                addHistoryItem(newHistoryItem);

                // Trigger generation
                await handleGenerateImage(false, fullPrompt);
            }
        } else {
             setError(t('generator_inspiration_error'));
        }

    } catch (e) {
        console.error("Failed to describe image", e);
        setError(t('generator_inspiration_error'));
    } finally {
        setIsDescribing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };


  const hasCredits = currentUser?.isSubscribed || (currentUser?.promptCredits ?? 0) > 0;
  const creditsLeft = currentUser?.isSubscribed ? t('generator_credits_unlimited') : t('generator_credits_left', currentUser?.promptCredits ?? 0);
  const isSubscribed = currentUser?.isSubscribed ?? false;
  
  const currentImageVotes = generatedImage ? globalVoteData[generatedImage.id] : { likes: 0, dislikes: 0 };
  const currentUserVote = generatedImage ? userVotes[generatedImage.id] : null;
  const isPublished = generatedImage ? publishedImages.some(p => p.id === generatedImage.id) : false;
  const isFavorite = generatedImage ? favorites.includes(generatedImage.id) : false;

  const activeSettingsCount = Object.values(cameraSettings).filter(val => val !== '').length;

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
              <Selector label={t('label_aspect_ratio')} options={aspectRatios} selected={aspectRatio} onSelect={setAspectRatio} />
              <Selector label={t('label_camera_angle')} options={cameraAngles} selected={cameraAngle} onSelect={setCameraAngle} />
              
              {/* Custom Button for Camera Mode Modal */}
              <div className="relative">
                  <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">{t('label_camera_mode')}</label>
                  <button
                    onClick={() => setShowCameraSettingsModal(true)}
                    className="w-full bg-[rgba(var(--color-bg-secondary),0.5)] border border-[rgb(var(--color-border))] rounded-md shadow-sm pl-3 pr-4 py-2 text-left text-[rgb(var(--color-text-primary))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary-500))] focus:border-[rgb(var(--color-primary-500))] sm:text-sm flex justify-between items-center transition-colors hover:bg-[rgba(var(--color-bg-secondary),0.7)]"
                  >
                    <span className="block truncate">
                        {activeSettingsCount > 0 ? `${activeSettingsCount} settings active` : 'None'}
                    </span>
                    {/* Gear/Settings Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[rgb(var(--color-text-secondary))]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </button>
              </div>

              <Selector label={t('label_effect')} options={effects} selected={effect} onSelect={setEffect} />
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

            <div className="mt-8 space-y-4">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageDescription}
                />
                
                {/* Row 1: Clear & Randomize */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onMouseEnter={() => setClearState('hover')}
                        onMouseLeave={() => setClearState('default')}
                        onClick={handleClearAllWithAnimation}
                        className="w-full inline-flex items-center justify-center px-6 py-3 border border-[rgb(var(--color-border))] text-base font-medium rounded-md shadow-md text-[rgb(var(--color-text-secondary))] bg-[rgba(var(--color-bg-panel),0.6)] hover:bg-[rgba(var(--color-bg-panel),0.8)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-gray-500 transition-all duration-300 transform hover:scale-105"
                    >
                        <span className="w-5 h-5 mr-2">
                            {clearState === 'clicked' ? <BroomIcon className="h-5 w-5 text-rose-400 animate-sweep-away" />
                            : <TrashIcon className={`h-5 w-5 ${clearState === 'hover' ? 'animate-shake text-rose-400' : ''}`} />}
                        </span>
                        {t('btn_clear_all')}
                    </button>
                    <button
                        onMouseEnter={() => setRandomizeState('hover')}
                        onMouseLeave={() => setRandomizeState('default')}
                        onClick={handleRandomizeAllWithAnimation}
                        className="w-full inline-flex items-center justify-center px-6 py-3 border border-[rgb(var(--color-primary-500))] text-base font-medium rounded-md shadow-md text-[rgb(var(--color-primary-400))] bg-[rgba(var(--color-primary-950),0.4)] hover:bg-[rgba(var(--color-primary-900),0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-[rgb(var(--color-primary-500))] transition-all duration-300 transform hover:scale-105"
                    >
                        <span className="w-5 h-5 mr-2">
                            {randomizeState === 'clicked' ? <DiceIcon className="h-5 w-5 text-amber-400 animate-roll-away" />
                            : <DiceIcon className={`h-5 w-5 ${randomizeState === 'hover' ? 'animate-shake text-amber-400' : ''}`} />}
                        </span>
                        {t('btn_randomize_all')}
                    </button>
                </div>

                {/* Row 2: Actions & Count */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="flex gap-1 h-full w-full">
                        <button
                            onMouseEnter={() => setDescribeState('hover')}
                            onMouseLeave={() => setDescribeState('default')}
                            onClick={() => {
                                setDescribeMode('describe');
                                fileInputRef.current?.click();
                            }}
                            disabled={isDescribing}
                            className="flex-1 inline-flex flex-col items-center justify-center px-2 py-2 border border-[rgb(var(--color-border))] text-sm font-medium rounded-l-md shadow-md text-[rgb(var(--color-text-secondary))] bg-[rgba(var(--color-bg-panel),0.6)] hover:bg-[rgba(var(--color-bg-panel),0.8)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 h-[52px]"
                        >
                            {isDescribing && describeMode === 'describe' ? (
                                <SpinnerIcon className="h-5 w-5 text-blue-400 animate-spin mb-1"/>
                            ) : (
                                <PhotoIcon className={`h-5 w-5 text-blue-400 mb-1 ${describeState === 'hover' ? 'animate-shake' : ''}`} />
                            )}
                            <span className="text-xs">{t('btn_describe_only')}</span>
                        </button>
                        <button
                            onMouseEnter={() => setDescribeState('hover')}
                            onMouseLeave={() => setDescribeState('default')}
                            onClick={() => {
                                setDescribeMode('create');
                                fileInputRef.current?.click();
                            }}
                            disabled={isDescribing}
                            className="flex-1 inline-flex flex-col items-center justify-center px-2 py-2 border border-[rgb(var(--color-primary-500))] text-sm font-medium rounded-r-md shadow-md text-[rgb(var(--color-primary-400))] bg-[rgba(var(--color-primary-950),0.3)] hover:bg-[rgba(var(--color-primary-900),0.5)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 h-[52px]"
                        >
                            {isDescribing && describeMode === 'create' ? (
                                <SpinnerIcon className="h-5 w-5 text-purple-400 animate-spin mb-1"/>
                            ) : (
                                <SparklesIcon className={`h-5 w-5 text-purple-400 mb-1 ${describeState === 'hover' ? 'animate-pulse' : ''}`} />
                            )}
                            <span className="text-xs">{t('btn_describe_and_create')}</span>
                        </button>
                    </div>

                    <div className="relative w-full h-full">
                        <button
                            onMouseEnter={() => setGeneratePromptState('hover')}
                            onMouseLeave={() => setGeneratePromptState('default')}
                            onClick={handleGeneratePromptWithAnimation}
                            disabled={isLoading}
                            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-[rgb(var(--color-primary-600))] hover:bg-[rgb(var(--color-primary-700))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-[rgb(var(--color-primary-500))] disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 h-full"
                        >
                            <span className="w-5 h-5 mr-2 relative">
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : generatePromptState === 'clicked' ? (
                                    <>
                                        <KeyboardIcon className="h-5 w-5 animate-key-press" />
                                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white animate-fly-and-fade" style={{'--tx': '-10px', '--ty': '-15px'} as React.CSSProperties}>a</span>
                                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white animate-fly-and-fade delay-100" style={{'--tx': '5px', '--ty': '-20px'} as React.CSSProperties}>b</span>
                                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white animate-fly-and-fade delay-200" style={{'--tx': '15px', '--ty': '-10px'} as React.CSSProperties}>c</span>
                                    </>
                                ) : (
                                    <KeyboardIcon className={`h-5 w-5 ${generatePromptState === 'hover' ? 'animate-shake' : ''}`} />
                                )}
                            </span>
                            {isLoading ? t('btn_generating') : hasCredits ? t('btn_generate_prompt') : t('btn_upgrade_for_more')}
                        </button>
                        {!isLoading && (
                            <span className="absolute -top-2 -right-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[rgb(var(--color-primary-500))] text-white shadow-md z-10">
                                {creditsLeft}
                            </span>
                        )}
                    </div>

                    <Selector label={t('label_image_count')} options={imageCounts} selected={imageCount} onSelect={setImageCount} />

                    <button
                        onMouseEnter={() => setGenerateImageState('hover')}
                        onMouseLeave={() => setGenerateImageState('default')}
                        onClick={handleGenerateImageWithAnimation}
                        disabled={!generatedPrompt || isLoading || isGeneratingImage}
                        className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-md text-white bg-[rgb(var(--color-primary-500))] hover:bg-[rgb(var(--color-primary-600))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-[rgb(var(--color-primary-400))] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 h-[42px]" 
                        style={{ marginTop: 'auto' }}
                    >
                        <span className="w-5 h-5 mr-2">
                            {generateImageState === 'clicked' ? <PaletteIcon className="h-5 w-5 animate-mix-colors" />
                            : <PaletteIcon className={`h-5 w-5 ${generateImageState === 'hover' ? 'animate-shake' : ''}`} />}
                        </span>
                        {isGeneratingImage ? t('btn_creating') : t('btn_generate_image')}
                    </button>
                </div>
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

      {/* --- CAMERA SETTINGS MODAL --- */}
      {showCameraSettingsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowCameraSettingsModal(false)}>
            <div className="relative w-full max-w-5xl bg-[rgb(var(--color-bg-panel))] border border-[rgb(var(--color-border))] rounded-xl shadow-lg flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="p-4 border-b border-[rgb(var(--color-border))] flex justify-between items-center bg-[rgba(var(--color-bg-secondary),0.3)] rounded-t-xl">
                    <h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">{t('modal_camera_settings_title')}</h2>
                    <button onClick={() => setShowCameraSettingsModal(false)} className="text-white/70 hover:text-white transition-colors">
                        <XCircleIcon className="w-8 h-8" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {cameraSettingsConfig.map((config) => (
                            <Selector
                                key={config.id}
                                label={config.label}
                                options={[{ value: '', label: 'None' }, ...config.options.map(opt => ({ value: opt, label: opt }))]}
                                selected={cameraSettings[config.id] || ''}
                                onSelect={(val) => setCameraSettings(prev => ({ ...prev, [config.id]: val }))}
                            />
                        ))}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-[rgb(var(--color-border))] bg-[rgba(var(--color-bg-secondary),0.3)] rounded-b-xl flex flex-wrap justify-between gap-4">
                    <div className="flex gap-4">
                        <button
                            onClick={handleResetCameraSettings}
                            className="inline-flex items-center px-4 py-2 border border-[rgb(var(--color-border))] text-sm font-medium rounded-md text-[rgb(var(--color-text-secondary))] bg-[rgba(var(--color-bg-panel),0.6)] hover:bg-[rgba(var(--color-bg-panel),0.8)] transition-colors"
                        >
                            <TrashIcon className="w-4 h-4 mr-2" />
                            {t('btn_reset_settings')}
                        </button>
                        <button
                            onClick={handleRandomizeCameraSettings}
                            className="inline-flex items-center px-4 py-2 border border-[rgb(var(--color-primary-500))] text-sm font-medium rounded-md text-[rgb(var(--color-primary-400))] bg-[rgba(var(--color-primary-950),0.4)] hover:bg-[rgba(var(--color-primary-900),0.6)] transition-colors"
                        >
                            <DiceIcon className="w-4 h-4 mr-2" />
                            {t('btn_randomize_settings')}
                        </button>
                    </div>
                    <button
                        onClick={() => setShowCameraSettingsModal(false)}
                        className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[rgb(var(--color-primary-600))] hover:bg-[rgb(var(--color-primary-700))] transition-colors"
                    >
                        <CheckIcon className="w-4 h-4 mr-2" />
                        {t('btn_save_settings')}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- GENERATION MODAL --- */}
      {showGenerationModal && !isFullscreen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={closeModal}>
              <div className="relative w-full max-w-2xl bg-[rgb(var(--color-bg-panel))] border border-[rgb(var(--color-border))] rounded-xl shadow-lg p-4 flex flex-col" onClick={(e) => { e.stopPropagation(); if (showEnhanceUpscaleModal) setShowEnhanceUpscaleModal(null); }}>
                  <button onClick={closeModal} className="absolute -top-3 -right-3 text-white/70 bg-[rgb(var(--color-bg-panel))] rounded-full p-1 hover:text-white transition-colors z-10" aria-label="Close image view">
                      <XCircleIcon className="w-8 h-8" />
                  </button>
                  
                  <div className="aspect-video w-full flex-grow flex items-center justify-center bg-black/20 rounded-lg overflow-hidden relative">
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
                        <>
                            <img src={generatedImage.imageUrl} alt="AI generated cinematic art from prompt" className="w-full h-full object-contain" />
                            {generatedBatch.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        disabled={currentBatchIndex === 0}
                                        className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/60 transition-colors disabled:opacity-20 disabled:cursor-not-allowed z-10"
                                    >
                                        <ChevronLeftIcon className="w-8 h-8" />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        disabled={currentBatchIndex === generatedBatch.length - 1}
                                        className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/60 transition-colors disabled:opacity-20 disabled:cursor-not-allowed z-10"
                                    >
                                        <ChevronRightIcon className="w-8 h-8" />
                                    </button>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none backdrop-blur-sm">
                                        {currentBatchIndex + 1} / {generatedBatch.length}
                                    </div>
                                </>
                            )}
                        </>
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
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsFullscreen(false)}>
              <button
                  onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
                  className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-20"
                  aria-label="Close fullscreen view"
              >
                  <XMarkIcon className="w-10 h-10" />
              </button>
              <div className="relative w-full h-full flex items-center justify-center">
                  <img
                      src={generatedImage.imageUrl}
                      alt="Fullscreen view of AI generated cinematic art"
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                  />
                  {generatedBatch.length > 1 && (
                    <>
                        <button
                            onClick={handlePrevImage}
                            disabled={currentBatchIndex === 0}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-3 hover:bg-black/60 transition-colors disabled:opacity-20 disabled:cursor-not-allowed z-20"
                        >
                            <ChevronLeftIcon className="w-8 h-8" />
                        </button>
                        <button
                            onClick={handleNextImage}
                            disabled={currentBatchIndex === generatedBatch.length - 1}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-3 hover:bg-black/60 transition-colors disabled:opacity-20 disabled:cursor-not-allowed z-20"
                        >
                            <ChevronRightIcon className="w-8 h-8" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-4 py-2 rounded-full pointer-events-none backdrop-blur-sm z-20">
                            {currentBatchIndex + 1} / {generatedBatch.length}
                        </div>
                    </>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default PromptGenerator;