var parCoordMargin = {top: 30, right: 75, bottom: 40, left: 60},
    parCoordWidth = d3.select(".my-par-col").node().getBoundingClientRect().width - parCoordMargin.left - parCoordMargin.right,
    parCoordHeight = d3.select(".my-par-col").node().getBoundingClientRect().height - parCoordMargin.top - parCoordMargin.bottom,
    parCoordInnerHeight = parCoordHeight - 2;

var clusterColors = d3.scaleOrdinal()
    .domain([0,1,2,3])
    .range(["#858741", "#E4D866", "#F19B47","#CB4747"]);

// "#44c5cb", "#fce315", "#f53d52", "#ff9200"
// "#f8ffca", "#b6d084", "#ffcb32", "#2f7604"
//"#ffffb2", "#fecc5c", "#fd8d3c", "#e31a1c"
// , "#d7301f", "#fc8d59", "#fdcc8a", "#fef0d9"
//"#900c3f", "#c70039", "#ff5733", "#ffc300"
//"#fff474", "#f06553", "#3c3b5f", "#683551"
// "#CC9752", "#0F3B5F", "#CCCC00","#E5DBCF"
// "#858741", "#E4D866", "#F19B47","#CB4747"

var parallelCoordTypes = {
    "Number": {
        key: "Number",
        coerce: function(d) { return +d; },
        extent: d3.extent,
        within: function(d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
        defaultScale: d3.scaleLinear().range([parCoordInnerHeight, 50])
    }
};

var dimensions = [
    {
        key: "Age",
        description: "Age",
        type: parallelCoordTypes["Number"]
    },
    {
        key: "skill_moves",
        description: "Skill Moves",
        type: parallelCoordTypes["Number"]
    },
    {
        key: "Attacking",
        description: "Attacking",
        type: parallelCoordTypes["Number"]
    },
    {
        key: "Defending",
        description: "Defending",
        type: parallelCoordTypes["Number"]
    },
    {
        key: "Movement",
        description: "Movement",
        type: parallelCoordTypes["Number"]
    },
    {
        key: "Mentality",
        description: "Mentality",
        type: parallelCoordTypes["Number"]
    },
    {
        key: "Power",
        description: "Power",
        type: parallelCoordTypes["Number"]
    },
    {
        key: "Skill",
        description: "Skill",
        type: parallelCoordTypes["Number"]
    },
    {
        key: "potential",
        description: "Potential",
        type: parallelCoordTypes["Number"]
    },
    {
        key: "Overall",
        description: "Overall",
        type: parallelCoordTypes["Number"]
    },
    {
        key: "Value(EUR)",
        description: "Value(EUR)",
        type: parallelCoordTypes["Number"]
    },
    {
        key: "wage_eur",
        description: "Wage(EUR)",
        type: parallelCoordTypes["Number"]
    }
];


var parCoordXScale = d3.scalePoint()
    .domain(d3.range(dimensions.length))
    .range([0, parCoordWidth-70]);

var parCoordYScale = d3.axisLeft().ticks(null, "s");

var parCoordContainer = d3.select(".parcoords")
    .style("width", parCoordWidth + parCoordMargin.left + parCoordMargin.right + "px")
    .style("height", parCoordHeight + parCoordMargin.top + parCoordMargin.bottom + "px");

var parCoordSvg = parCoordContainer.append("svg")
    .attr("width", parCoordWidth + parCoordMargin.left + parCoordMargin.right)
    .attr("height", parCoordHeight + parCoordMargin.top + parCoordMargin.bottom)
    .append("g")
    .attr("transform", "translate(" + parCoordMargin.left + "," + parCoordMargin.top + ")");

var canvas = parCoordContainer.append("canvas")
    .attr("width", parCoordWidth)
    .attr("height", parCoordHeight)
    .style("margin-top", parCoordMargin.top + "px")
    .style("margin-left", parCoordMargin.left + "px");

var canvasLinesContext = canvas.node().getContext("2d");
canvasLinesContext.globalCompositeOperation = 'destination-over';
canvasLinesContext.globalAlpha = 0.15;
canvasLinesContext.lineWidth = 1.5;

var parCoordAxes = parCoordSvg.selectAll(".axis")
    .data(dimensions)
    .enter().append("g")
    .attr("class", function(d) { return "axis " + d.key.replace(/ /g, "_"); })
    .attr("transform", function(d,i) { return "translate(" + parCoordXScale(i) + ")"; });

var brush2;

d3.csv("static/Club_AggData.csv", function(error, data) {
    if (error) throw error;

    data.forEach(function(d) {
        dimensions.forEach(function(p) {
            d[p.key] = !d[p.key] ? null : p.type.coerce(d[p.key]);
        });
    });

    // type/dimension default setting happens here
    dimensions.forEach(function(dim) {
        if (!("domain" in dim)) {
            // detect domain using dimension type's extent function
            dim.domain = d3_functor(dim.type.extent)(data.map(function(d) { return d[dim.key]; }));
        }
        if (!("scale" in dim)) {
            // use type's default scale for dimension
            dim.scale = dim.type.defaultScale.copy();
        }
        dim.scale.domain(dim.domain);
    });

    var render = renderQueue(draw).rate(5);

    canvasLinesContext.clearRect(0,0,parCoordWidth,parCoordHeight);
    canvasLinesContext.globalAlpha = d3.min([1.35/Math.pow(data.length,0.3),1]);
    render(data);

    parCoordAxes.append("g")
        .each(function(d) {
            var renderAxis = parCoordYScale.scale(d.scale);
            d3.select(this).call(renderAxis);
        })
        .append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("y", "46")
        .text(function(d) { return "description" in d ? d.description : d.key; });

    // Add and store a brush for each axis.
    parCoordAxes.append("g")
        .attr("class", "brush")
        .each(function(d) {
            d3.select(this).call(d.brush = d3.brushY()
                .extent([[-10,50], [10,parCoordInnerHeight]])
                .on("start", brushstart)
                .on("brush", brush)
                .on("end", brush)
            )
        })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);

    function project(d) {
        return dimensions.map(function(p,i) {
            return [parCoordXScale(i),p.scale(d[p.key])];
        });
    }

    var parCoordPlotLegend = d3.select(".parcoords").select("svg").append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data([0,1,2,3])
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        parCoordPlotLegend.append("rect")
            .attr("x", parCoordWidth+75)
            .attr("y", parCoordHeight -45)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", clusterColors);

        parCoordPlotLegend.append("text")
            .attr("class", "legend-text")
            .attr("x", parCoordWidth+70)
            .attr("y", parCoordHeight-45+9.5)
            .attr("dy", "0.32em")
            .text(function(d) { return "Cluster "+(d+1); });

    function draw(d) {
        canvasLinesContext.strokeStyle = clusterColors(d.cluster);
        canvasLinesContext.beginPath();
        var coords = project(d);
        coords.forEach(function(p,i) {
            canvasLinesContext.lineTo(p[0],p[1]);
        });
        canvasLinesContext.stroke();
    }

    function brushstart() {
        d3.event.sourceEvent.stopPropagation();
    }

    // Handles a brush event, toggling the display of foreground lines.
    function brush() {
        render.invalidate();

        var actives = [];
        parCoordSvg.selectAll(".axis .brush")
            .filter(function(d) {
                return d3.brushSelection(this);
            })
            .each(function(d) {
                actives.push({
                    dimension: d,
                    extent: d3.brushSelection(this)
                });
            });

        var selected = data.filter(function(d) {
            if (actives.every(function(active) {
                var dim = active.dimension;
                // test if point is within extents for each active brush
                return dim.type.within(d[dim.key], active.extent, dim);
            })) {
                return true;
            }
        });

        canvasLinesContext.clearRect(0,0,parCoordWidth,parCoordHeight);
        canvasLinesContext.globalAlpha = d3.min([1.35/Math.pow(selected.length,0.3),1]);
        render(selected);
        updateScatterOnSelectionFromParallelCoordinates(selected.map(function (d) {
            return d.Club;
        }));
        drawMatchesChart(selected.map(function (d) {
            return d.Club;
        }));
        drawGoalsChart(selected.map(function (d) {
            return d.Club;
        }));
        drawPieChart(selected.map(function (d) {
            return {'Club':d.Club, 'League':d.league};
        }));
    }

    brush2 = function (clubList) {
        render.invalidate();

        var selected = data.filter(function(d) {
            if (clubList.includes(d.Club)){
                return true;
            }
        });

        canvasLinesContext.clearRect(0,0,parCoordWidth,parCoordHeight);
        canvasLinesContext.globalAlpha = d3.min([1.35/Math.pow(selected.length,0.3),1]);
        render(selected);
        updateScatterOnSelectionFromParallelCoordinates(selected.map(function (d) {
            return d.Club;
        }));
        drawMatchesChart(selected.map(function (d) {
            return d.Club;
        }));
        drawGoalsChart(selected.map(function (d) {
            return d.Club;
        }));
        drawPieChart(selected.map(function (d) {
            return {'Club':d.Club, 'League':d.league};
        }));
    }
});

function d3_functor(v) {
    return typeof v === "function" ? v : function() { return v; };
}