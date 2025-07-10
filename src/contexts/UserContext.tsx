
import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserDetails {
  name: string;
  email: string;
}

interface UserContextType {
  userDetails: UserDetails | null;
  setUserDetails: (details: UserDetails) => void;
  clearUserDetails: () => void;
  isUserRegistered: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userDetails, setUserDetailsState] = useState<UserDetails | null>(null);

  useEffect(() => {
    // Load user details from localStorage on mount
    const savedUserDetails = localStorage.getItem('userDetails');
    if (savedUserDetails) {
      setUserDetailsState(JSON.parse(savedUserDetails));
    }
  }, []);

  const setUserDetails = (details: UserDetails) => {
    setUserDetailsState(details);
    localStorage.setItem('userDetails', JSON.stringify(details));
  };

  const clearUserDetails = () => {
    setUserDetailsState(null);
    localStorage.removeItem('userDetails');
  };

  const isUserRegistered = userDetails !== null && userDetails.name.trim() !== '';

  return (
    <UserContext.Provider value={{
      userDetails,
      setUserDetails,
      clearUserDetails,
      isUserRegistered
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
