import { useEffect, useContext, useState } from "react";
import { SelectedSongsContext } from "../context/SelectedSongsContext";
import RadarChart from "../charts/RadarChart/RadarChart";
import { useRef } from "react";

const buildSongData = (originalData) => {
  const { name, album, artists, duration_ms, features } = originalData;

  const artistName = artists[0].name;
  const cover = album?.images[0].url;
  const normalizeLoudness = (loudness) => ((loudness + 60) / 60) * 10;
  const normalizeFeature = (value) => value * 10;
  const mappedFeatures = features
    .flatMap((feature) => {
      return [
        {
          axis: "instrumentalness",
          value: normalizeFeature(feature.instrumentalness),
        },
        { axis: "danceability", value: normalizeFeature(feature.danceability) },
        { axis: "energy", value: normalizeFeature(feature.energy) },
        { axis: "valence", value: normalizeFeature(feature.valence) },
        { axis: "loudness", value: normalizeLoudness(feature.loudness) },
        { axis: "speechiness", value: normalizeFeature(feature.speechiness) },
        { axis: "acousticness", value: normalizeFeature(feature.acousticness) },
        { axis: "liveness", value: normalizeFeature(feature.liveness) },
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

const RadarChartView = () => {
  const radarChartRef = useRef(null);
  const [songData, setSongData] = useState(null);
  const { selectedSongs } = useContext(SelectedSongsContext);
  const [radarChart, setRadarChart] = useState(null);
  

  useEffect(() => {
    const radarChart = new RadarChart(
      { parentElement: radarChartRef.current },
      []
    );
    setRadarChart(radarChart);

  }, []);

  useEffect(() => {
    const newSongData = selectedSongs.map((song) => {
      return buildSongData(song);
    });
    // console.log(newSongData);
    setSongData(newSongData);
  }, [selectedSongs]);

  useEffect(() => {
    if (!songData) return;
    radarChart.data = songData;
    radarChart.updateVis();
  }, [songData]);

  // Sample data:
//    [{
//           name: "something",
//           artist: "name",
//           duration_ms: 123123,
//           features: [
//             { axis: "danceability", value: 1 },
//             { axis: "energy", value: 2 },
//             { axis: "valence", value: 3 },
//             { axis: "loudness", value: 1 },
//             { axis: "speechiness", value: 2 },
//             { axis: "acousticness", value: 3 },
//             { axis: "instrumentalness", value: 1 },
//             { axis: "liveness", value: 2 },
//           ]
//         }]

  
  useEffect(() => {}, []);

  return (
    <div>
      <svg ref={radarChartRef} id="radarchart"></svg>
      <div id="radarTooltip" className="radar-tooltip"/>
    </div>
  );
};
export default RadarChartView;
