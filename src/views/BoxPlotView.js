import { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import { useSpotifyAuth } from "../context/SpotifyAuthContext";
import BoxPlot from "../charts/BoxPlot/BoxPlot";
import { SelectedSongsContext } from "../context/SelectedSongsContext";

const buildSongData = (originalData) => {
  const { name, album, artists, duration_ms, features } = originalData;
  const artistName = artists[0].name;
  const cover = album?.images[0].url;
  const minTempo = 0;
  const maxTempo = 243.372;
  const normalizeLoudness = (loudness) => ((loudness + 60) / 60) * 10;
  const normalizeFeature = (value) => value * 10;
  const normalizeTempo = (tempo) => (tempo - minTempo) / (maxTempo - minTempo);
  const mappedFeatures = features
    .flatMap((feature) => {
      return [
        {
          axis: "instrumentalness",
          value: normalizeFeature(feature.instrumentalness),
        },
        { axis: "danceability", value: normalizeFeature(feature.danceability) },
        { axis: "energy", value: normalizeFeature(feature.energy) },
        { axis: "loudness", value: normalizeLoudness(feature.loudness) },
        { axis: "speechiness", value: normalizeFeature(feature.speechiness) },
        { axis: "acousticness", value: normalizeFeature(feature.acousticness) },
        { axis: "liveness", value: normalizeFeature(feature.liveness) },
        { axis: "valence", value: normalizeFeature(feature.valence) },
        { axis: "tempo", value: normalizeTempo(feature.tempo)}
      ];
    }); 

  return {
    name,
    cover,
    artist: artistName,
    duration_ms,
    features: mappedFeatures,
  };
};

const BoxPlotView = () => {
  const { spotifyAccessToken } = useSpotifyAuth();
  const accessToken = spotifyAccessToken;
  const boxPlotRef = useRef(null);
  const [data, setData] = useState(null);
  const [songData, setSongData] = useState(null);
  const [boxPlot, setBoxPlot] = useState(null);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistImage, setPlaylistImage] = useState('');
  const {selectedSongs, selectedPlaylistId } = useContext(SelectedSongsContext);
  const playlistId = selectedPlaylistId || '37i9dQZF1DXcBWIGoYBM5M'; // default playlist

  useEffect(() => {
    const newBoxPlot = new BoxPlot({
      parentElement: boxPlotRef.current
    }, [], playlistName, playlistImage, songData);
    setBoxPlot(newBoxPlot);
  }, []);

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
  
  useEffect(() => {
    const newSongData = selectedSongs.map((song) => {
      return buildSongData(song);
    });
    setSongData(newSongData);
  }, [selectedSongs]);

  // Update BoxPlot
  useEffect(() => {
    if (boxPlot && data && songData) {
      boxPlot.data = data;
      boxPlot.songData = songData;
      boxPlot.playlistName = playlistName;
      boxPlot.playlistImage = playlistImage;
      boxPlot.updateVis();
    }
  }, [boxPlot, data, songData, playlistName, playlistImage]);

  return (
    <div className="plot-div">
      <svg ref={boxPlotRef} id="boxplot"></svg>
    </div>
  );
}

export default BoxPlotView;
