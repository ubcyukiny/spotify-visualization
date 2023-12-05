import "./App.css";
import SearchBar from "./components/SeachBar/SearchBar";
import RadarChartView from "./views/RadarChartView";
import { SpotifyAuthProvider } from "./context/SpotifyAuthContext";
import { SelectedSongsProvider } from "./context/SelectedSongsContext";
import SelectedSongsList from "./components/SelectedSongsList/SelectedSongsList";
import HeatMapView from "./views/HeatMapView";
import BoxPlotView from "./views/BoxPlotView"
import SpotifyLogin from "./components/SpotifyLogin/SpotifyLogin";
import SelectionTreeView from "./views/SelectionTreeView";
import GeneralView from "./views/GeneralView/GeneralView";
// import SelectionTree from "./components/SelectionTree/SelectionTree";

function App() {
  return (
    <SpotifyAuthProvider>
      <SelectedSongsProvider>
        <div className="App">
          <div className="body">
            <GeneralView />
          </div>
        </div>
      </SelectedSongsProvider>
    </SpotifyAuthProvider>
  );
}

export default App;
