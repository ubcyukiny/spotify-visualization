import React, { useState, useContext } from "react";

const PlaylistLinkBox = ({updatePlaylistID}) => {
    const [query, setQuery] = useState("");

    return (
        <div className="search-container">
            <input
                type="text"
                className="search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Spotify playlist link here"
            />
            <div>
            <button className="search-button" onClick={() => {
                let playlistID = validateAndExtractSpotifyId(query);
                // should filter the id and set it to global var using useContext
                // example: https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
                updatePlaylistID(playlistID);
            }}>
            Search
        </button>
        </div>
      </div >
    );   
}

function validateAndExtractSpotifyId(url) {
    const pattern = /^https?:\/\/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)$/;
    const match = url.match(pattern);
    if (match) {
      return match[1]; // Returns the extracted playlist ID
    }
    return null; // Returns null if the URL is invalid
  }
  

// input box and search button
export default PlaylistLinkBox;
