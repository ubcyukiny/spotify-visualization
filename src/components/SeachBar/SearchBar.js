import React, { useState, useContext } from "react";
import { SelectedSongsContext } from "../../context/SelectedSongsContext";
import axios from "axios";
import { useSpotifyAuth } from "../../context/SpotifyAuthContext";
import "./style.css";

const SearchBar = () => {
  const { spotifyAccessToken } = useSpotifyAuth();
  const accessToken = spotifyAccessToken;
  const [query, setQuery] = useState("");
  const [trackResults, setTrackResults] = useState([]);
  const [playlistResults, setPlaylistResults] = useState([]);
  const [selectedTrackFeatures, setSelectedTrackFeatures] = useState(null);
  const {
    selectedSongs,
    selectedPlaylistId,
    addSong,
    setPlaylistId,
    appMode,
    setAppMode
  } = useContext(SelectedSongsContext);

  const handleSearch = async () => {
    try {
      if(appMode === "track") {
      const response = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          q: query,
          type: "track", 
          limit: 50,
        },
      });
      setTrackResults(response.data.tracks.items); }
      else {
        const response = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          q: query,
          type: "playlist", 
          limit: 50,
        }
      });
      setPlaylistResults(response.data.playlists.items);
      }

    } catch (error) {
      console.error("Error during Spotify search", error);
      alert(error.response.data.error.message)
    }
  };

  const fetchTrackFeatures = async (track) => {
    if(selectedSongs.length >= 10) {
      alert("You have already selected 10 songs");
      return;
    }
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/audio-features`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            ids: track.id,
          },
        }
      );
      setSelectedTrackFeatures(response.data);
      addSong({ ...track, features: response.data?.audio_features });
    } catch (error) {
      console.error("Error fetching track features", error);
    }
  };

   const selectMode = (mode) => {
     setAppMode(mode);
   };

  return (
    <div className="search-container">
      <div className="selection-mode-container">
        <button
          className={`mode-button ${
            appMode === "track" ? "selected" : ""
          }`}
          onClick={() => selectMode("track")}
        >
          Track
        </button>
        <button
          className={`mode-button ${
            appMode === "playlist" ? "selected" : ""
          }`}
          onClick={() => selectMode("playlist")}
        >
          PlayList
        </button>
      </div>
      <div className="searchbar-container">
        <input
          type="text"
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search for a ${appMode}`}
        />
        <button className="search-button" onClick={handleSearch}>
          Search
        </button>
      </div>

      <div className="results-container">
        {appMode === "track"
          ? trackResults.map((track) => (
              <div className="track-item" key={track.id}>
                <img
                  className="album-cover"
                  src={track.album.images[0].url}
                  alt="Track Cover"
                />
                <span className="track-info">
                  {track.name} by {track.artists[0].name}
                </span>
                <button
                  className="select-button"
                  disabled={selectedSongs.some((song) => song.id === track.id)}
                  onClick={() => fetchTrackFeatures(track)}
                >
                  Select
                </button>
              </div>
            ))
          : playlistResults.map((playlist) => (
              <div className="track-item" key={playlist.id}>
                <img
                  className="album-cover"
                  src={playlist.images[0]?.url || ""}
                  alt="PlayList Cover"
                />
                <span className="track-info">{playlist.name}</span>
                <button
                  className="select-button"
                  onClick={() => setPlaylistId(playlist.id)}
                  disabled={selectedPlaylistId === playlist.id}
                >
                  Select
                </button>
              </div>
            ))}
      </div>
    </div>
  );
};

export default SearchBar;
