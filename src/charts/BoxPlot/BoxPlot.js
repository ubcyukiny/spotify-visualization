import * as d3 from "d3";
import "./style.css";

export default class BoxPlot {
    constructor(_config, _data, _playlistName = '', _playlistImage = '') {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 1200,
            containerHeight: _config.containerHeight || 450,
            margin: _config.margin || { top: 80, right: 20, bottom: 30, left: 40 }
        };
        this.data = _data;
        this.playlistName = _playlistName;
        this.playlistImage = _playlistImage;
        this.attributes = ['danceability', 'energy', 'loudness', 'speechiness', 'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo'];
        this.initVis();
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

        // Append groups for axes
        vis.svg.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(${vis.config.margin.left}, ${vis.height + vis.config.margin.top})`); // Correct translation for x-axis

        vis.svg.append('g')
            .attr('class', 'axis y-axis')
            .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`); // Translate y-axis

        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }

    updateVis() {
        let vis = this;

        // Process data for box plot
        vis.boxPlotData = vis.attributes.map(attribute => {
            let values = vis.data.map(d => d[attribute]).filter(v => v != null).sort(d3.ascending);
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

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        // Draw box plots
        vis.boxGroups = vis.svg.selectAll('.box')
            .data(vis.boxPlotData)
            .enter()
            .append('g')
            .attr('class', 'box')
            .attr('transform', d => `translate(${vis.xScale(d.attribute) + vis.config.margin.left + (vis.xScale.bandwidth() / 4)}, ${vis.config.margin.top})`);

        // Display playlist name as title
        vis.svg.append("text")
            .attr("x", vis.config.margin.left + 50)
            .attr("y", 40) // Adjusted for top placement
            .attr("class", "plot-title")
            .attr('fill', 'white')
            .text(vis.playlistName);


        if (vis.playlistImage) {
            vis.svg.append("image")
                .attr("href", vis.playlistImage)
                .attr("x", vis.config.margin.left) // Adjust as needed
                .attr("y", 10) // Adjusted for top placement
                .attr("width", 40) // Adjust size as needed
                .attr("height", 40);
        }
        vis.boxGroups
            .append('rect')
            .attr('x', 0) // Start from the left edge of the translated group
            .attr('y', d => vis.yScale(d.q3))
            .attr('width', vis.xScale.bandwidth() / 2)
            .attr('height', d => vis.yScale(d.q1) - vis.yScale(d.q3))
            .attr('fill', 'lightblue')
            .attr('stroke', 'white');


        // Draw median line
        vis.boxGroups.append('rect')
        .attr('x', 0)
        .attr('y', d => vis.yScale(d.q3))
        .attr('width', vis.xScale.bandwidth() / 2)
        .attr('height', d => vis.yScale(d.q1) - vis.yScale(d.q3))
        .attr('fill', d => vis.colorScale(d.median)) // Color based on median value
        .attr('stroke', 'white');

        // Draw whiskers
        vis.boxGroups
            .selectAll('.whisker')
            .data(d => [[d.min, d.q1], [d.q3, d.max]])
            .enter()
            .append('line')
            .attr('class', 'whisker')
            .attr('x1', vis.xScale.bandwidth() / 4)
            .attr('x2', vis.xScale.bandwidth() / 4)
            .attr('y1', d => vis.yScale(d[0]))
            .attr('y2', d => vis.yScale(d[1]))
            .attr('stroke', 'white');

        // Update axes
        vis.svg.select('.x-axis').call(vis.xAxis);
        vis.svg.select('.y-axis').call(vis.yAxis);

        vis.boxGroups.on("mouseover", function (event, d) {
            vis.tooltip.transition()
                .style("opacity", .9);
            vis.tooltip.html(
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
                vis.tooltip.transition()
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
