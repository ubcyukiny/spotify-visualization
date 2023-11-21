import * as d3 from "d3";
import "./style.css";

export default class HeatMap {
    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 1500,
            containerHeight: _config.containerHeight || 1250,
            margin: _config.margin || { top: 120, right: 20, bottom: 20, left: 350 },
            legendWidth: _config.legendWidth || 250,
            legendBarHeight: _config.legendBarHeight || 20,
            legendTitleHeight: _config.legendTitleHeight || 20,
            chartTitleHeight: _config.chartTitleHeight || 30,
            tooltipPadding: _config.tooltipPadding || 15
        };
        this.data = _data;
        this.colorScaleCategories = [
            "#57bb8a", // green
            "#9ad6b8",
            "#ddf1e7",
            "#fbe5e4",
            "#f0b1ab",
            "#e67c73" // red
        ];

        this.attributeDescription = {
            danceability: "0.0 being least danceable and 1.0 being most danceable",
            energy: "measures intensity in music",
            loudness: "normalized overall loudness of a track in decibels (dB)",
            speechiness: "detects the presence of spoken words in a track",
            acousticness: "confidence measure of whether the track is acoustic",
            instrumentalness: "predicts whether a track contains no vocals",
            liveness: "detects the presence of an audience in the recording",
            valence: "describes the musical positiveness conveyed by a track",
            tempo: "normalized overall estimated tempo of a track in beats per minute (BPM)"
        }

        this.xAxisArray = [
            'danceability',
            'energy',
            'loudness',
            'speechiness',
            'acousticness',
            'instrumentalness',
            'liveness',
            'valence',
            'tempo'
        ]
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

        // init xy scales,color scale, and legendScale
        vis.xScale = d3.scaleBand()
            .domain(vis.xAxisArray)
            .range([0, vis.width])
            .padding(0.05);

        vis.yScale = d3.scaleBand()
            .range([0, vis.height])
            .padding(0.10);

        vis.colorScale = d3.scaleSequential()
            .interpolator(d3.interpolateRgbBasis(vis.colorScaleCategories))
            .domain([0, 1]);

        // setup legend scale
        vis.legendScale = d3.scaleBand()
            .domain(vis.colorScaleCategories)
            .range([0, vis.config.legendWidth])
            .paddingInner(0);

        // init axis
        vis.xAxis = d3.axisTop(vis.xScale)
            .tickSize(0);

        vis.yAxis = d3.axisLeft(vis.yScale)
            .tickSize(0);

        // Define size of SVG drawing area
        vis.svg = d3
            .select(vis.config.parentElement)
            .attr("width", vis.config.containerWidth)
            .attr("height", vis.config.containerHeight);

        // append title,legend, chart, xy-axis groups
        vis.title = vis.svg.append('g')
            .attr('class', 'title-g')
            .attr('transform', `translate(0, ${vis.config.chartTitleHeight})`);

        vis.legend = vis.svg.append('g')
            .attr('class', 'legend-g')
            .attr('transform', `translate(${vis.config.containerWidth - vis.config.legendWidth - vis.config.margin.right}, ${vis.config.chartTitleHeight})`);

        vis.chart = vis.svg.append('g')
            .attr('class', 'chart')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis');

        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis');
    }

    /**
     * Prepare the data and scales before we render it.
     */
    updateVis() {
        let vis = this;
        // process data for heatmap rect
        vis.heatmapData = [];
        vis.data.forEach(track => {
            vis.xAxisArray.forEach(attribute => {
                vis.heatmapData.push({
                    track_id: track.track_id,
                    trackName: track.track_name,
                    attribute: attribute,
                    value: +track[attribute]
                });
            });
        });

        // update yScale domain
        vis.yScale.domain(vis.data.map(d => truncateString(d.track_name, 25)))
        vis.renderVis();
    }

    /**
     * Bind data to visual elements.
     */
    renderVis() {
        let vis = this;
        // render title, color scale legend
        vis.title.append('text')
            .attr('class', 'heatmap-title')
            .attr('x', vis.yScale.bandwidth()) // line up with the album pictures
            .attr('y', vis.config.chartTitleHeight)
            .attr('text-anchor', 'start')
            .text('Today\'s Top Hits')
            .style('font-size', vis.config.chartTitleHeight)
            .style('font-weight', 600)
            .style('fill', "white");

        vis.legend.append('text')
            .attr('class', 'legend-title')
            .attr('dy', '0.35em')
            .text('Color Scale of 0.0 to 1.0')
            .style('font-size', vis.config.legendTitleHeight)
            .style('fill', "white");

        vis.legend.selectAll('.legend-element')
            .data(vis.colorScaleCategories)
            .enter()
            .append('rect')
            .attr('class', 'legend-element')
            .attr('width', vis.legendScale.bandwidth())
            .attr('height', vis.config.legendBarHeight)
            .attr('x', d => vis.legendScale(d))
            .attr('y', vis.config.legendTitleHeight)
            .attr('fill', d => d)
            .style('opacity', 0.7);

        // render x,y axis
        vis.xAxisG.call(vis.xAxis).call(g => g.select('.domain').remove());;
        vis.yAxisG.call(vis.yAxis).call(g => g.select('.domain').remove());;

        // render album picture for yAxis
        const textElement = d3.select('.tick text').node();
        const bbox = textElement.getBBox();
        vis.yAxisG
            .selectAll('.tick')
            .data(vis.data)
            .append('image')
            .attr('xlink:href', d => d.album.images[0].url)
            .attr('x', -vis.config.margin.left + vis.yScale.bandwidth())
            .attr('y', -bbox.height)
            .attr('width', vis.yScale.bandwidth())
            .attr('height', vis.yScale.bandwidth())
            .attr('preserveAspectRatio', 'xMidYMid meet');

        // positioning track_names
        vis.yAxisG
            .selectAll(`text`)
            .data(vis.data)
            .attr('url', d => d.external_urls.spotify)
            .attr('x', -vis.config.margin.left + vis.yScale.bandwidth() * 3)
            .style(`text-anchor`, `start`)
            .style('cursor', 'pointer')
            .on('click', function (event, d) {
                window.open(d.external_urls.spotify, '_blank');
                // change it to interact with select songs perhaps
            })
            .on('mouseover', function () {
                d3.select(this).style('text-decoration', 'underline');
            })
            .on('mouseout', function () {
                d3.select(this).style('text-decoration', 'none');
            })

        // render heatmap rects
        const rects = vis.chart.selectAll("rect")
            .data(vis.heatmapData)
            .enter()
            .append("rect")
            .attr('class', 'rect')
            .attr('track_id', d => d.track_id)
            .attr("x", d => vis.xScale(d.attribute))
            .attr("y", d => vis.yScale(truncateString(d.trackName, 25)))
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("width", vis.xScale.bandwidth())
            .attr("height", vis.yScale.bandwidth())
            .style("fill", d => vis.colorScale(d.value))
            .style("stroke-width", 10)
            .style("stroke", "none")
            .style("opacity", 0.7);

        // tooltip event listeners for rects
        rects
            .on('mouseover', (event, d) => {

                d3.select('#heatmap-tooltip')
                    .style("display", "block")
                    .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
                    .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                    .html(`
                    <div class="heatmap-tooltip-title">${d.trackName}</div>
                    <div><i>${findArtistByTrackName(vis.data, d.trackName)}</i></div>
                    <div>${d.attribute}: ${vis.attributeDescription[d.attribute]}</div>
                    <div>Value: ${d.value.toFixed(2)}</div>
                `);
                d3.select(event.currentTarget)
                    .style("stroke", "white")
                    .style("opacity", 1)
            })
            .on('mouseleave', (event, d) => {
                d3.select('#heatmap-tooltip').style("display", "none");
                d3.select(event.currentTarget)
                    .style("stroke", "none")
                    .style("opacity", 0.7)
            });
    }
}

//helper functions

function findArtistByTrackName(tracks, trackName) {
    const track = tracks.find(track => track.track_name === trackName);
    return track ? track.artists : null;
}

function truncateString(str, num) {
    if (str.length > num) {
        return str.slice(0, num) + "...";
    } else {
        return str;
    }
}