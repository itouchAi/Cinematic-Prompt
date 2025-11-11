import React, { createContext, useState, useEffect, ReactNode } from 'react';

// --- TYPES ---
export interface User {
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  password?: string; 
  promptCredits?: number;
  lastPromptDate?: string;
  isSubscribed?: boolean;
  lastLoginDate?: string;
}

export interface HistoryItem {
  id: string;
  prompt: string;
  scene: string;
  style: string;
  camera: string;
  lens: string;
  light: string;
  postProd: string;
}

export interface ImageHistoryItem {
  id: string;
  imageUrl: string; // base64 data URL
  prompt: string;
}

export interface PublishedImage extends ImageHistoryItem {
  creatorEmail: string;
  creatorNickname: string;
}

export type VoteType = 'like' | 'dislike';

// --- GLOBAL DATA STRUCTURES ---
export interface GlobalVoteData {
  [imageId: string]: {
    likes: number;
    dislikes: number;
  };
}

export interface GlobalUserVotes {
  [userEmail: string]: {
    [imageId:string]: VoteType;
  }
}

export interface FollowingBlockData {
  [userEmail: string]: {
    following: string[]; // array of emails
    blocked: string[]; // array of emails
  }
}

type AppView = 'landing' | 'generator' | 'history' | 'subscription' | 'profile' | 'favorites';
type CurrentPage = 'landing' | 'login' | 'signup' | 'subscription';

interface AuthContextType {
  currentUser: User | null;
  currentPage: CurrentPage;
  appView: AppView;
  previousAppView: AppView | null;
  viewingProfileEmail: string | null;
  promptHistory: HistoryItem[];
  imageHistory: ImageHistoryItem[];
  itemToReuse: HistoryItem | null;
  globalVoteData: GlobalVoteData;
  userVotes: { [imageId: string]: VoteType };
  favorites: string[];
  publishedImages: PublishedImage[];
  allUsers: User[];
  followingBlockData: FollowingBlockData;
  login: (email: string, pass: string) => Promise<void>;
  signup: (userData: User) => Promise<void>;
  logout: () => void;
  setCurrentPage: (page: CurrentPage) => void;
  setAppView: (view: AppView, email?: string) => void;
  addHistoryItem: (item: HistoryItem) => void;
  addImageHistoryItem: (item: ImageHistoryItem) => void;
  deleteImageHistoryItem: (id: string) => void;
  clearHistory: () => void;
  reuseHistoryItem: (item: HistoryItem) => void;
  clearItemToReuse: () => void;
  useCredit: () => void;
  subscribeUser: () => void;
  handleVote: (imageId: string, vote: VoteType) => void;
  publishImage: (image: ImageHistoryItem) => void;
  toggleFavorite: (imageId: string) => void;
  handleFollow: (targetEmail: string) => void;
  handleBlock: (targetEmail: string) => void;
}

// --- CONSTANTS ---
const MAX_PROMPT_HISTORY_ITEMS = 15;
const MAX_IMAGE_HISTORY_ITEMS = 8;
const DAILY_CREDITS = 2;

// --- CONTEXT CREATION ---
export const AuthContext = createContext<AuthContextType>(null!);

