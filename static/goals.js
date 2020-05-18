const goalsBarHeight = d3.select(".my-stackedbar2-col").node().getBoundingClientRect().height;
const goalsBarWidth = d3.select(".my-stackedbar2-col").node().getBoundingClientRect().width;

function drawGoalsChart(dummy_clubs_set_for_goals) {
    const season_wise_stats_for_goals_bar = [
        {"Season": "2014-15", "GA": 0, "GF": 0},
        {"Season": "2015-16", "GA": 0, "GF": 0},
        {"Season": "2016-17", "GA": 0, "GF": 0},
        {"Season": "2017-18", "GA": 0, "GF": 0},
        {"Season": "2018-19", "GA": 0, "GF": 0},
        {"Season": "2019-20", "GA": 0, "GF": 0}
    ];
    d3.select(".stackedbar2").selectAll("svg").remove();
    const goalsBarSvg = d3.select(".stackedbar2").append("svg").attr("height", goalsBarHeight - 20).attr("width", goalsBarWidth),
        goalsBarMargin = {top: 30, right: 40, bottom: 40, left: 50},
        goalsChartWidth = +goalsBarSvg.attr("width") - goalsBarMargin.left - goalsBarMargin.right,
        goalsChartHeight = +goalsBarSvg.attr("height") - goalsBarMargin.top - goalsBarMargin.bottom,
        goalsStackedBarChart = goalsBarSvg.append("g").attr("transform", "translate(" + goalsBarMargin.left + "," + goalsBarMargin.top + ")");
    // set x scale
    const goalsBarXScale = d3.scaleBand()
        .rangeRound([0, goalsChartWidth - 60])
        .paddingInner(0.3)
        .align(0.1);

    // set y scale
    const goalsBarYScale = d3.scaleLinear()
        .rangeRound([goalsChartHeight, 50]);

    // set the colors
    const goalsBarZScale = d3.scaleOrdinal()
        .range(["#F19B47","#CB4747"]);
    // load the csv and create the chart
    d3.csv("static/league_tables.csv", function(error, data) {
        if (error) throw error;
        data.map(function (d) {
            for (i = 0; i < season_wise_stats_for_goals_bar.length; i++) {
                if ((d['Season'] === season_wise_stats_for_goals_bar[i].Season) && dummy_clubs_set_for_goals.includes(d['Club'])) {
                    season_wise_stats_for_goals_bar[i].GA += +d['GA'];
                    season_wise_stats_for_goals_bar[i].GF += +d['GF'];
                }
            }
        })
        var keys = data.columns.slice(6,8);

        data.sort(function(a) { return a.Season; });
        goalsBarXScale.domain(season_wise_stats_for_goals_bar.map(function (d) {
            return d.Season;
        }));
        // stackedBarYScale.domain([0, d3.max(season_wise_stats_for_stacked_bar, function(d) {
        //     return d.Pld; })]).nice();
        goalsBarYScale.domain([0, d3.max(season_wise_stats_for_goals_bar, function(d) {
            return d.GF+d.GA; })]).nice();
        goalsBarZScale.domain(keys);

        goalsStackedBarChart.append("g")
            .selectAll("g")
            .data(d3.stack().keys(keys)(season_wise_stats_for_goals_bar))
            .enter().append("g")
            .attr("fill", function(d) { return goalsBarZScale(d.key); })
            .selectAll("rect")
            .data(function(d) { return d; })
            .enter().append("rect")
            .attr("x", function(d) { return goalsBarXScale(d.data.Season); })
            .attr("y", function(d) { return goalsBarYScale(d[1]); })
            .attr("height", function(d) { return goalsBarYScale(d[0]) - goalsBarYScale(d[1]); })
            .attr("width", goalsBarXScale.bandwidth())
            .on("mouseover", function() {
                goalsBarTooltip.style("display", null);
            })
            .on("mouseout", function() { goalsBarTooltip.style("display", "none"); })
            .on("mousemove", function(d) {
                var xPosition = d3.mouse(this)[0] - 2;
                var yPosition = d3.mouse(this)[1] - 2;
                goalsBarTooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
                goalsBarTooltip.select("text").text(d[1]-d[0]);
            });

        goalsStackedBarChart.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + goalsChartHeight + ")")
            .call(d3.axisBottom(goalsBarXScale));

        goalsStackedBarChart.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(goalsBarYScale).ticks(null, "s"))
            .append("text")
            .attr("class", "title")
            .attr('transform', 'rotate(-90)')
            .attr("x", 2)
            .attr("y", goalsBarYScale(goalsBarYScale.ticks().pop()) -5)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            // .attr("font-weight", "bold")
            .attr("text-anchor", "Middle");

        var goalsBarLegend = goalsStackedBarChart.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys.slice().reverse())
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        goalsBarLegend.append("rect")
            .attr("x", goalsChartWidth - 19)
            .attr("y", goalsChartHeight-20)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", goalsBarZScale);

        goalsBarLegend.append("text")
            .attr("class", "legend-text")
            .attr("x", goalsChartWidth - 24)
            .attr("y", goalsChartHeight-20+9.5)
            .attr("dy", "0.32em")
            .text(function(d) { return d; });

        goalsStackedBarChart.append("text")
            .attr("class", "title-text")
            .attr("x", goalsChartWidth-270)
            .attr("y", 15)
            .attr("fill", "#fff")
            .text("Ratio of Goals F/A per season");
    });
    // Prep the tooltip bits, initial display is hidden
    var goalsBarTooltip = goalsBarSvg.append("g")
        .attr("class", "stackedBar-tooltip")
        .style("display", "none");

    goalsBarTooltip.append("rect")
        .attr("width", 60)
        .attr("height", 20)
        .attr("fill", "white")
        .style("opacity", 0.8);

    goalsBarTooltip.append("text")
        .attr("x", 30)
        .attr("dy", "1.2em")
        .style("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold");
}
const dummy_clubs_set_for_goals = [];
d3.csv("static/Club_AggData.csv", function(error, data) {
    data.map(function (d) {
        dummy_clubs_set_for_goals.push(d.Club);
    })
});
drawGoalsChart(dummy_clubs_set_for_goals);