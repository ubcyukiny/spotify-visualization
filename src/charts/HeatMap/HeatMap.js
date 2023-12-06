import * as d3 from "d3";
import "./style.css";

export default class HeatMap {
    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, playlist, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 1200,
            containerHeight: _config.containerHeight || 750,
            margin: _config.margin || { top: 250, right: 20, bottom: 20, left: 350 },
            legendWidth: _config.legendWidth || 200,
            legendBarHeight: _config.legendBarHeight || 20,
            chartTitleFontsize: _config.chartTitleFontsize || 50,
            tooltipPadding: _config.tooltipPadding || 15,
            truncateStringLength: _config.truncateStringLength || 20,
            handleHeatmapButtonClick: _config.handleHeatmapButtonClick
        };
        this.config.playlistImageHeight = this.config.margin.top - 50;
        this.config.playlistImageWidth = this.config.playlistImageHeight;

        this.data = _data;
        this.playlist = {
            playlistID: playlist.playlistID,
            playlistTitle: playlist.playlistTitle,
            playlistImageUrl: playlist.playlistImageUrl,
            playlistUrl: `https://open.spotify.com/playlist/${playlist.playlistID}`,
            playlistDescription: playlist.playlistDescription
        }
        this.colorScaleCategories = [
            "#57bb8a", // green
            "#9ad6b8",
            "#ddf1e7",
            "#fbe5e4",
            "#f0b1ab",
            "#e67c73" // red
        ];

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
            .domain([0, 10]);

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

        //append title, description,legend, chart, xy-axis groups
        vis.title = vis.svg.append('g')
            .attr('class', 'heatMap-title-g')
            .attr('transform', `translate(${40 + vis.config.playlistImageWidth}, ${(vis.config.playlistImageHeight - 1.2 * vis.config.chartTitleFontsize) / 2 + 40})`);

        vis.playlistDescription = vis.svg.append('g')
            .attr('class', 'heatMap-description-g')
            .attr('transform', `translate(${40 + vis.config.playlistImageWidth}, ${(vis.config.playlistImageHeight - 1.2 * vis.config.chartTitleFontsize) / 2 + vis.config.chartTitleFontsize + 40})`);

        vis.legend = vis.svg.append('g')
            .attr('class', 'heatMap-legend-g')
            .attr('transform', `translate(${vis.config.containerWidth - vis.config.legendWidth - vis.config.margin.right}, ${(vis.config.playlistImageHeight - 1.2 * vis.config.chartTitleFontsize) / 2 + 40})`);

        vis.chart = vis.svg.append('g')
            .attr('class', 'chart')
            .attr('transform', `translate(${vis.config.margin.left + 4},${vis.config.margin.top})`);

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
        // process data to change it to 0 to 10 scale, norm loudness and tempo
        // make a copy instead of a reference
        const processedData = JSON.parse(JSON.stringify(vis.data));
        const featureKeys = ['danceability', 'energy', 'loudness', 'speechiness', 'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo'];
        // values are calculated from kaggle dataset of 114k songs https://www.kaggle.com/datasets/maharshipandya/-spotify-tracks-dataset/
        const minTempo = 0;
        const maxTempo = 243.372;
        const minLoudness = -49.531;
        const maxLoudness = 4.532;

        //normalized tempo, loudnesss
        processedData.forEach(track => {
            track.features[0].tempo = (track.features[0].tempo - minTempo) / (maxTempo - minTempo);
            track.features[0].loudness = (track.features[0].loudness - minLoudness) / (maxLoudness - minLoudness);
        })

        // scale of 0 to 10
        processedData.forEach(track => {
            featureKeys.forEach(key => {
                track.features[0][key] *= 10
            })
        })
        // process data for heatmap rect
        vis.heatmapData = [];
        processedData.forEach(track => {
            vis.xAxisArray.forEach(attribute => {
                vis.heatmapData.push({
                    track_id: track.id,
                    trackName: track.name,
                    attribute: attribute,
                    value: track.features[0][attribute],
                    artist: track.artists.map(artist => artist.name).join(', ')
                });
            });
        });

        // update yScale according to data.
        let numberOfRows = processedData.length;
        let rowHeight = vis.height / 10; // default rect height when numRows = 10
        vis.yScale
            .range([0, numberOfRows * rowHeight])
            .domain(vis.data.map(d => `${d.name}-${d.id}`));
        vis.renderVis();
    }

    /**
     * Bind data to visual elements.
     */
    renderVis() {
        let vis = this;
        // // remove previous title, description and color scale
        d3.selectAll('.heatMap-legend-g').selectAll('*').remove();
        d3.selectAll('.heatMap-title-g').selectAll('*').remove();
        d3.selectAll('.heatMap-description-g').selectAll('*').remove();

        // Render playlist picture
        vis.svg.append('svg:image')
            .attr('x', 20)
            .attr('y', 20)
            .attr('width', vis.config.playlistImageWidth)
            .attr('height', vis.config.playlistImageHeight)
            .attr('xlink:href', vis.playlist.playlistImageUrl)
            .attr('preserveAspectRatio', 'none'); // Stretch to fill the specified size

        // render title, color scale legend
        vis.title.append('text')
            .attr('class', 'heatmap-title')
            .attr('x', 0)
            .attr('y', 0)
            .attr('text-anchor', 'start')
            .text(vis.playlist.playlistTitle)
            .style('font-size', vis.config.chartTitleFontsize)
            .style('font-weight', 600)
            .style('fill', "white")
            .style('cursor', 'pointer')
            .on('click', function (event, d) {
                if (vis.playlist.playlistUrl) {
                    window.open(vis.playlist.playlistUrl, '_blank');
                }
            })
            .on('mouseover', function () {
                d3.select(this).style('text-decoration', 'underline');
            })
            .on('mouseout', function () {
                d3.select(this).style('text-decoration', 'none');
            });

        // Render description
        vis.playlistDescription.append('text')
            .attr('class', 'heatmap-description')
            .attr('x', 0)
            .attr('y', 0)
            .attr('text-anchor', 'start')
            .text(vis.playlist.playlistDescription)
            .style('fill', "white")
            .style('font-size', 18)

        vis.legend.append('text')
            .attr('class', 'legend-title')
            .attr('dy', '0.35em')
            .text('Color Scale of 0 to 10')
            .style('font-size', 18)
            .style('fill', "white");

        vis.legend.selectAll('.legend-element')
            .data(vis.colorScaleCategories)
            .join('rect')
            .attr('class', 'legend-element')
            .attr('width', vis.legendScale.bandwidth())
            .attr('height', vis.config.legendBarHeight)
            .attr('x', d => vis.legendScale(d))
            .attr('y', 20)
            .attr('fill', d => d)
            .style('opacity', 0.7);

        // render x,y axis 
        vis.xAxisG
            .call(vis.xAxis)
            .call(g => g.select('.domain').remove())
            .selectAll(".tick text")
            .style("text-anchor", "start")
            .attr("dx", "-0.7em")
            .attr("dy", "-1.0em")
            .attr("transform", "rotate(-40)");

        vis.yAxisG.call(vis.yAxis).call(g => g.select('.domain').remove());

        // get y coord of rect
        const textElement = d3.select('.tick text').node();
        const bbox = textElement.getBBox();
        // render album picture for yAxis
        vis.yAxisG
            .selectAll('.tick')
            .data(vis.data)
            .append('image')
            .attr('xlink:href', d => d.album.images[0].url)
            .attr('x', -vis.config.margin.left + vis.yScale.bandwidth() * 2)
            .attr('y', -bbox.height)
            .attr('width', vis.yScale.bandwidth())
            .attr('height', vis.yScale.bandwidth())
            .attr('preserveAspectRatio', 'xMidYMid meet');

        // positioning track_names
        vis.yAxisG
            .selectAll('.tick text')
            .data(vis.data)
            .text(d => {
                // Split the string songName-songID
                const split = d.name.split(" - ");
                return truncateString(split[0],20);
            })
            .attr('url', d => d.external_urls.spotify)
            .attr('x', -vis.config.margin.left + vis.yScale.bandwidth() * 3.5)
            .style(`text-anchor`, `start`)
            .style('cursor', 'pointer')
            .on('click', function (event, d) {
                window.open(d.external_urls.spotify, '_blank');
            })
            .on('mouseover', function () {
                d3.select(this).style('text-decoration', 'underline');
            })
            .on('mouseout', function () {
                d3.select(this).style('text-decoration', 'none');
            })

        vis.buttons = vis.yAxisG
            .selectAll('.tick')
            .data(vis.data)
            .append('text')
            .text('+')
            .attr('class', 'heatmap-selectsongs-button')
            .attr('x', -vis.config.margin.left + vis.yScale.bandwidth())
            .attr('y', bbox.height / 2)
            .style('fill', '#28a745')
            .style('font-size', 30)
            .style('cursor', 'pointer')
            .on('click', function (event, d) {
                if (d3.select(this).style('cursor') === 'not-allowed') {
                    // Do nothing when cursor is not-allowed, when selectedSongs are full 
                    return;
                }
                var currentText = d3.select(this).text();
                let nextButtonState = vis.config.handleHeatmapButtonClick(d, currentText); // return '+' or '-' 
                d3.select(this)
                    .text(nextButtonState)
                    .style('fill', nextButtonState === '+' ? '#28a745' : '#dc3545')
            })

        // render heatmap rects
        const rects = vis.chart.selectAll("rect")
            .data(vis.heatmapData)
            .join("rect")
            .attr('class', 'rect')
            .attr('track_id', d => d.track_id)
            .attr("x", d => vis.xScale(d.attribute))
            .attr("y", d => vis.yScale(`${d.trackName}-${d.track_id}`))
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
                    <div><i>${d.artist}</i></div>
                    <div>${capitalize(d.attribute)}: ${d.value.toFixed(2)}</div>
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

    // updateButtonStates according to selected songs list, 
    // if selected Song list is full, make + icons gray and uninteractable with a special cursor, that says selectedSonglist full
    updateButtonStates(selectedSongs) {
        let vis = this;
        if (vis.buttons) {
            vis.buttons
                .text(d => selectedSongs.some(song => song.id === d.id) ? '-' : '+')
                .style('cursor', 'pointer')
                .style('fill', d => selectedSongs.some(song => song.id === d.id) ? '#dc3545' : '#28a745');
            if (selectedSongs.length >= 10) {
                // buttons with text '+' should change the style to gray
                const plusButtons = vis.buttons.filter(function () {
                    return d3.select(this).text() === '+';
                })
                plusButtons
                    .style('cursor', 'not-allowed')
                    .style('fill', '#6c757d');
            }
        }
    }
}

//helper functions
function truncateString(str, num) {
    if (str.length > num) {
        return str.slice(0, num) + "...";
    } else {
        return str;
    }
}

function capitalize(s) {
    return s[0].toUpperCase() + s.slice(1);
}
