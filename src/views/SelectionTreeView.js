import { useEffect, useState, useRef } from "react";
import SelectionTreeChart from "../charts/SelectionTreeChart/SelectionTreeChart";
import SelectionTreeSearchBar from "../components/SelectionTree/SelectionTreeSearchBar";

export default function SelectionTreeView() {
    const sample = {
        "name":"CEO",
        "children":[{
            "name":"boss1",
            "colname":"level2",
            "children":[
                {"name":"mister_a","colname":"level3"},
                {"name":"mister_b","colname":"level3"},
                {"name":"mister_c","colname":"level3"},
                {"name":"mister_d","colname":"level3"}
            ]}, {
            "name":"boss2",
            "colname":"level2",
            "children":[
                {"name":"mister_e","colname":"level3"},
                {"name":"mister_f","colname":"level3"},
                {"name":"mister_g","colname":"level3"},
                {"name":"mister_h","colname":"level3"}
            ]}]
    };

    const selectionTreeChartRef = useRef(null);
    const [initialSong, setInitialSong] = useState();
    const [tree, setTree] = useState(sample);

    const selectionTreeChart = new SelectionTreeChart(
        { parentElement: selectionTreeChartRef.current }, tree
    );


    useEffect(() => {
        const tree = {track: initialSong, children: []};
        console.log(tree);
        selectionTreeChart.data = tree;
        console.log("root selected");
        selectionTreeChart.updateVis();
    }, [initialSong]);

    return (
        <div>
            <SelectionTreeSearchBar setInitialSong={setInitialSong} />
            <svg ref={selectionTreeChartRef} id="selectionTreeChart"></svg>
        </div>
    );
}
