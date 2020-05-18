class Gauge {
    constructor(options) {
        this.options = options;

        var {data, width, height, element, clubList} = this.options;
        d3.select(".pieplot").selectAll("svg").remove();
        var pieSvg = d3.select(element)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
        ;

        const color = d3.scaleOrdinal()
            .domain(['Bundesliga', 'Serie A', 'Ligue 1', 'Premier League', 'La Liga'])
            .range([ "#3b2912", "#896029", "#ca954e","#dcb889", "#f3e7d8"])
        ;

        const r = Math.min(width, height) / 3;
        const arc = d3.arc()
            .innerRadius(r - 60)
            .outerRadius(r)
        ;

        const pie = d3.pie()
            .value(d => d.value)
        ;

        const g = pieSvg.append('g')
            .attr('transform', `translate(${width/2},${height/2})`)
        ;

        g.selectAll('.chart-arc')
            .data(pie(data))
            .enter()
            .append('path')
            .attr('class', 'chart-arc')
            .attr('d', arc)
            .style('fill', d => color(d.data.label))
            .on('mouseover', function(){
                pieChartTooltip.style("display", null);
            })
            .on('mousemove', function (d) {
                var xPosition = d3.mouse(this)[0]+180;
                var yPosition = d3.mouse(this)[1]+180;
                pieChartTooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
                pieChartTooltip.select("text").text(d.data.value)

            })
            .on('mouseout', function () {
                pieChartTooltip.style("display", "none");
            }).on('click', function (d) {
            pieChartTooltip.style("display", "none");
            for (var i=0;i<5;i++) {
                if (data[i].label!==d.data.label) {
                    data[i].value = 0
                }
            }
            clubList = clubList.filter(function (x) {
                if (x.League===d.data.label){
                    return true;
                }
            })
            brush2(clubList.map(function (d) {
                return d.Club;
            }));
        })
        ;

        const l = pieSvg.append('g')
            .attr('transform', `translate(0,${height-20})`);


        const xl = d3.scaleBand()
            .range([0, width])
            .padding(0.3)
            .domain(data.map(d => d.label))
        ;

        const legend = l.selectAll('.pie-legend')
            .data(color.domain())
            .enter()
            .append('g')
            .attr('class', 'pie-legend')
            .attr('transform', (d, i) => `translate(${xl(d)+20},0)`)
        ;

        legend.append('rect')
            .attr('width', 12)
            .attr('height', 12)
            .style('fill', color)
        ;

        legend.append('text')
            .attr('text-anchor', 'middle')
            .attr('x', 0)
            .attr('y', -10)
            .style('fill', '#fff')
            .text(d => d)
        ;

        var pieChartTooltip = pieSvg.append("g")
            .attr("class", "stackedBar-tooltip")
            .style("display", "none");

        pieChartTooltip.append("rect")
            .attr("width", 60)
            .attr("height", 20)
            .attr("fill", "white")
            .style("opacity", 0.8);

        pieChartTooltip.append("text")
            .attr("x", 20)
            .attr("dy", "1.2em")
            .style("text-anchor", "start")
            .attr("font-size", "12px")
            .attr("font-weight", "bold");
    }

}

var dummy_club_set_for_pie = [];

function drawPieChart(dummy_club_set_for_pie){
    var dict = [
        {label: 'Bundesliga', value: 0},
        {label: 'Serie A', value: 0},
        {label: 'Ligue 1', value: 0},
        {label: 'Premier League', value: 0},
        {label: 'La Liga', value: 0}
    ];
    if (dummy_club_set_for_pie.length===0){
        d3.csv("static/Club_AggData.csv", function (csv_data) {
            csv_data.map(function (d) {
                for (i=0; i<dict.length;i++){
                    if (dict[i].label===d['league']) {
                        dict[i].value += 1;
                    }
                }
                dummy_club_set_for_pie.push({'Club':d.Club, 'League':d.league})
                return true;
            })
            new Gauge({
                element: '.pieplot',
                width: d3.select(".my-pie-col").node().getBoundingClientRect().width-20,
                height: d3.select(".my-pie-col").node().getBoundingClientRect().height-40,
                data: dict,
                clubList:dummy_club_set_for_pie
            });
        })
    } else {
        for (i=0;i<dummy_club_set_for_pie.length;i++){
            for (j=0;j<dict.length;j++){
                if (dict[j].label===dummy_club_set_for_pie[i].League) {
                    dict[j].value += 1;
                }
            }
        }
        new Gauge({
            element: '.pieplot',
            width: d3.select(".my-pie-col").node().getBoundingClientRect().width-20,
            height: d3.select(".my-pie-col").node().getBoundingClientRect().height-40,
            data: dict,
            clubList:dummy_club_set_for_pie
        });
    }
}
drawPieChart(dummy_club_set_for_pie);