import * as d3 from "d3";
import "./style.css";

export default class SelectionTreeChart {
    /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
    constructor(_config, _data, _getRecommendations) {
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
        this.getRecommedations = _getRecommendations;
        this.initVis();
    }

    initVis() {
        let vis = this;

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

    updateVis() {
        const vis = this;

        vis.root = d3.hierarchy(vis.data, d => d.children);
        vis.cluster(vis.root);
        console.log("selection chart");
        console.log(vis.root);

        this.renderVis();
    }

    renderVis() {
        const vis = this;

        const getTooltipContent = (track) => {
            return `<div class="track-name">${track.name}</div>
                    <div>${track.artists[0]}</div>
                    <ul>
                        <li>Danceability: ${track.danceability}</li>
                        <li>Energy: ${track.energy}</li>
                        <li>Instrumentalness: ${track.instrumentalness}</li>
                        <li>Liveness: ${track.liveness}</li>
                        <li>Loudness: ${track.loudness}</li>
                        <li>Speechiness: ${track.speechiness}</li>
                        <li>Tempo: ${track.tempo}</li>
                        <li>Valence: ${track.valence}</li>
                    </ul>
            `;
        }

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
            .classed('node', true)
            .attr('transform', d => {
                return `translate(${d.y}, ${d.x})`
            })
            .append('circle')
                .attr('r', 7)
                .style("fill", "#69b3a2")
                .attr("stroke", "black")
                .style("stroke-width", 2);

        vis.chart.selectAll('.node')
            .on('mouseover', function(event, d) {
                console.log('hover');
                console.log(d);
                const track = d.data.track;
                d3.select('#selectionTreeTooltip')
                    .style('display', 'block')
                    .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                    .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                    .html(getTooltipContent(track));
            })
            .on('mouseleave',function(event, d) {
                d3.select(this).classed('hover', false);
                d3.select('#selectionTreeTooltip').style('display', 'none');
            })
            .on('click', function (event, d) {
                const track = d.data.track;
                // vis.setSelectedNode(track);
                // console.log("chart");
                vis.getRecommedations(d.data);
            });
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