// --- AUTH PROVIDER COMPONENT ---
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<CurrentPage>('landing');
  const [appView, setAppViewInternal] = useState<AppView>('landing');
  const [previousAppView, setPreviousAppView] = useState<AppView | null>(null);
  const [viewingProfileEmail, setViewingProfileEmail] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Local state per user
  const [promptHistory, setPromptHistory] = useState<HistoryItem[]>([]);
  const [imageHistory, setImageHistory] = useState<ImageHistoryItem[]>([]);
  const [itemToReuse, setItemToReuse] = useState<HistoryItem | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userVotes, setUserVotes] = useState<{ [imageId: string]: VoteType }>({});

  // Global state across all users
  const [publishedImages, setPublishedImages] = useState<PublishedImage[]>([]);
  const [globalVoteData, setGlobalVoteData] = useState<GlobalVoteData>({});
  const [globalUserVotes, setGlobalUserVotes] = useState<GlobalUserVotes>({});
  const [followingBlockData, setFollowingBlockData] = useState<FollowingBlockData>({});


  const setAppView = (view: AppView, email?: string) => {
    setPreviousAppView(appView);
    setAppViewInternal(view);
    if (view === 'profile' && email) {
        setViewingProfileEmail(email);
    } else {
        setViewingProfileEmail(null);
    }
  };

  // --- GLOBAL DATA MANAGEMENT ---
  useEffect(() => {
    try {
        const storedUsers = localStorage.getItem('users');
        setAllUsers(storedUsers ? JSON.parse(storedUsers) : []);

        const storedPublished = localStorage.getItem('published_images');
        setPublishedImages(storedPublished ? JSON.parse(storedPublished) : []);

        const storedVotes = localStorage.getItem('global_votes');
        if (storedVotes) {
            const { voteData, userVotes } = JSON.parse(storedVotes);
            setGlobalVoteData(voteData || {});
            setGlobalUserVotes(userVotes || {});
        }

        const storedSocial = localStorage.getItem('social_data');
        setFollowingBlockData(storedSocial ? JSON.parse(storedSocial) : {});
    } catch (e) {
        console.error("Failed to load global data from localStorage", e);
    }
  }, []);

  const savePublishedImages = (images: PublishedImage[]) => {
      try {
          localStorage.setItem('published_images', JSON.stringify(images));
      } catch (e) {
          console.error("Failed to save published images", e);
      }
  };

  const saveGlobalVotes = (votes: { voteData: GlobalVoteData, userVotes: GlobalUserVotes }) => {
      try {
          localStorage.setItem('global_votes', JSON.stringify(votes));
      } catch (e) {
          console.error("Failed to save global votes", e);
      }
  };

  const saveSocialData = (data: FollowingBlockData) => {
    try {
        localStorage.setItem('social_data', JSON.stringify(data));
    } catch(e) {
        console.error("Failed to save social data", e);
    }
  }
  
  // --- USER-SPECIFIC DATA MANAGEMENT ---
  useEffect(() => {
    try {
      const loggedInUserJson = localStorage.getItem('loggedInUser');
      if (loggedInUserJson) {
        const user: User = JSON.parse(loggedInUserJson);
        const today = new Date().toISOString().split('T')[0];
        if (user.lastPromptDate !== today) {
          user.promptCredits = DAILY_CREDITS;
          user.lastPromptDate = today;
        }
        user.lastLoginDate = today;
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        setCurrentUser(user);
        loadDataForUser(user.email);
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      localStorage.removeItem('loggedInUser');
    }
    setLoading(false);
  }, []);

  const loadDataForUser = (email: string) => {
      try {
          const promptHistoryJson = localStorage.getItem(`history_${email}`);
          setPromptHistory(promptHistoryJson ? JSON.parse(promptHistoryJson) : []);

          const imageHistoryJson = localStorage.getItem(`image_history_${email}`);
          setImageHistory(imageHistoryJson ? JSON.parse(imageHistoryJson) : []);
          
          const userSpecificVotes = globalUserVotes[email] || {};
          setUserVotes(userSpecificVotes);

          const favoritesJson = localStorage.getItem(`favorites_${email}`);
          setFavorites(favoritesJson ? JSON.parse(favoritesJson) : []);
      } catch (e) {
          console.error(`Failed to load data for user ${email}`, e);
      }
  };

  const saveDataForUser = (email: string, data: {
      promptHistory?: HistoryItem[],
      imageHistory?: ImageHistoryItem[],
      favorites?: string[]
  }) => {
      try {
          if (data.promptHistory) localStorage.setItem(`history_${email}`, JSON.stringify(data.promptHistory));
          if (data.imageHistory) localStorage.setItem(`image_history_${email}`, JSON.stringify(data.imageHistory));
          if (data.favorites) localStorage.setItem(`favorites_${email}`, JSON.stringify(data.favorites));
      } catch (e) {
          console.error(`Failed to save data for user ${email}`, e);
      }
  };

  // --- AUTH FUNCTIONS ---
  const login = async (email: string, pass: string): Promise<void> => {
    const foundUser = allUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (foundUser && foundUser.password === pass) {
      const { password, ...userToStore } = foundUser;
      
      const today = new Date().toISOString().split('T')[0];
      if (!userToStore.lastPromptDate || userToStore.lastPromptDate !== today) {
        userToStore.promptCredits = DAILY_CREDITS;
        userToStore.lastPromptDate = today;
      }
      userToStore.lastLoginDate = today;
      if (userToStore.isSubscribed === undefined) userToStore.isSubscribed = false;
      
      localStorage.setItem('loggedInUser', JSON.stringify(userToStore));
      setCurrentUser(userToStore);
      loadDataForUser(userToStore.email);
      setAppView('landing');
    } else {
      throw new Error("error.invalidCredentials");
    }
  };

  const signup = async (userData: User): Promise<void> => {
    if (allUsers.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error("error.emailExists");
    }
    const newUser = {
      ...userData,
      promptCredits: DAILY_CREDITS,
      lastPromptDate: new Date().toISOString().split('T')[0],
      isSubscribed: false,
    };
    const newUsers = [...allUsers, newUser];
    setAllUsers(newUsers);
    localStorage.setItem('users', JSON.stringify(newUsers));
  };

  const logout = () => {
    localStorage.removeItem('loggedInUser');
    setCurrentUser(null);
    setPromptHistory([]);
    setImageHistory([]);
    setFavorites([]);
    setUserVotes({});
    setCurrentPage('landing');
    setAppView('landing');
  };
  
  // --- CORE APP FUNCTIONS ---
  const addHistoryItem = (item: HistoryItem) => {
    if (!currentUser) return;
    const newHistory = [item, ...promptHistory].slice(0, MAX_PROMPT_HISTORY_ITEMS);
    setPromptHistory(newHistory);
    saveDataForUser(currentUser.email, { promptHistory: newHistory });
  };
  
  const addImageHistoryItem = (item: ImageHistoryItem) => {
    if (!currentUser) return;
    const newHistory = [item, ...imageHistory].slice(0, MAX_IMAGE_HISTORY_ITEMS);
    setImageHistory(newHistory);
    saveDataForUser(currentUser.email, { imageHistory: newHistory });
  };

  const deleteImageHistoryItem = (id: string) => {
    if (!currentUser) return;
    // Local History
    const newImageHistory = imageHistory.filter(item => item.id !== id);
    setImageHistory(newImageHistory);
    saveDataForUser(currentUser.email, { imageHistory: newImageHistory });

    // Published
    const newPublished = publishedImages.filter(p => p.id !== id);
    if (newPublished.length !== publishedImages.length) {
        setPublishedImages(newPublished);
        savePublishedImages(newPublished);
    }
    
    // Votes & Favorites (cascade delete across all users)
    const newGlobalVoteData = { ...globalVoteData };
    delete newGlobalVoteData[id];

    const newGlobalUserVotes = { ...globalUserVotes };
    Object.keys(newGlobalUserVotes).forEach(email => {
        delete newGlobalUserVotes[email][id];
    });

    setGlobalVoteData(newGlobalVoteData);
    setGlobalUserVotes(newGlobalUserVotes);
    saveGlobalVotes({ voteData: newGlobalVoteData, userVotes: newGlobalUserVotes });
    setUserVotes(newGlobalUserVotes[currentUser.email] || {});

    // Cascade delete favorites
    try {
      const allFavsJson = localStorage.getItem('global_favorites');
      const allFavs = allFavsJson ? JSON.parse(allFavsJson) : {};
      Object.keys(allFavs).forEach(email => {
        allFavs[email] = allFavs[email].filter((favId: string) => favId !== id);
      });
      localStorage.setItem('global_favorites', JSON.stringify(allFavs));
      setFavorites(allFavs[currentUser.email] || []);
    } catch (e) { console.error("Failed to cascade delete favorites", e) }
  };

  const clearHistory = () => {
    if (!currentUser) return;
    setPromptHistory([]);
    localStorage.removeItem(`history_${currentUser.email}`);
    // Note: This does NOT clear published images or favorites for simplicity.
    // It only clears the local history view.
    const unclearedImages = imageHistory.filter(img => publishedImages.some(p => p.id === img.id));
    setImageHistory(unclearedImages);
    saveDataForUser(currentUser.email, { imageHistory: unclearedImages });
  };

  const publishImage = (image: ImageHistoryItem) => {
      if (!currentUser) return;
      const isAlreadyPublished = publishedImages.some(p => p.id === image.id);
      let newPublished: PublishedImage[];

      if (isAlreadyPublished) {
          // Unpublish
          newPublished = publishedImages.filter(p => p.id !== image.id);
      } else {
          // Publish
          const newPublishedImage: PublishedImage = {
              ...image,
              creatorEmail: currentUser.email,
              creatorNickname: currentUser.nickname,
          };
          newPublished = [newPublishedImage, ...publishedImages];
      }
      setPublishedImages(newPublished);
      savePublishedImages(newPublished);
  };
  
  const toggleFavorite = (imageId: string) => {
      if (!currentUser) return;
      const newFavorites = favorites.includes(imageId)
          ? favorites.filter(id => id !== imageId)
          : [...favorites, imageId];
      setFavorites(newFavorites);
      saveDataForUser(currentUser.email, { favorites: newFavorites });
  };

  const handleVote = (imageId: string, vote: VoteType) => {
    if (!currentUser) return;
    
    const newGlobalVoteData = JSON.parse(JSON.stringify(globalVoteData));
    const newGlobalUserVotes = JSON.parse(JSON.stringify(globalUserVotes));

    const userEmail = currentUser.email;
    if (!newGlobalUserVotes[userEmail]) newGlobalUserVotes[userEmail] = {};

    const currentVote = newGlobalUserVotes[userEmail][imageId];
    const imageVotes = newGlobalVoteData[imageId] || { likes: 0, dislikes: 0 };

    // Handle vote logic
    if (currentVote === vote) { // Un-voting
      if (vote === 'like') imageVotes.likes--;
      else imageVotes.dislikes--;
      delete newGlobalUserVotes[userEmail][imageId];
    } else { // Changing vote or new vote
      if (currentVote === 'like') imageVotes.likes--;
      else if (currentVote === 'dislike') imageVotes.dislikes--;
      
      if (vote === 'like') imageVotes.likes++;
      else imageVotes.dislikes++;
      newGlobalUserVotes[userEmail][imageId] = vote;
    }
    
    imageVotes.likes = Math.max(0, imageVotes.likes);
    imageVotes.dislikes = Math.max(0, imageVotes.dislikes);
    newGlobalVoteData[imageId] = imageVotes;
    
    setGlobalVoteData(newGlobalVoteData);
    setGlobalUserVotes(newGlobalUserVotes);
    setUserVotes(newGlobalUserVotes[userEmail]);
    saveGlobalVotes({ voteData: newGlobalVoteData, userVotes: newGlobalUserVotes });
  };

  const handleFollow = (targetEmail: string) => {
    if (!currentUser || currentUser.email === targetEmail) return;
    const newSocialData = JSON.parse(JSON.stringify(followingBlockData));
    const userEmail = currentUser.email;

    if (!newSocialData[userEmail]) newSocialData[userEmail] = { following: [], blocked: [] };
    
    const isFollowing = newSocialData[userEmail].following.includes(targetEmail);
    if (isFollowing) {
      newSocialData[userEmail].following = newSocialData[userEmail].following.filter((email: string) => email !== targetEmail);
    } else {
      newSocialData[userEmail].following.push(targetEmail);
    }
    setFollowingBlockData(newSocialData);
    saveSocialData(newSocialData);
  }

  const handleBlock = (targetEmail: string) => {
    if (!currentUser || currentUser.email === targetEmail) return;
    const newSocialData = JSON.parse(JSON.stringify(followingBlockData));
    const userEmail = currentUser.email;
    
    if (!newSocialData[userEmail]) newSocialData[userEmail] = { following: [], blocked: [] };
    
    const isBlocked = newSocialData[userEmail].blocked.includes(targetEmail);
    if (isBlocked) {
      newSocialData[userEmail].blocked = newSocialData[userEmail].blocked.filter((email: string) => email !== targetEmail);
    } else {
      newSocialData[userEmail].blocked.push(targetEmail);
      // Also unfollow if blocking
      newSocialData[userEmail].following = newSocialData[userEmail].following.filter((email: string) => email !== targetEmail);
    }
    setFollowingBlockData(newSocialData);
    saveSocialData(newSocialData);
  }
  
  const reuseHistoryItem = (item: HistoryItem) => {
    setItemToReuse(item);
    setAppView('generator');
  };

  const clearItemToReuse = () => setItemToReuse(null);

  const useCredit = () => {
    if (!currentUser || currentUser.isSubscribed) return;
    if ((currentUser.promptCredits ?? 0) > 0) {
      const updatedUser = { ...currentUser, promptCredits: (currentUser.promptCredits ?? 0) - 1 };
      setCurrentUser(updatedUser);
      localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
    }
  };
  
  const subscribeUser = () => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, isSubscribed: true };
    setCurrentUser(updatedUser);
    localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
    setAppView('generator');
  };

  const value = {
    currentUser, currentPage, appView, previousAppView, viewingProfileEmail,
    promptHistory, imageHistory, itemToReuse, globalVoteData, userVotes, favorites, publishedImages, allUsers,
    followingBlockData,
    login, signup, logout, setCurrentPage, setAppView,
    addHistoryItem, addImageHistoryItem, deleteImageHistoryItem, clearHistory,
    reuseHistoryItem, clearItemToReuse, useCredit, subscribeUser,
    handleVote, publishImage, toggleFavorite, handleFollow, handleBlock
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};