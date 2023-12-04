import React from 'react';
import { useSpotifyAuth } from '../context/SpotifyAuthContext';
import SpotifyLogin from '../components/SpotifyLogin/SpotifyLogin';
import SearchBar from '../components/SeachBar/SearchBar';
import RadarChartView from './RadarChartView';
import SelectedSongsList from '../components/SelectedSongsList/SelectedSongsList';
import SelectionTreeView from './SelectionTreeView';
import HeatMapView from './HeatMapView';
import BoxPlotView from './BoxPlotView';

const GeneralView = () => {
    const { spotifyAccessToken } = useSpotifyAuth();
    return (
      <div>
        {!spotifyAccessToken ? (
          <SpotifyLogin />
        ) : (
          <div>
            <SearchBar />
            <RadarChartView />
            <SelectedSongsList />
            <SelectionTreeView />
            <HeatMapView />
            <BoxPlotView />
          </div>
        )}
      </div>
    );

}

export default GeneralView;