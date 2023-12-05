import { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import { useSpotifyAuth } from "../context/SpotifyAuthContext";
import BoxPlot from "../charts/BoxPlot/BoxPlot";
import { SelectedSongsContext } from "../context/SelectedSongsContext";


const BoxPlotView = () => {
  const { spotifyAccessToken } = useSpotifyAuth();
  const accessToken = spotifyAccessToken;
  const boxPlotRef = useRef(null);
  const [data, setData] = useState(null);
  const [boxPlot, setBoxPlot] = useState(null);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistImage, setPlaylistImage] = useState('');
  const {selectedSongs, selectedPlaylistId } = useContext(SelectedSongsContext);
  const playlistId = selectedPlaylistId || '37i9dQZF1DXcBWIGoYBM5M'; // default playlist

  useEffect(() => {
    const boxPlot = new BoxPlot({ 
      parentElement: boxPlotRef.current 
    }, [], playlistName, playlistImage);
    setBoxPlot(boxPlot);
  }, [playlistName, playlistImage]);

  useEffect(() => {
    if (accessToken && playlistId) {
      const fetchData = async () => {
        try {
          // Fetch playlist details
          const playlistResponse = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          setPlaylistName(playlistResponse.data.name);
          setPlaylistImage(playlistResponse.data.images[0].url);
  
          // Fetch tracks from playlist
          const tracksResponse = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
              fields: 'items(track(id))',
              limit: 100,
              offset: 0,
            },
          });
          const fetchedTracks = tracksResponse.data.items.map(item => item.track);
          const fetchedTrackIds = fetchedTracks.map(track => track.id).join(',');
  
          // Fetch audio features for tracks
          if (fetchedTrackIds) {
            const audioFeaturesResponse = await axios.get(`https://api.spotify.com/v1/audio-features`, {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: { ids: fetchedTrackIds },
            });
            const audioFeatures = audioFeaturesResponse.data.audio_features;
  
            // Normalize and merge data
            const featureKeys = ['danceability', 'energy', 'loudness', 'speechiness', 'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo'];
            let featureMins = {};
            let featureMaxs = {};
  
            featureKeys.forEach(feature => {
              const featureValues = audioFeatures.map(feat => feat[feature]);
              featureMins[feature] = Math.min(...featureValues);
              featureMaxs[feature] = Math.max(...featureValues);
            });
  
            let mergedData = fetchedTracks.map((track, index) => {
              let normalizedFeatures = {};
              featureKeys.forEach(feature => {
                normalizedFeatures[feature] = ((audioFeatures[index][feature] - featureMins[feature]) / (featureMaxs[feature] - featureMins[feature])) * 10;
              });
  
              return {
                track_id: track.id,
                ...normalizedFeatures
              };
            });
  
            setData(mergedData);
          }
        } catch (error) {
          console.error("Error fetching playlist data", error);
        }
      };
  
      fetchData();
    }
  }, [accessToken, playlistId]);
  

  // Update BoxPlot
  useEffect(() => {
    if (!data) return;
    boxPlot.data = data;
    boxPlot.updateVis();
  }, [data]);

  return (
    <div>
      <svg ref={boxPlotRef} id="boxplot"></svg>
    </div>
  );
}

export default BoxPlotView;
