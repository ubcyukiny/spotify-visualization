import { useEffect, useState, useRef } from "react";
import SelectionTreeChart from "../charts/SelectionTreeChart/SelectionTreeChart";
import SelectionTreeSearchBar from "../components/SelectionTree/SelectionTreeSearchBar";
import axios from "axios";
import { useSpotifyAuth } from "../context/SpotifyAuthContext";

export default function SelectionTreeView() {
    const { spotifyAccessToken } = useSpotifyAuth();
    const accessToken = spotifyAccessToken;

    const sample = {
        name:"CEO",
        children:[{
            name:"boss1",
            colname:"level2",
            children:[
                {name:"mister_a",colname:"level3"},
                {name:"mister_b",colname:"level3"},
                {name:"mister_c",colname:"level3"},
                {name:"mister_d",colname:"level3"}
            ]}, {
            name:"boss2",
            colname:"level2",
            children:[
                {name:"mister_e",colname:"level3"},
                {name:"mister_f",colname:"level3"},
                {name:"mister_g",colname:"level3"},
                {name:"mister_h",colname:"level3"}
            ]}]
    };

    const sampleTracks = [
        {
            track: {
                "name": "Faith",
                "id": "59eAcAyhYSLi5GKFrgHJzG",
                "artists": [
                    "George Michael"
                ],
                "danceability": 0.915,
                "energy": 0.497,
                "key": 11,
                "loudness": -10.435,
                "mode": 1,
                "speechiness": 0.102,
                "acousticness": 0.00547,
                "instrumentalness": 0.000108,
                "liveness": 0.067,
                "valence": 0.553,
                "tempo": 95.852,
                "type": "audio_features",
                "uri": "spotify:track:59eAcAyhYSLi5GKFrgHJzG",
                "track_href": "https://api.spotify.com/v1/tracks/59eAcAyhYSLi5GKFrgHJzG",
                "analysis_url": "https://api.spotify.com/v1/audio-analysis/59eAcAyhYSLi5GKFrgHJzG",
                "duration_ms": 194493,
                "time_signature": 4
            }
        },
        {
            track: {
                "name": "anjoom",
                "id": "59eAcAyhYSLi5GKFrgHJzG",
                "artists": [
                    "George Michael"
                ],
                "danceability": 0.915,
                "energy": 0.497,
                "key": 11,
                "loudness": -10.435,
                "mode": 1,
                "speechiness": 0.102,
                "acousticness": 0.00547,
                "instrumentalness": 0.000108,
                "liveness": 0.067,
                "valence": 0.553,
                "tempo": 95.852,
                "type": "audio_features",
                "uri": "spotify:track:59eAcAyhYSLi5GKFrgHJzG",
                "track_href": "https://api.spotify.com/v1/tracks/59eAcAyhYSLi5GKFrgHJzG",
                "analysis_url": "https://api.spotify.com/v1/audio-analysis/59eAcAyhYSLi5GKFrgHJzG",
                "duration_ms": 194493,
                "time_signature": 4
            }
        },
        {
            track: {
                "name": "samia",
                "id": "59eAcAyhYSLi5GKFrgHJzG",
                "artists": [
                    "George Michael"
                ],
                "danceability": 0.915,
                "energy": 0.497,
                "key": 11,
                "loudness": -10.435,
                "mode": 1,
                "speechiness": 0.102,
                "acousticness": 0.00547,
                "instrumentalness": 0.000108,
                "liveness": 0.067,
                "valence": 0.553,
                "tempo": 95.852,
                "type": "audio_features",
                "uri": "spotify:track:59eAcAyhYSLi5GKFrgHJzG",
                "track_href": "https://api.spotify.com/v1/tracks/59eAcAyhYSLi5GKFrgHJzG",
                "analysis_url": "https://api.spotify.com/v1/audio-analysis/59eAcAyhYSLi5GKFrgHJzG",
                "duration_ms": 194493,
                "time_signature": 4
            }
        }
    ];

    const selectionTreeChartRef = useRef(null);
    const [initialSong, setInitialSong] = useState(null);
    const [tree, setTree] = useState(sample);
    const [recommedations, setRecommedations] = useState(null);

    // const getRecommendations = async (node) => {
    const getRecommendations = (node) => {
        try {
            const response = JSON.parse(JSON.stringify(sampleTracks));
            // const response = await axios.get(
            //     'https://api.spotify.com/v1/recommendations',
            //     {
            //         headers: {
            //             Authorization: `Bearer ${accessToken}`,
            //         },
            //         params: {
            //             seed_tracks: node.track.id
            //         }
            //     });
            // console.log(response.data.tracks.slice(2));
            // setRecommedations(response.data.tracks);
            // track.children = response;
            // setRecommedations(response);
            node.children = response;
            // console.log('new node');
            // console.log(node);
            selectionTreeChart.updateVis(); 
            return response;

        } catch(error) {
            console.log(error);
        }
    }

    const selectionTreeChart = new SelectionTreeChart(
        { parentElement: selectionTreeChartRef.current },
        tree,
        getRecommendations
    );

    useEffect(() => {
        if (!initialSong)
            return;

        const tree = {track: initialSong, children: []};
        selectionTreeChart.data = tree;
        selectionTreeChart.updateVis();
    }, [initialSong]);

    // useEffect(() => {
    //     if (!initialSong)
    //         return;

    //     (async () => {
    //         const response = await getRecommendations(initialSong);
    //         console.log(response);
    //     })();

    // }, [recommedations]);

    // useEffect(() => {
    //     if (!initialSong)
    //         return;

    //     console.log(selectedNode);
    // }, [selectedNode]);

    return (
        <div>
            <SelectionTreeSearchBar setInitialSong={setInitialSong} />
            <svg ref={selectionTreeChartRef} id="selectionTreeChart"></svg>
            <div id="selectionTreeTooltip" className="selection-tree-tooltip"></div>
        </div>
    );
}
