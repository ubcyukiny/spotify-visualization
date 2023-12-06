import { useRef, useEffect, useState, useContext } from "react";
import SelectionTreeChart from "../charts/SelectionTreeChart/SelectionTreeChart";
import SelectionTreeSearchBar from "../components/SelectionTree/SelectionTreeSearchBar";
import axios from "axios";
import { useSpotifyAuth } from "../context/SpotifyAuthContext";
import { SelectedSongsContext } from "../context/SelectedSongsContext";

export default function SelectionTreeView() {
  const { spotifyAccessToken } = useSpotifyAuth();
  const accessToken = spotifyAccessToken;
  const selectionTreeChartRef = useRef(null);
  const [selectionTreeChart, setSelectionTreeChart] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isInitialSongSelected, setIsInitialSongSelected] = useState(false);
  const {
    selectedSongs,
    selectedPlaylistId,
    addSong,
    setPlaylistId,
    appMode,
    setAppMode,
    moreSongsCanBeAdded,
    isSongAlreadyAdded
  } = useContext(SelectedSongsContext);

  const fetchAudioFeatures = async (trackIds) => {
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
      return response.data.audio_features;
    } catch (error) {
      console.error("Error fetching track features", error);
    }
  };

  useEffect(() => {
    if (!selectedNode) return;

    const getRecommendations = async (node) => {
      if (!isSongAlreadyAdded(node.track)) {
        if (!moreSongsCanBeAdded()) {
            alert("Song limit reached");
            setSelectedNode(null);
            return;
        }
       addSong(node.selectionContext);
      }

      const numChildren = 2;
      try {
        const response = await axios.get(
          "https://api.spotify.com/v1/recommendations",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              seed_tracks: node.track.id,
            },
          }
        );
        const childrenData = response.data.tracks.slice(0, numChildren);
        let childrenIds = "";

        const childrenTracks = childrenData.map((data) => {
          childrenIds += data.id + ",";
          return {
            name: data.name,
            id: data.id,
            albumCover: data.album.images[0].url,
            artists: data.artists.map((artist) => artist.name),
            duration_ms: data.duration_ms,
            uri: data.uri,
          };
        });
        childrenIds = childrenIds.slice(0, -1);
        const audioFeatures = await fetchAudioFeatures(childrenIds);
        const childrenNodes = audioFeatures.map((features, index) => {
          return {
            track: {
              ...childrenTracks[index],
              ...features,
            },
            selected: false,
            selectionContext: { ...childrenData[index], features: [features] },
            children: [],
          };
        });
        node.children = childrenNodes;
        selectionTreeChart.updateVis();
        setSelectedNode(null);
      } catch (error) {
        console.log(error);
      }
    };

    getRecommendations(selectedNode);
  }, [selectedNode]);

  useEffect(() => {
    const selectionTreeChart = new SelectionTreeChart(
      { parentElement: selectionTreeChartRef.current },
      {},
      setSelectedNode
    );
    setSelectionTreeChart(selectionTreeChart);
  }, []);

  const selectInitialSong = async (track) => {
    const audioFeatures = await fetchAudioFeatures(track.id);
    const artists = track.artists.map((artist) => artist.name);
    const rootTrack = {
      name: track.name,
      albumCover: track.album.images[0].url,
      id: track.id,
      artists: artists,
      ...audioFeatures[0],
    };
    const tree = {
      track: rootTrack,
      children: [],
      selected: true,
      selectionContext: { ...track, features: [audioFeatures[0]] },
    };
    selectionTreeChart.data = tree;
    selectionTreeChart.updateVis();
    setIsInitialSongSelected(true);
  };

  return (
    <div className="selection-tree-container">
      <SelectionTreeSearchBar setInitialSong={selectInitialSong} />
      {isInitialSongSelected ? (
        <h6>
          Explore similar songs by following down a branching tree of similar
          tracks
        </h6>
      ) : (
        <h6 className="selection-tree-guidence">
          Search and select a song to proceed.
        </h6>
      )}

      <svg ref={selectionTreeChartRef} id="selectionTreeChart"></svg>
      <div id="selectionTreeTooltip" className="selection-tree-tooltip"></div>
    </div>
  );
}
