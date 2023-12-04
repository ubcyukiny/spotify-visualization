import { useEffect, useState, useContext } from "react";
import { useRef } from "react";
import HeatMap from "../charts/HeatMap/HeatMap";
import { useSpotifyAuth } from "../context/SpotifyAuthContext";
import axios from "axios";
import { SelectedSongsContext } from "../context/SelectedSongsContext";


const HeatMapView = () => {
  const { spotifyAccessToken } = useSpotifyAuth();
  const accessToken = spotifyAccessToken;
  const heatMapRef = useRef(null);
  const [data, setData] = useState(null);
  const [heatMap, setHeatMap] = useState(null);
  const [tracks, setTracks] = useState(null);
  const [trackIds, setTrackIds] = useState('');
  const [trackAudioFeatures, setTrackAudioFeatures] = useState(null);
  const { addSong, removeSong, selectedSongs, selectedPlaylistId} = useContext(SelectedSongsContext);
  const numSongsToDisplay = 10;

  // use selectedPlaylistId from selectedSongsContext, if nothing is selected use default Today's Top Hits
  const [playlistID, setPlaylistID] = useState(selectedPlaylistId ? selectedPlaylistId : "37i9dQZF1DXcBWIGoYBM5M"); // id for Spotify's Today's Top Hits, default playlist for heatmap

  const handleHeatmapButtonClick = (trackData, currentText) => {
    if (currentText === '+') {
      // '+' is clicked, when playlist is full button is not clickable
        addSong(trackData);
        return '-';
    } else {
      // '-' is clicked
      removeSong(trackData.id);
      return '+';
    }
  }

    // listen to selectedPlaylistId
    useEffect (() => {
      if (selectedPlaylistId) {
        setPlaylistID(selectedPlaylistId);
      }
    }, [selectedPlaylistId])

  // Keep track of selectedSongs, update buttons in heatmap according to it
  useEffect(() => {
    if (heatMap && selectedSongs) {
      heatMap.updateButtonStates(selectedSongs);
    }
  }, [selectedSongs, heatMap]);

  useEffect(() => {
    const heatMap = new HeatMap({ parentElement: heatMapRef.current, handleHeatmapButtonClick: handleHeatmapButtonClick }, []);
    setHeatMap(heatMap);
  }, []);

  // if logged in or playlistID changes
  useEffect(() => {
    if (accessToken && playlistID && heatMap) {
      const fetchData = async () => {
        try {
          // First API call, get playlist image, title
          const playlistResponse = await axios.get(
            `https://api.spotify.com/v1/playlists/${playlistID}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              params: {
                fields: "images(url), name, description",
              },
            }
          );
          heatMap.playlist.playlistID = playlistID;
          heatMap.playlist.playlistTitle = playlistResponse.data.name;
          heatMap.playlist.playlistImageUrl =
            playlistResponse.data.images[0].url;
          heatMap.playlist.playlistUrl = `https://open.spotify.com/playlist/${playlistID}`;
          heatMap.playlist.playlistDescription =
            playlistResponse.data.description;

          // Second API call, get trackIds
          const tracksResponse = await axios.get(
            `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              params: {
                // fields: 'items(track(album(images),artists(name),id,name, external_urls))',
                limit: numSongsToDisplay,
                offset: 0,
              },
            }
          );
          setTracks(tracksResponse.data.items);
          setTrackIds(
            tracksResponse.data.items.map((item) => item.track.id).join(",")
          );
        } catch (error) {
          console.error("Error during Spotify search", error);
        }
      };
      fetchData();
    }
  }, [accessToken, playlistID, heatMap]);

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
      let testArr = [];
      for (let i = 0; i < tracks.length; i++) {
        let testObj = { ...tracks[i].track, features: [trackAudioFeatures[i]] }
        testArr.push(testObj);
      }
      setData(testArr);

    }
  }, [trackAudioFeatures, tracks])

  useEffect(() => {
    if (!data) return;
    heatMap.data = data;
    heatMap.updateVis();
    heatMap.updateButtonStates(selectedSongs); // also check if playlist is full already
  }, [data]);

  return (
    <div className="heatmap-flex-container">
      <svg ref={heatMapRef} id="heatmap"></svg>
      <div id="heatmap-tooltip" />
    </div>
  );
}

export default HeatMapView;