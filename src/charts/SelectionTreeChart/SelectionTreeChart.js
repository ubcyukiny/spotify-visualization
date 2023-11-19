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
            containerWidth: _config.containerWidth || 1000,
            containerHeight: _config.containerHeight || 600,
            margin: _config.margin || { top: 20, right: 20, bottom: 20, left: 20 },
            tooltipPadding: _config.tooltipPadding || 15,
            chartOffset: _config.chartOffset || 300,
            labelFactor: _config.labelFactor || 1.3,
        };
        this.data = _data;
        console.log(this.data);
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

        vis.cluster = d3.cluster().size([vis.height, vis.width - 100]);
    }

    /**
   * Prepare the data and scales before we render it.
   */
    updateVis() {
        const vis = this;

        vis.root = d3.hierarchy(vis.data, d => d.children);
        vis.cluster(vis.root);
        console.log("selection chart");
        console.log(vis.data);

        this.renderVis();
    }

    /**
   * Bind data to visual elements.
   */
    renderVis() {
        const vis = this;

        vis.chart.selectAll('path')
            .data(vis.root.descendants().slice(1))
            .join('path')
            .attr("d", d => {
                return "M" + d.y + "," + d.x
                        + "C" + (d.parent.y + 50) + "," + d.x
                        + " " + (d.parent.y + 150) + "," + d.parent.x // 50 and 150 are coordinates of inflexion, play with it to change links shape
                        + " " + d.parent.y + "," + d.parent.x;
              })
            .style('fill', 'none')
            .attr('stroke', '#ccc');

        vis.chart.selectAll('g')
            .data(vis.root.descendants())
            .join('g')
            .attr('transform', d => {
                return `translate(${d.y}, ${d.x})`
            })
            .append('circle')
                .attr('r', 7)
                .style("fill", "#69b3a2")
                .attr("stroke", "black")
                .style("stroke-width", 2);
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
