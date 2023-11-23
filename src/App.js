import "./App.css";
import SearchBar from "./components/SeachBar/SearchBar";
import RadarChartView from "./views/RadarChartView";
import { SpotifyAuthProvider } from "./context/SpotifyAuthContext";
import SpotifyLogin from "./components/SpotifyLogin";
import { SelectedSongsProvider } from "./context/SelectedSongsContext";
import SelectedSongsList from "./components/SelectedSongsList/SelectedSongsList";
import HeatMapView from "./views/HeatMapView";
import BoxPlotView from "./views/BoxPlotView"

import SelectionTreeView from "./views/SelectionTreeView";
// import SelectionTree from "./components/SelectionTree/SelectionTree";

function App() {
  return (
    <SpotifyAuthProvider>
      <SelectedSongsProvider>
        <div className="App">
          <header className="App-header">
            <SpotifyLogin />
            <SearchBar />
            <RadarChartView />
            <SelectedSongsList />
            <SelectionTreeView />
            <HeatMapView/>
            <BoxPlotView/>
          </header>
        </div>
      </SelectedSongsProvider>
    </SpotifyAuthProvider>
  );
}

export default App;
