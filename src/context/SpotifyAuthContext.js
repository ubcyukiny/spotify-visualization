import React, { createContext, useState, useContext } from "react";

const SpotifyAuthContext = createContext();

export const useSpotifyAuth = () => useContext(SpotifyAuthContext);

export const SpotifyAuthProvider = ({ children }) => {
  const [spotifyAccessToken, setspotifyAccessToken] = useState(null);
  const [spotifyRefreshToken, setspotifyRefreshToken] = useState(null);

  const updateCredentials = (accessToken, refreshToken) => {
    setspotifyAccessToken(accessToken);
    setspotifyRefreshToken(refreshToken);
  };

  return (
    <SpotifyAuthContext.Provider
      value={{ spotifyAccessToken, spotifyRefreshToken, updateCredentials }}
    >
      {children}
    </SpotifyAuthContext.Provider>
  );
};
