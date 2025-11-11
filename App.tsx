import React, { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import PromptGenerator from './pages/PromptGenerator';
import Subscription from './pages/Subscription';
import HistoryPage from './pages/History';
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';


const App: React.FC = () => {
  const { currentUser, currentPage, appView } = useContext(AuthContext);

  if (!currentUser) {
    if (currentPage === 'signup') {
      return <SignUp />;
    }
    if (currentPage === 'login') {
      return <Login />;
    }
    if (currentPage === 'subscription') {
      return <Subscription />;
    }
    return <LandingPage />;
  }

  switch (appView) {
    case 'generator':
      return <PromptGenerator />;
    case 'subscription':
      return <Subscription />;
    case 'history':
      return <HistoryPage />;
    case 'profile':
      return <ProfilePage />;
    case 'favorites':
      return <FavoritesPage />;
    case 'landing':
    default:
      return <LandingPage />;
  }
};

export default App;