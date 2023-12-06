import * as d3 from "d3";
import "./style.css";


const boxPlotTooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

export default class BoxPlot {
    constructor(_config, _data, _playlistName = '', _playlistImage = '', _songData = []) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 1200,
            containerHeight: _config.containerHeight || 520,
            margin: _config.margin || { top: 80, right: 20, bottom: 80, left: 40 }
        };
        this.data = _data;
        this.songData = _songData;
        this.playlistName = _playlistName;
        this.playlistImage = _playlistImage;
        this.attributes = ['danceability', 'energy', 'loudness', 'speechiness', 'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo'];
        this.initVis();
    }

    addSongPoints() {
        let vis = this;

        vis.attributes.forEach(attribute => {
            let songPoints = vis.svg.selectAll(`.song-point-${attribute}`)
                .data(vis.songData.map((d, index) => ({ ...d, index })), d => d.name + "-" + attribute);

            songPoints.exit().remove();

            songPoints.enter()
                .append("circle")
                .attr("class", `song-point-${attribute}`)
                .merge(songPoints)
                .attr("cx", d => vis.xScale(attribute) + vis.config.margin.left + vis.xScale.bandwidth() / 2)
                .attr("cy", d => {
                    const featureObj = d.features.find(f => f.axis === attribute);
                    const featureValue = featureObj ? featureObj.value : 0;
                    return vis.yScale(featureValue) + vis.config.margin.top;
                })
                .attr("r", 6)
                .attr("fill", d => d3.schemeCategory10[d.index % 10])
                .on("mouseover", function (event, d) {
                    d3.select(this).attr('r', 9); // Increase radius on hover
                    boxPlotTooltip.transition()
                        .style("opacity", .9);
                    boxPlotTooltip.html(
                        `<img src="${d.cover}" alt="${d.name}" style="width:50px;height:auto;"><br>` +
                        `<strong>${d.name}</strong><br/>` +
                        `${attribute}: ${d.features.find(f => f.axis === attribute)?.value.toFixed(2) || 'N/A'}`
                    )
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function () {
                    d3.select(this).attr('r', 4); // Reset radius on mouseout
                    boxPlotTooltip.transition()
                        .style("opacity", 0);
                });
        });
    }

    addSongLines() {
        let vis = this;

        const lineGenerator = d3.line()
            .x(d => vis.xScale(d.axis) + vis.config.margin.left + vis.xScale.bandwidth() / 2)
            .y(d => {
                // If value is 0, map to bottom of chart, otherwise use normal scale
                return d.value !== 0 ? vis.yScale(d.value) + vis.config.margin.top : vis.height + vis.config.margin.top;
            });

        const orderedData = vis.songData.map(song => ({
            ...song,
            features: vis.attributes.map(attr => song.features.find(f => f.axis === attr) || { axis: attr, value: 0 })
        }));

        vis.songLines = vis.svg.selectAll('.song-line')
            .data(orderedData, d => d.name);

        vis.songLines.exit().remove();

        vis.songLines.enter()
            .append('path')
            .attr('class', 'song-line')
            .merge(vis.songLines)
            .attr('d', d => lineGenerator(d.features))
            .attr('fill', 'none')
            .attr('stroke', (d, i) => d3.schemeCategory10[i % 10])
            .attr('stroke-width', 3)
            .on("mouseover", function (event, d) {
                d3.select(this).attr('stroke-width', 5);
                boxPlotTooltip.transition()
                    .style("opacity", .9);
                boxPlotTooltip.html(
                    `<img src="${d.cover}" alt="${d.name}" style="width:50px;height:auto;"><br>` +
                    `<strong>${d.name}</strong>`
                )
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
                d3.select(this).attr('stroke-width', 3);
                boxPlotTooltip.transition()
                    .style("opacity", 0);
            });
    }


    initVis() {
        let vis = this;

        // Calculate inner chart size
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // Define scales
        vis.xScale = d3.scaleBand()
            .range([0, vis.width])
            .paddingInner(0.1);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]); // Correct range for y-axis

        vis.colorScale = d3.scaleLinear()
            .domain([0, 10])
            .range(["#5553A2", "#FF5733"]);

        // Define axes
        vis.xAxis = d3.axisBottom(vis.xScale);
        vis.yAxis = d3.axisLeft(vis.yScale);

        // Append SVG object to the DOM
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight)

        // Initialize X and Y axes
        vis.xAxisGroup = vis.svg.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(${vis.config.margin.left}, ${vis.height + vis.config.margin.top})`);

        vis.yAxisGroup = vis.svg.append('g')
            .attr('class', 'axis y-axis')
            .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);
    }


    updateVis() {
        let vis = this;

        // Process data for box plot
        vis.boxPlotData = vis.attributes.map(attribute => {
            let values = vis.data.map(d => d[attribute])
                .filter(v => v != null)
                .sort(d3.ascending);
            let q1 = d3.quantile(values, 0.25);
            let median = d3.quantile(values, 0.5);
            let q3 = d3.quantile(values, 0.75);
            let iqr = q3 - q1;
            let min = Math.max(q1 - 1.5 * iqr, d3.min(values));
            let max = Math.min(q3 + 1.5 * iqr, d3.max(values));

            return { attribute, values, q1, median, q3, min, max };
        });

        // Update scales
        vis.xScale.domain(vis.attributes);
        vis.yScale.domain([d3.min(vis.boxPlotData, d => d.min), d3.max(vis.boxPlotData, d => d.max)]);

        // Update axes
        vis.xAxisGroup.call(vis.xAxis);
        vis.yAxisGroup.call(vis.yAxis);

        // Call the new function to draw lines
        vis.renderVis();
        this.addSongPoints();
        this.addSongLines();
    }

    renderVis() {
        let vis = this;

        let titleSelection = vis.svg.selectAll('.plot-title')
            .data([vis.playlistName]);

        titleSelection.enter()
            .append("text")
            .attr("class", "plot-title")
            .merge(titleSelection)
            .attr("x", vis.config.margin.left + 50)
            .attr("y", 40)
            .attr('fill', 'white')
            .text(d => d);

        titleSelection.exit().remove();

        // Update image
        let imageSelection = vis.svg.selectAll('.playlist-image')
            .data(vis.playlistImage ? [vis.playlistImage] : []);

        imageSelection.enter()
            .append("image")
            .attr("class", "playlist-image")
            .merge(imageSelection)
            .attr("href", d => d)
            .attr("x", vis.config.margin.left)
            .attr("y", 10)
            .attr("width", 40)
            .attr("height", 40);

        imageSelection.exit().remove();

        // Update the box groups with new data
        vis.boxGroups = vis.svg.selectAll('.box')
            .data(vis.boxPlotData, d => d.attribute);

        vis.boxGroups.exit().remove();

        let newBoxGroups = vis.boxGroups.enter().append('g')
            .attr('class', 'box');

        vis.boxGroups = vis.boxGroups.merge(newBoxGroups);

        vis.boxGroups.attr('transform', d => `translate(${vis.xScale(d.attribute) + vis.config.margin.left + (vis.xScale.bandwidth() / 4)}, ${vis.config.margin.top})`);

        // Update boxes
        vis.boxGroups.selectAll('rect')
            .data(d => [d])
            .join('rect')
            .attr('x', 0)
            .attr('y', d => vis.yScale(d.q3))
            .attr('width', vis.xScale.bandwidth() / 2)
            .attr('height', d => vis.yScale(d.q1) - vis.yScale(d.q3))
            .attr('fill', d => vis.colorScale(d.median))
            .attr('stroke', 'white');


        // Draw median line
        let medianLines = vis.boxGroups.selectAll('.median-line')
            .data(d => [d]); // one line per group

        medianLines.enter()
            .append('line')
            .attr('class', 'median-line')
            .merge(medianLines) // Merge with entered selection
            .attr('x1', 0)
            .attr('x2', vis.xScale.bandwidth() / 2)
            .attr('y1', d => vis.yScale(d.median))
            .attr('y2', d => vis.yScale(d.median))
            .attr('stroke', 'black');

        medianLines.exit().remove(); // Remove excess lines

        // Draw whiskers
        let whiskers = vis.boxGroups.selectAll('.whisker')
            .data(d => [[d.min, d.q1], [d.q3, d.max]]); // Two whiskers per group

        whiskers.enter()
            .append('line')
            .attr('class', 'whisker')
            .merge(whiskers) // Merge with entered selection
            .attr('x1', vis.xScale.bandwidth() / 4)
            .attr('x2', vis.xScale.bandwidth() / 4)
            .attr('y1', d => vis.yScale(d[0]))
            .attr('y2', d => vis.yScale(d[1]))
            .attr('stroke', 'white');

        whiskers.exit().remove(); // Remove excess lines

        vis.boxGroups.on("mouseover", function (event, d) {
            boxPlotTooltip.transition()
                .style("opacity", .9);
            boxPlotTooltip.html(
                `<strong>${d.attribute}</strong><br/>` +
                `Q1: ${d.q1.toFixed(2)}<br/>` +
                `Median: ${d.median.toFixed(2)}<br/>` +
                `Q3: ${d.q3.toFixed(2)}<br/>` +
                `Min: ${d.min.toFixed(2)}<br/>` +
                `Max: ${d.max.toFixed(2)}`
            )
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");

            d3.select(this).select('rect')
                .attr('stroke', 'yellow')
                .attr('stroke-width', '3px');

            // Highlight the median line
            d3.select(this).select('line')
                .attr('stroke', 'yellow')
                .attr('stroke-width', '3px');

            // Highlight the whiskers
            d3.select(this).selectAll('.whisker')
                .attr('stroke', 'yellow')
                .attr('stroke-width', '3px');
        })
            .on("mouseout", function (d) {
                boxPlotTooltip.transition()
                    .style("opacity", 0);

                d3.select(this).select('rect')
                    .attr('stroke', 'white')
                    .attr('stroke-width', '1px');

                // Revert the median line to original style
                d3.select(this).select('line')
                    .attr('stroke', 'black')
                    .attr('stroke-width', '1px');

                // Revert the whiskers to original style
                d3.select(this).selectAll('.whisker')
                    .attr('stroke', 'white')
                    .attr('stroke-width', '1px');

            });
    }
}


