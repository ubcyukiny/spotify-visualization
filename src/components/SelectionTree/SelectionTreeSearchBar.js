import React, { useState } from "react";
import axios from "axios";
import { useSpotifyAuth } from "../../context/SpotifyAuthContext";
import "./SearchBarStyle.css";

export default function SelectionTreeSearchBar({ setInitialSong }) {
  const { spotifyAccessToken } = useSpotifyAuth();
  const accessToken = spotifyAccessToken;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResult, setShowResult] = useState(false);

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
      setShowResult(true);
    } catch (error) {
      console.error("Error during Spotify search", error);
    }
  };

  const handleSelect = (track) => {
    setInitialSong(track);
    setShowResult(false);
  };

  return (
    <div className="selection-search-container">
      <div className="selection-searchbar-container">
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
      </div>

      {!showResult ? null : (
        <div className="selection-results-container">
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
                onClick={() => handleSelect(track)}
              >
                {" "}
                Select{" "}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
