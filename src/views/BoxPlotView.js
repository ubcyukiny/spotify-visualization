import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSpotifyAuth } from "../context/SpotifyAuthContext";
import BoxPlot from "../charts/BoxPlot/BoxPlot";


const BoxPlotView = () => {
  const { spotifyAccessToken } = useSpotifyAuth();
  const accessToken = spotifyAccessToken;
  const boxPlotRef = useRef(null);
  const [data, setData] = useState(null);
  const [boxPlot, setBoxPlot] = useState(null);
  const [tracks, setTracks] = useState(null);
  const [trackIds, setTrackIds] = useState('');
  const [trackAudioFeatures, setTrackAudioFeatures] = useState(null);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistImage, setPlaylistImage] = useState('');
  
  useEffect(() => {
    const boxPlot = new BoxPlot({ 
      parentElement: boxPlotRef.current 
    }, [], playlistName, playlistImage);
    setBoxPlot(boxPlot);
  }, [playlistName, playlistImage]);

// Fetch playlist details
  useEffect(() => {
    if (accessToken) {
      const getPlaylistDetails = async () => {
        try {
          const playlistResponse = await axios.get(`https://api.spotify.com/v1/playlists/37i9dQZF1E4tdxMl5gZ0gR`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            }
          });
          setPlaylistName(playlistResponse.data.name);
          setPlaylistImage(playlistResponse.data.images[0].url);
        } catch (error) {
          console.error("Error during Spotify data fetch", error);
        }
      };
      getPlaylistDetails();
    }
  }, [accessToken]);

  // Fetch tracks data
  useEffect(() => {
    if (accessToken) {
      const getTracksFromPlaylist = async () => {
        try {
          const response = await axios.get("https://api.spotify.com/v1/playlists/37i9dQZF1E4tdxMl5gZ0gR/tracks", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              fields: 'items(track(album(images),artists(name),id,name, external_urls))',
              limit: 100,
              offset: 0,
            },
          });
          setTracks(response.data.items);
          setTrackIds(response.data.items.map(item => item.track.id).join(','));
        } catch (error) {
          console.error("Error during Spotify search", error);
        }
      };
      getTracksFromPlaylist();
    }
  }, [accessToken]);

  // Fetch track audio features
  useEffect(() => {
    if (trackIds) {
      const fetchTrackFeatures = async () => {
        try {
          const response = await axios.get(
            `https://api.spotify.com/v1/audio-features`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              params: {
                ids: trackIds,
              },
            }
          );
          setTrackAudioFeatures(response.data.audio_features);
        } catch (error) {
          console.error("Error fetching track features", error);
        }
      };
      fetchTrackFeatures();
    }
  }, [trackIds, accessToken])

  // Merge tracks and audio features
  useEffect(() => {
    if (tracks && trackAudioFeatures) {
      const featureKeys = ['danceability', 'energy', 'loudness', 'speechiness', 'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo'];
      let featureMins = {};
      let featureMaxs = {};
  
      featureKeys.forEach(feature => {
        const featureValues = trackAudioFeatures.map(feat => feat[feature]);
        featureMins[feature] = Math.min(...featureValues);
        featureMaxs[feature] = Math.max(...featureValues);
      });
  
      let mergedData = tracks.map((trackItem, index) => {
        const { album, artists, name: track_name, id: track_id, external_urls } = trackItem.track;
        const artistsString = artists.map(({ name }) => name).join('; ');
        const audioFeatures = trackAudioFeatures[index];
  
        // Normalize features
        let normalizedFeatures = {};
        featureKeys.forEach(feature => {
          normalizedFeatures[feature] = ((audioFeatures[feature] - featureMins[feature]) / (featureMaxs[feature] - featureMins[feature])) * 10;
        });
  
        return {
          album, 
          track_name, 
          track_id, 
          artists: artistsString, 
          external_urls, 
          ...normalizedFeatures 
        };
      });
  
      console.log(mergedData);
      setData(mergedData);
    }
  }, [trackAudioFeatures, tracks]);

  // Update BoxPlot
  useEffect(() => {
    if (!data) return;
    boxPlot.data = data;
    boxPlot.updateVis();
  });

  return (
    <div>
      <svg ref={boxPlotRef} id="boxplot"></svg>
    </div>
  );
}

export default BoxPlotView;
