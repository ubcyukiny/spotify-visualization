import * as d3 from "d3";
import "./style.css";

export default class RadarChart {
  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1200,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || { top: 20, right: 20, bottom: 20, left: 20 },
      tooltipPadding: _config.tooltipPadding || 15,
      chartOffset: _config.chartOffset || 50,
      labelFactor: _config.labelFactor || 1.3,
      radarFillOpacityMax: _config.radarFillOpacityMax || 0.7,
      radarFillOpacityMin: _config.radarFillOpacityMin || 0.3,
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

    vis.numAxes = vis.data[0]?.features.length || 8;
    vis.angleSlice = (Math.PI * 2) / vis.numAxes;

    vis.radius = Math.min(vis.width, vis.height) / 2 - vis.config.chartOffset;

    vis.rScale = d3.scaleLinear().range([0, vis.radius]).domain([0, 10]);
    vis.labelScale = d3
      .scaleOrdinal()
      .range([
        "instrumentalness",
        "danceability",
        "energy",
        "valence",
        "loudness",
        "speechiness",
        "acousticness",
        "liveness",
      ])
      .domain([0, 7]);

    vis.labelDescriptions = {
      instrumentalness: "Whether a track contains no vocals.",
      danceability:
        "Combines tempo, rhythm stability, beat strength, and regularity.",
      energy:
        "Measures intensity in music. High energy: fast, loud, noisy. Low energy: calm.",
      valence: "Describing the musical positiveness conveyed by a track. High valence: happy, cheerful. Low valence: sad, depressed.",
      loudness: "The overall loudness of a track.",
      speechiness: "The presence of spoken words in a track.",
      acousticness: "Whether the track is acoustic.",
      liveness: "The presence of an audience in the track.",
    };

    vis.axisScale = d3
      .scaleOrdinal()
      .range(d3.range(vis.numAxes))
      .domain([
        "instrumentalness",
        "danceability",
        "energy",
        "valence",
        "loudness",
        "speechiness",
        "acousticness",
        "liveness",
      ]);

    vis.center = { x: vis.width / 2, y: vis.height / 2 };

