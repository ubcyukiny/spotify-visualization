import { useEffect, useState } from "react";
import { useRef } from "react";
import HeatMap from "../charts/HeatMap/HeatMap";
import { useSpotifyAuth } from "../context/SpotifyAuthContext";
import axios from "axios";

const HeatMapView = () => {
  const { spotifyAccessToken } = useSpotifyAuth();
  const accessToken = spotifyAccessToken;
  const heatMapRef = useRef(null);
  const [data, setData] = useState(null);
  const [heatMap, setHeatMap] = useState(null);
  const [tracks, setTracks] = useState(null);
  const [trackIds, setTrackIds] = useState('');
  const [trackAudioFeatures, setTrackAudioFeatures] = useState(null);
  const numSongsToDisplay = 25;

  useEffect(() => {
    const heatMap = new HeatMap({ parentElement: heatMapRef.current }, []);
    setHeatMap(heatMap);
  }, []);

  // if logged in
  useEffect(() => {
    if (accessToken) {
      // get track id, artists, track_name, album image url, externalUrl to spotify song page
      const getTracksFromPlaylist = async () => {
        try {
          const response = await axios.get("https://api.spotify.com/v1/playlists/37i9dQZF1DXcBWIGoYBM5M/tracks", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              fields: 'items(track(album(images),artists(name),id,name, external_urls))',
              limit: numSongsToDisplay,
              offset: numSongsToDisplay
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

  // when trackIds is set from getTracksFromPlaylist
  useEffect(() => {
    if (trackIds) {
      // get audio features like tempo
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

  // when audioFeatures and tracks are set, merge 2 into array of objects for heatmap
  useEffect(() => {
    if (tracks && trackAudioFeatures) {
      let resultArr = [];
      for (let i = 0; i < tracks.length; i++) {
        const { album, artists, name: track_name, id: track_id, external_urls } = tracks[i].track;
        const artistsString = artists.map(({ name }) => name).join('; ');
        // attributess to omit
        const { time_signature, duration_ms, track_href, analysis_url, type, uri, id, mode, key, ...audioFeatures }
          = trackAudioFeatures[i];
        let resultObj = { album, track_name, track_id, artists: artistsString, external_urls, ...audioFeatures };
        resultArr.push(resultObj);
      }
      console.log(resultArr);
      setData(resultArr);
    }
  }, [trackAudioFeatures, tracks])

  useEffect(() => {
    if (!data) return;
    // process data
    let processedData = data;
    const minTempo = 0;
    const maxTempo = 243;
    const minLoudness = -49.531;
    const maxLoudness = 4.532;
    //normalized tempo, loudnesss
    processedData.forEach(d => {
      d.tempo = (d.tempo - minTempo) / (maxTempo - minTempo);
      d.loudness = (d.loudness - minLoudness) / (maxLoudness - minLoudness);
    })
    heatMap.data = processedData;
    heatMap.updateVis();
  }, [data]);

  return (
    <div>
      <svg ref={heatMapRef} id="heatmap"></svg>
      <div id="heatmap-tooltip" />
    </div>
  );
}

export default HeatMapView;