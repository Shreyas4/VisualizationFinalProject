var stackedBarHeight = d3.select(".my-stackedbar-col").node().getBoundingClientRect().height;
var stackedBarWidth = d3.select(".my-stackedbar-col").node().getBoundingClientRect().width;

function drawMatchesChart(dummy_clubs_set){
    var season_wise_stats_for_stacked_bar = [
        {"Season": "2014-15", "Pld":0, "W":0, "D":0, "L":0},
        {"Season": "2015-16", "Pld":0, "W":0, "D":0, "L":0},
        {"Season": "2016-17", "Pld":0, "W":0, "D":0, "L":0},
        {"Season": "2017-18", "Pld":0, "W":0, "D":0, "L":0},
        {"Season": "2018-19", "Pld":0, "W":0, "D":0, "L":0},
        {"Season": "2019-20", "Pld":0, "W":0, "D":0, "L":0}
    ];
    d3.select(".stackedbar").selectAll("svg").remove();
    var stackedBarSvg = d3.select(".stackedbar").append("svg").attr("height", stackedBarHeight-20).attr("width", stackedBarWidth),
        stackedBarMargin = {top: 30, right: 40, bottom: 40, left: 50},
        stackChartWidth = +stackedBarSvg.attr("width") - stackedBarMargin.left - stackedBarMargin.right,
        stackChartHeight = +stackedBarSvg.attr("height") - stackedBarMargin.top - stackedBarMargin.bottom,
        matchesStackedBarChart = stackedBarSvg.append("g").attr("transform", "translate(" + stackedBarMargin.left + "," + stackedBarMargin.top + ")");
    // set x scale
    var stackedBarXScale = d3.scaleBand()
        .rangeRound([0, stackChartWidth-60])
        .paddingInner(0.3)
        .align(0.1);

    // set y scale
    var stackedBarYScale = d3.scaleLinear()
        .rangeRound([stackChartHeight, 50]);

    // set the colors
    var stackedBarZScale = d3.scaleOrdinal()
        .range(["#E4D866", "#F19B47","#CB4747"]);
    $.post("", {'data_type': 'league_tables'}, function (data) {
        data = JSON.parse(data);
        data.map(function (d) {
            for (i = 0; i < season_wise_stats_for_stacked_bar.length; i++) {
                if ((d['Season'] === season_wise_stats_for_stacked_bar[i].Season) && dummy_clubs_set.includes(d['Club'])) {
                    season_wise_stats_for_stacked_bar[i].Pld += +d['Pld'];
                    season_wise_stats_for_stacked_bar[i].W += +d['W'];
                    season_wise_stats_for_stacked_bar[i].D += +d['D'];
                    season_wise_stats_for_stacked_bar[i].L += +d['L'];
                }
            }
        })
        var keys = Object.keys(data[0]).slice(3, 6);

        data.sort(function(a) { return a.Season; });
        stackedBarXScale.domain(season_wise_stats_for_stacked_bar.map(function (d) {
            return d.Season;
        }));
        // stackedBarYScale.domain([0, d3.max(season_wise_stats_for_stacked_bar, function(d) {
        //     return d.Pld; })]).nice();
        stackedBarYScale.domain([0, d3.max(season_wise_stats_for_stacked_bar, function(d) {
            return d.Pld; })]).nice();
        stackedBarZScale.domain(keys);

        matchesStackedBarChart.append("g")
            .selectAll("g")
            .data(d3.stack().keys(keys)(season_wise_stats_for_stacked_bar))
            .enter().append("g")
            .attr("fill", function(d) { return stackedBarZScale(d.key); })
            .selectAll("rect")
            .data(function(d) { return d; })
            .enter().append("rect")
            .attr("x", function(d) { return stackedBarXScale(d.data.Season); })
            .attr("y", function(d) { return stackedBarYScale(d[1]); })
            .attr("height", function(d) { return stackedBarYScale(d[0]) - stackedBarYScale(d[1]); })
            .attr("width", stackedBarXScale.bandwidth())
            .on("mouseover", function() {
                stackedBarTooltip.style("display", null);
            })
            .on("mouseout", function() {
                stackedBarTooltip.style("display", "none");
            })
            .on("mousemove", function(d) {
                var xPosition = d3.mouse(this)[0] - 2;
                var yPosition = d3.mouse(this)[1] - 2;
                stackedBarTooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
                stackedBarTooltip.select("text").text(d[1]-d[0]);
            });

        matchesStackedBarChart.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + stackChartHeight + ")")
            .call(d3.axisBottom(stackedBarXScale));

        matchesStackedBarChart.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(stackedBarYScale).ticks(null, "s"))
            .append("text")
            .attr("class", "title")
            .attr('transform', 'rotate(-90)')
            .attr("x", 2)
            .attr("y", stackedBarYScale(stackedBarYScale.ticks().pop()) -5)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            // .attr("font-weight", "bold")
            .attr("text-anchor", "Middle");

        var stackedBarLegend = matchesStackedBarChart.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys.slice().reverse())
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        stackedBarLegend.append("rect")
            .attr("x", stackChartWidth - 19)
            .attr("y", stackChartHeight-35)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", stackedBarZScale);

        stackedBarLegend.append("text")
            .attr("class", "legend-text")
            .attr("x", stackChartWidth - 24)
            .attr("y", stackChartHeight-35+9.5)
            .attr("dy", "0.32em")
            .text(function(d) { return d; });

        matchesStackedBarChart.append("text")
            .attr("class", "title-text")
            .attr("x", stackChartWidth-230)
            .attr("y", 15)
            .attr("fill", "#fff")
            .text("Match results per season");
    });
    // Prep the tooltip bits, initial display is hidden
    var stackedBarTooltip = stackedBarSvg.append("g")
        .attr("class", "stackedBar-tooltip")
        .style("display", "none");

    stackedBarTooltip.append("rect")
        .attr("width", 60)
        .attr("height", 20)
        .attr("fill", "white")
        .style("opacity", 0.8);

    stackedBarTooltip.append("text")
        .attr("x", 30)
        .attr("dy", "1.2em")
        .style("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold");
}

const dummy_clubs_set = [];
$.post("", {'data_type': 'club_agg'}, function (data) {
    data = JSON.parse(data);
    data.map(function (d) {
        dummy_clubs_set.push(d.Club);
    })
});
drawMatchesChart(dummy_clubs_set);