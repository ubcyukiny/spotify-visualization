import React, { createContext, useState } from "react";

export const SelectedSongsContext = createContext();

export const SelectedSongsProvider = ({ children }) => {
  const [selectedSongs, setSelectedSongs] = useState([]);

  const addSong = (song) => {
    setSelectedSongs([...selectedSongs, song]);
  };

  const removeSong = (songId) => {
    setSelectedSongs(selectedSongs.filter((song) => song.id !== songId));
  };

  return (
    <SelectedSongsContext.Provider
      value={{ selectedSongs, addSong, removeSong }}
    >
      {children}
    </SelectedSongsContext.Provider>
  );
};
