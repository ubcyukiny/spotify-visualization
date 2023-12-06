import React, { createContext, useState } from "react";

export const SelectedSongsContext = createContext();

export const SelectedSongsProvider = ({ children }) => {
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [appMode, setAppMode] = useState("track"); // track or playlist

  const songLimit = 10;

  // const addSong = (song) => {
  //   setSelectedSongs([...selectedSongs, song]);
  // };

  const moreSongsCanBeAdded = () => {
    return selectedSongs.length < songLimit;
  }

  const isSongAlreadyAdded = (song) => {
    return selectedSongs.find((selectedSong) => selectedSong.id === song.id);
  }

  // using functional update
  const addSong = (newSong) => {
    setSelectedSongs((prevSelectedSongs) => {
      // Check if the newSong is already in the selectedSongs list to avoid duplicates
      const isSongAlreadyAdded = prevSelectedSongs.find(
        (song) => song.id === newSong.id
      );
      if (isSongAlreadyAdded) {
        // Optionally handle the duplicate case, such as showing a message to the user
        alert("Song already added");
        return prevSelectedSongs;
      }

      if (prevSelectedSongs.length >= songLimit) {
        alert("Song limit reached");
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

  const setPlaylistId = (playlistId) => {
    setSelectedPlaylistId(playlistId);
  };

  const removePlaylistId = () => {
    setSelectedPlaylistId(null);
  };

  return (
    <SelectedSongsContext.Provider
      value={{
        selectedSongs,
        selectedPlaylistId,
        appMode,
        addSong,
        removeSong,
        setPlaylistId,
        removePlaylistId,
        setAppMode,
        moreSongsCanBeAdded,
        isSongAlreadyAdded
      }}
    >
      {children}
    </SelectedSongsContext.Provider>
  );
};
