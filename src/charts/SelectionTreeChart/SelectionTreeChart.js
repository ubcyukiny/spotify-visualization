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
        console.log("init vis called");
    }

    updateVis() {
        const vis = this;

        vis.root = d3.hierarchy(vis.data, d => d.children);
        vis.cluster(vis.root);
        console.log("update called");
        console.log(vis.root);

        this.renderVis();
    }

    renderVis() {
        const vis = this;

        const getTooltipContent = (track) => {
            return `
                    <div class="node-track-title">${track.name}</div>
                    <div><i>${track.artists.reduce((output, artistName) => output + artistName + ", ", "").slice(0, -2)}</i></div>
                    <div class="attr-container">
                        <div>Danceability: ${track.danceability}</div>
                        <div>Energy: ${track.energy}</div>
                        <div>Instrumentalness: ${track.instrumentalness}</div>
                        <div>Liveness: ${track.liveness}</div>
                        <div>Loudness: ${track.loudness}</div>
                        <div>Speechiness: ${track.speechiness}</div>
                        <div>Tempo: ${track.tempo}</div>
                        <div>Valence: ${track.valence}</div>
                    </div>
                    `;
        }

        console.log("root");
        console.log (vis.root.descendants());

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
            .attr('stroke', (d) => {
                if (d.data.selected)
                    return "#aa4a44";
                return "#ccc";
            });

        vis.chart.selectAll('image')
            .data(vis.root.descendants(), d => d.data.track.id)
            .join('image')
            .classed('node', true)
            .attr('transform', d => {
                return `translate(${d.y - 25}, ${d.x - 25})`
            })
            .attr('xlink:href', d => d.data.track.albumCover)
            .attr('width', 50)
            .attr('height', 50);

        vis.chart.selectAll('.node')
            .on('mouseover', function(event, d) {
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
                d.data.selected = true;
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
