import React, { useState } from "react";
import axios from "axios";
import { useSpotifyAuth } from "../../context/SpotifyAuthContext";
import "./SearchBarStyle.css";

export default function SelectionTreeSearchBar({ setInitialSong }){
    const { spotifyAccessToken } = useSpotifyAuth();
    const accessToken = spotifyAccessToken;
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

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
        } catch (error) {
            console.error("Error during Spotify search", error);
        }
    };

    const fetchTrackFeatures = async (track) => {
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
            const artists = track.artists.map((artist) => artist.name);
            const rootTrack = {name: track.name, id: track.id, artists: artists, ...response.data.audio_features[0]};
            console.log(rootTrack);
            setInitialSong(rootTrack);

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
                        <button className="select-button" onClick={() => fetchTrackFeatures(track)} > Select </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
