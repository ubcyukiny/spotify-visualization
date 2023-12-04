import React, { createContext, useState } from "react";

export const SelectedSongsContext = createContext();

export const SelectedSongsProvider = ({ children }) => {
  const [selectedSongs, setSelectedSongs] = useState([]);

  // const addSong = (song) => {
  //   setSelectedSongs([...selectedSongs, song]);
  // };

  // using functional update
  const addSong = (newSong) => {
    setSelectedSongs((prevSelectedSongs) => {
      // Check if the newSong is already in the selectedSongs list to avoid duplicates
      const isSongAlreadyAdded = prevSelectedSongs.find(song => song.id === newSong.id);
      if (isSongAlreadyAdded) {
        // Optionally handle the duplicate case, such as showing a message to the user
        return prevSelectedSongs;
      }
      return [...prevSelectedSongs, newSong];
    });
  };

  // const removeSong = (songId) => {
  //   setSelectedSongs(selectedSongs.filter((song) => song.id !== songId));
  // };

  // using functional update
  const removeSong = (songId) => {
    setSelectedSongs((prevSelectedSongs) => 
      prevSelectedSongs.filter((song) => song.id !== songId)
    );
  };

  return (
    <SelectedSongsContext.Provider
      value={{ selectedSongs, addSong, removeSong }}
    >
      {children}
    </SelectedSongsContext.Provider>
  );
};
