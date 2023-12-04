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
  const { appMode } = useContext(SelectedSongsContext);
  const [panelMode, setPanelMode] = useState("explore"); // explore or overview

  useEffect(() => {
    if(appMode === "playlist") {
      setPanelMode("overview");
    }
  }
  , [appMode]);

  return (
    <div>
      {!spotifyAccessToken ? (
        <SpotifyLogin />
      ) : (
        <div className="general-view-container">
          <div className="left-section">
            <SearchBar />
            <SelectedSongsList />
          </div>
          <div className="right-section">
            <div className="mode-button-container">
              <button
                className={`mode-button ${
                  panelMode === "explore" ? "selected" : ""
                }`}
                onClick={() => setPanelMode("explore")}
                disabled={appMode === "playlist"}
              >
                Explore
              </button>
              <button
                className={`mode-button ${
                  panelMode === "explore" ? "" : "selected"
                }`}
                onClick={() => setPanelMode("overview")}
              >
                Overview
              </button>
            </div>
            {panelMode === "explore" ? (
              <div className="explore-panel">
                <SelectionTreeView />
                <RadarChartView />
              </div>
            ) : (
              <div className="overview-panel">
                <HeatMapView />
                <BoxPlotView />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralView;
