import React, { useEffect } from "react";
import { useState } from "react";
import { useSpotifyAuth } from "../../context/SpotifyAuthContext";
import SpotifyLogin from "../../components/SpotifyLogin/SpotifyLogin";
import SearchBar from "../../components/SeachBar/SearchBar";
import RadarChartView from "../RadarChartView";
import SelectedSongsList from "../../components/SelectedSongsList/SelectedSongsList";
import SelectionTreeView from "../SelectionTreeView";
import HeatMapView from "../HeatMapView";
import BoxPlotView from "../BoxPlotView";
import "./style.css";
import { useContext } from "react";
import { SelectedSongsContext } from "../../context/SelectedSongsContext";

const GeneralView = () => {
  const { spotifyAccessToken } = useSpotifyAuth();
  const [panelMode, setPanelMode] = useState("explore"); // explore or overview

  return (
    <div>
      {!spotifyAccessToken ? (
        <SpotifyLogin />
      ) : (
        <div className="general-view-container">
          <div className="left-section">
            <div className="flow-section">
              <SearchBar />
              <SelectedSongsList />
            </div>
          </div>
          <div className="right-section">
            <SelectionTreeView />
            <RadarChartView />
            <HeatMapView />
            <BoxPlotView />
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralView;