    vis.svg = d3
      .select(vis.config.parentElement)
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);

    vis.chart = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );

    vis.radarGrid = vis.chart.append("g").attr("class", "radar-grid");

    this.radarGrid
      .selectAll(".levels")
      .data(d3.range(vis.numAxes).reverse())
      .join("circle")
      .attr("class", "gridCircle")
      .attr("r", (d) => (vis.radius / vis.numAxes) * (d + 1))
      .attr("cx", vis.center.x)
      .attr("cy", vis.center.y)
      .style("fill", "#CDCDCD")
      .style("stroke", "#CDCDCD")
      .style("fill-opacity", 0)
      .style("filter", "url(#glow)");

    vis.axes = vis.radarGrid
      .selectAll(".axis")
      .data(d3.range(vis.numAxes))
      .join("g")
      .attr("class", "axis");

    vis.axes
      .append("line")
      .attr("x1", vis.center.x)
      .attr("y1", vis.center.y)
      .attr("x2", (d, i) => {
        return (
          vis.center.x + vis.radius * Math.cos(vis.angleSlice * i - Math.PI / 2)
        );
      })
      .attr(
        "y2",
        (d, i) =>
          vis.center.y + vis.radius * Math.sin(vis.angleSlice * i - Math.PI / 2)
      )
      .style("stroke", "white")
      .style("stroke-width", "1px");

    vis.labels = vis.radarGrid
      .selectAll(".axis-label")
      .data(d3.range(vis.numAxes))
      .join("g")
      .attr("class", "axis-label");

    vis.labels
      .append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr(
        "x",
        (d, i) =>
          vis.center.x +
          vis.radius *
            vis.config.labelFactor *
            Math.cos(vis.angleSlice * i - Math.PI / 2)
      )
      .attr(
        "y",
        (d, i) =>
          vis.center.y +
          vis.radius *
            vis.config.labelFactor *
            Math.sin(vis.angleSlice * i - Math.PI / 2)
      )
      .text((d) => vis.labelScale(d))
      .style("fill", "white");

      vis.labels
        .on("mouseover", function (event, d) {
          const label = vis.labelScale(d);

          d3.select("#labelTooltip")
            .style("opacity", 1)
            .html("<span>" + vis.labelDescriptions[label] + "</span>")
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY + 10 + "px");
        })
        .on("mouseout", function (d) {
          d3.select("#labelTooltip").style("opacity", 0);
        });

    vis.radarArea = vis.chart.append("g").attr("class", "radar-area");

    // Define size of SVG drawing area
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;

    // Specificy accessor functions
    vis.rValue = (d) => d.value;

    vis.renderVis();

    vis.isTooltipSticky = false;
    vis.tooltipId = null;
  }

  /**
   * Bind data to visual elements.
   */
  renderVis() {
    let vis = this;
    const tooltip = d3.select("#radarTooltip");

    const radarLine = d3
      .lineRadial()
      .curve(d3.curveLinearClosed)
      .radius((d) => vis.rScale(d.value))
      .angle((d, i) => (i * 2 * Math.PI) / vis.numAxes);

    const path = vis.radarArea
      .selectAll(".radar-path")
      .data(vis.data)
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("class", "radar-path")
            .attr("fill", (d, i) => d3.schemeCategory10[i])
            .style("fill-opacity", vis.config.radarFillOpacityMin)
            .style("stroke", (d, i) => d3.schemeCategory10[i])
            .attr("d", (d) => radarLine(d.features))
            .attr("transform", `translate(${vis.center.x},${vis.center.y})`),
        (update) =>
          update
            .attr("fill", (d, i) => d3.schemeCategory10[i])
            .style("stroke", (d, i) => d3.schemeCategory10[i])
            .attr("d", (d) => radarLine(d.features)),
        (exit) => exit.remove()
      );

    path.attr("cursor", "pointer");

    function showTooltip(event, d) {
      vis.tooltipId = d.id;
      d3.select(this).style("fill-opacity", vis.config.radarFillOpacityMax);
      d3.select("#radarTooltip .tooltip-cover").attr("src", d.cover);
      d3.select("#radarTooltip .tooltip-content").html(
        "Track: " +
          d.name +
          "<br>" +
          "Artist: " +
          d.artist +
          "<br>" +
          "Duration: " +
          formatDuration(d.duration_ms)
      );
      d3.select("#radarTooltip .tooltip-remove").attr("remove-id", d.id);
      tooltip
        .style("opacity", 1)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px")
        .style("pointer-events", "all");
    }

    path
      .on("mouseover", function (event, d) {
        if (vis.isTooltipSticky) return;
        showTooltip.call(this, event, d);
      })
      .on("mouseout", function (event, d) {
        if (vis.isTooltipSticky) return;
        d3.select(this).style("fill-opacity", vis.config.radarFillOpacityMin);
        tooltip.style("opacity", 0).style("pointer-events", "none");
      })
      .on("click", (event, d) => {
        vis.isTooltipSticky = !vis.isTooltipSticky;
      });

      vis.svg.on("click", (event, d) => {
        if (event.target.className.baseVal !== "radar-path") {
          vis.isTooltipSticky = false;
          tooltip.style("opacity", 0).style("pointer-events", "none");
          d3.selectAll(".radar-path").style(
            "fill-opacity",
            vis.config.radarFillOpacityMin
          );
        }
      });

    const circles = vis.radarArea
      .selectAll(".radar-mark")
      .data(
        vis.data.flatMap((d, i) =>
          d.features.map((feature) => ({ feature, index: i }))
        )
      )
      .join("circle")
      .attr("class", "radar-mark")
      .attr("r", 2)
      .attr(
        "cx",
        (d) =>
          vis.center.x +
          vis.rScale(d.feature.value) *
            Math.cos(
              vis.angleSlice * vis.axisScale(d.feature.axis) - Math.PI / 2
            )
      )
      .attr(
        "cy",
        (d) =>
          vis.center.y +
          vis.rScale(d.feature.value) *
            Math.sin(
              vis.angleSlice * vis.axisScale(d.feature.axis) - Math.PI / 2
            )
      )
      .attr("fill", (d) => d3.schemeCategory10[d.index]);
  }
}

const formatDuration = (duration_ms) => {
  let seconds = Math.floor((duration_ms / 1000) % 60);
  let minutes = Math.floor((duration_ms / (1000 * 60)) % 60);
  let hours = Math.floor((duration_ms / (1000 * 60 * 60)) % 24);

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds;
};
