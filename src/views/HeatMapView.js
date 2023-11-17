import { useEffect, useState } from "react";
import { useRef } from "react";
import HeatMap from "../charts/HeatMap/HeatMap";
import * as d3 from 'd3'


const HeatMapView = () => {
    const HeatMapRef = useRef(null);
    const [filteredData, setFilteredData] = useState(null);
    const [heatMap, setHeatMap] = useState(null);

    useEffect(() => {
        const heatMap = new HeatMap(
            { parentElement: HeatMapRef.current }, []
        );
        setHeatMap(heatMap);
    }, []);

    // // filterData
    useEffect(() => {
        d3.csv('/dataset.csv').then(loadedData => {
            // min max value of tempo, loudness, to normalize tempo and loudness to a range of 0 to 1
            const minTempo = 0;
            const maxTempo = 243;
            const minLoudness = -49.531;
            const maxLoudness = 4.532;
            // Filter data by popularity
            let filteredData = loadedData.filter(d => +d.popularity > 85);
            // remove duplicates, sort by desceending order by popularity, cuts top 100
            let uniqueDataMap = new Map();
            filteredData.forEach(item => uniqueDataMap.set(item.track_id, item));
            let uniqueDataArray = Array.from(uniqueDataMap.values());
            // sort by desceending order by popularity
            uniqueDataArray.sort((a, b) => b.popularity - a.popularity);
            // cuts top 25
            let top25 = uniqueDataArray.slice(0, 25);
            // change explicit to 1 or 0, normalized tempo, loudnesss
            top25.forEach(d => {
              d.explicit === 'True' ? d.explicit = 1 : d.explicit = 0;
              d.tempo = (d.tempo - minTempo) / (maxTempo - minTempo);
              d.loudness = (d.loudness - minLoudness) / (maxLoudness - minLoudness);
            })
            setFilteredData(top25);
          })
    }, []);

    useEffect(() => {
        if (heatMap && filteredData) {
            heatMap.data = filteredData;
            heatMap.updateVis();
        }
      }, [filteredData, heatMap]);


    return (
        <div>
            <svg ref={HeatMapRef} id="heatmap"></svg>
            <div id="heatmap-tooltip" />
        </div>
    );
}

export default HeatMapView;