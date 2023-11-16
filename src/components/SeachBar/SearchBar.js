import React, { useState, useContext } from "react";
import { SelectedSongsContext } from "../../context/SelectedSongsContext";
import axios from "axios";
import { useSpotifyAuth } from "../../context/SpotifyAuthContext";
import "./style.css";

const SearchBar = () => {
  const { spotifyAccessToken } = useSpotifyAuth();
  const accessToken = spotifyAccessToken;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedTrackFeatures, setSelectedTrackFeatures] = useState(null);
  const { addSong, selectedSongs } = useContext(SelectedSongsContext);

  const handleSearch = async () => {
    try {
      const response = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          q: query,
          type: "track", 
          limit: 10,
        },
      });
      setResults(response.data.tracks.items); 
      console.log(response.data);
    } catch (error) {
      console.error("Error during Spotify search", error);
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
            // multiple track ids can be passed in separated by commas
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

  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a song"
      />
      <button className="search-button" onClick={handleSearch}>
        Search
      </button>
      <div className="results-container">
        {results.map((track) => (
          <div className="track-item" key={track.id}>
            <img
              className="album-cover"
              src={track.album.images[0].url}
              alt="Album Cover"
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
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
