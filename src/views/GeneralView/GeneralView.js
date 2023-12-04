import React from 'react';
import { useSpotifyAuth } from '../../context/SpotifyAuthContext';
import SpotifyLogin from '../../components/SpotifyLogin/SpotifyLogin';
import SearchBar from '../../components/SeachBar/SearchBar';
import RadarChartView from '../RadarChartView';
import SelectedSongsList from '../../components/SelectedSongsList/SelectedSongsList';
import SelectionTreeView from '../SelectionTreeView';
import HeatMapView from '../HeatMapView';
import BoxPlotView from '../BoxPlotView';
import './style.css';

const GeneralView = () => {
    const { spotifyAccessToken } = useSpotifyAuth();
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
            <div className="right-column">
              <RadarChartView />
              <SelectionTreeView />
              <HeatMapView />
              <BoxPlotView />
            </div>
          </div>
        )}
      </div>
    );

}

export default GeneralView;