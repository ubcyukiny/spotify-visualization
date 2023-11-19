import * as d3 from "d3";
// import "./style.css";

export default class SelectionTreeChart {
    /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 600,
            containerHeight: _config.containerHeight || 600,
            margin: _config.margin || { top: 20, right: 20, bottom: 20, left: 20 },
            tooltipPadding: _config.tooltipPadding || 15,
            chartOffset: _config.chartOffset || 300,
            labelFactor: _config.labelFactor || 1.3,
        };
        this.data = _data;
        this.initVis();
    }

    /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
    initVis() {
        let vis = this;

        // Calculate inner chart size. Margin specifies the space around the actual chart.
        vis.width =
            vis.config.containerWidth -
                vis.config.margin.left -
                vis.config.margin.right;

        vis.height =
            vis.config.containerHeight -
                vis.config.margin.top -
                vis.config.margin.bottom;

        vis.svg = d3
            .select(vis.config.parentElement)
            .attr("width", vis.config.containerWidth)
            .attr("height", vis.config.containerHeight);

        vis.chart = vis.svg
            .append("g")
            .attr(
                "transform",
                `translate(${vis.config.margin.left}, ${vis.config.margin.top})`
            );


        // vis.radarArea = vis.chart.append("g").attr("class", "radar-area");

        // Define size of SVG drawing area
    }

    /**
   * Prepare the data and scales before we render it.
   */
    updateVis() {

    }

    /**
   * Bind data to visual elements.
   */
    renderVis() {

    }
}


// const formatDuration = (duration_ms) => {
//     let seconds = Math.floor((duration_ms / 1000) % 60);
//     let minutes = Math.floor((duration_ms / (1000 * 60)) % 60);
//     let hours = Math.floor((duration_ms / (1000 * 60 * 60)) % 24);

//     hours = hours < 10 ? "0" + hours : hours;
//     minutes = minutes < 10 ? "0" + minutes : minutes;
//     seconds = seconds < 10 ? "0" + seconds : seconds;

//     return hours + ":" + minutes + ":" + seconds;
// }
