import { useEffect, useContext, useState } from "react";
import { SelectedSongsContext } from "../context/SelectedSongsContext";
import RadarChart from "../charts/RadarChart/RadarChart";
import { useRef } from "react";
import * as d3 from "d3";

const buildSongData = (originalData) => {
  const { name, album, artists, duration_ms, features } = originalData;
  const id = originalData.id;
  const artistName = artists[0].name;
  const cover = album?.images[0].url;
  const normalizeLoudness = (loudness) => ((loudness + 60) / 60) * 10;
  const normalizeFeature = (value) => value * 10;
  const mappedFeatures = features.flatMap((feature) => {
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
    id,
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
  const { selectedSongs, removeSong } = useContext(SelectedSongsContext);
  const [radarChart, setRadarChart] = useState(null);

  useEffect(() => {
    const radarChart = new RadarChart(
      { parentElement: radarChartRef.current},
      []
    );
    setRadarChart(radarChart);
  }, []);

  useEffect(() => {
    const newSongData = selectedSongs.map((song) => {
      return buildSongData(song);
    });
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

  const handleRemoveSong = (event) => {
    removeSong(event.target.getAttribute("remove-id"));

    d3.select("#radarTooltip")
      .style("opacity", 0)
      .style("pointer-events", "none");
  };

  return (
    <div className="plot-div">
      <div id="radarTooltip" className="radar-tooltip">
        <img className="tooltip-cover" alt="CoverImage"></img>
        <div className="tooltip-content"></div>
        <button className="tooltip-remove" onClick={handleRemoveSong}>
          Remove
        </button>
      </div>
      <div id="labelTooltip" className="label-tooltip"></div>
      <svg ref={radarChartRef} id="radarchart"></svg>
    </div>
  );
};
export default RadarChartView;
