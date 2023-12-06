import React, { useContext } from "react";
import { SelectedSongsContext } from "../../context/SelectedSongsContext";
import "./style.css";

const SelectedSongsList = () => {
  const { selectedSongs, removeSong, appMode } = useContext(SelectedSongsContext);

  return (
    <div className="selected-songs-container">
      <div className="selected-songs-header">
        <div className="selected-title">Your PlayList</div>
        {appMode === "track" && <div>{selectedSongs.length}/10</div>}
        {appMode === "playlist" && <div>{selectedSongs.length}/10</div>}
      </div>
      <div className="selected-songs-result-container">
        {selectedSongs.map((song) => (
          <div className="song-item" key={song.id}>
            <div className="song-info">
              {song.name} by {song.artists[0].name}
            </div>
            <button
              className="remove-button"
              onClick={() => removeSong(song.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectedSongsList;
