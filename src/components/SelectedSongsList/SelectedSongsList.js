import React, { useContext } from "react";
import { SelectedSongsContext } from "../../context/SelectedSongsContext";
import "./style.css";

const SelectedSongsList = () => {
  const { selectedSongs, removeSong } = useContext(SelectedSongsContext);

  return (
    <div className="selected-songs-container">
      <div>Selected Songs</div>
      <div>{selectedSongs.length}/10</div>
      {selectedSongs.map((song) => (
        <div className="song-item" key={song.id}>
          <div className="song-info">
            {song.name} by {song.artists[0].name}
          </div>
          <button className="remove-button" onClick={() => removeSong(song.id)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

export default SelectedSongsList;
