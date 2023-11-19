import { useEffect, useContext, useState, useRef } from "react";
import SelectionTreeChart from "../charts/SelectionTreeChart/SelectionTreeChart";


export default function SelectionTreeView() {
    const sample =  [{
        name: "something",
        artist: "name",
        duration_ms: 123123,
        features: [
            { axis: "danceability", value: 1 },
            { axis: "energy", value: 2 },
            { axis: "valence", value: 3 },
            { axis: "loudness", value: 1 },
            { axis: "speechiness", value: 2 },
            { axis: "acousticness", value: 3 },
            { axis: "instrumentalness", value: 1 },
            { axis: "liveness", value: 2 },
        ]
    }];

    const selectionTreeChartRef = useRef(null);
    const [tree, setTree] = useState(sample);



    useEffect(() => {
        const selectionTreeChart = new SelectionTreeChart(
            { parentElement: selectionTreeChartRef.current }, null
        );
        console.log(tree);
    }, []);

    useEffect(() => {

        // const selectionTree = new SelectionTree();
        // SelectionTreeChart.updateVis(tree);

    }, [tree]);

    return (
        <div>
            <svg ref={selectionTreeChartRef} id="selectionTreeChart"></svg>
        </div>
    );
}
