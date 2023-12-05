import { useRef } from "react";
import SelectionTreeChart from "../charts/SelectionTreeChart/SelectionTreeChart";
import SelectionTreeSearchBar from "../components/SelectionTree/SelectionTreeSearchBar";
import axios from "axios";
import { useSpotifyAuth } from "../context/SpotifyAuthContext";

export default function SelectionTreeView() {
    const { spotifyAccessToken } = useSpotifyAuth();
    const accessToken = spotifyAccessToken;
    const selectionTreeChartRef = useRef(null);

    const fetchAudioFeatures = async (trackIds) => {
        try {
            const response = await axios.get(
                `https://api.spotify.com/v1/audio-features`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    params: {
                        ids: trackIds
                    }
                }
            );
            return response.data.audio_features;
        } catch (error) {
            console.error("Error fetching track features", error);
        }
    }

    const getRecommendations = async (node) => {
        const numChildren = 2;
        try {
            const response = await axios.get(
                'https://api.spotify.com/v1/recommendations',
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    params: {
                        seed_tracks: node.track.id
                    }
                });
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
                    uri: data.uri
                }
            });
            childrenIds = childrenIds.slice(0, -1);
            const audioFeatures = await fetchAudioFeatures(childrenIds);
            const childrenFeatures = audioFeatures.map((track, index) => {
                return {
                    track: {
                        ...childrenTracks[index],
                        ...track
                    },
                    selected: false,
                    children:[]
                }
            });
            node.children = childrenFeatures;
            selectionTreeChart.updateVis();
        } catch(error) {
            console.log(error);
        }
    }

    const selectionTreeChart = new SelectionTreeChart(
        { parentElement: selectionTreeChartRef.current },
        {},
        getRecommendations
    );

    const selectInitialSong = async (track) => {
        const audioFeatures = await fetchAudioFeatures(track.id);
        const artists = track.artists.map((artist) => artist.name);
        const rootTrack = {name: track.name, albumCover: track.album.images[0].url, id: track.id, artists: artists, ...audioFeatures[0]};
        const tree = {track: rootTrack, children: [], selected: true};
        selectionTreeChart.data = tree;
        selectionTreeChart.updateVis();
    }

    return (
        <div>
            <SelectionTreeSearchBar setInitialSong={selectInitialSong} />
            <svg ref={selectionTreeChartRef} id="selectionTreeChart"></svg>
            <div id="selectionTreeTooltip" className="selection-tree-tooltip"></div>
        </div>
    );
}
