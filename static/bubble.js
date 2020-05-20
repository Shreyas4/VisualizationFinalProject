function bubbleChart() {
    const bubbleWidth = d3.select(".my-bubble-col").node().getBoundingClientRect().width - 10 - 13;
    const bubbleHeight = d3.select(".my-bubble-col").node().getBoundingClientRect().height - 10 - 13;


    const bubbleCentre = { x: bubbleWidth/2-60, y: bubbleHeight/2+30 };

    const forceStrength = 0.03;

    let bubbleSvg = null;
    let bubbles = null;
    let clubNames = null;
    let bubbleNodes = [];

    function charge(d) {
        return Math.pow(d.radius, 2.0) * 0.01
    }

    const simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody().strength(charge))
        .force('x', d3.forceX().strength(forceStrength).x(bubbleCentre.x))
        .force('y', d3.forceY().strength(forceStrength).y(bubbleCentre.y))
        .force('collision', d3.forceCollide().radius(d => d.radius + 1));

    simulation.stop();

    const fillColour = d3.scaleOrdinal()
        .domain([0,1,2,3])
        .range(["#858741", "#F19B47","#CB4747", "#E4D866"]);

    function createBubbleNodes(rawData) {

        const radiusScale = d3.scaleSqrt()
            .domain([0, 1])
            .range([0, 17])

        const myNodes = rawData.map(d => ({
            ...d,
            radius: radiusScale(((((+d.Overall) - d3.min(rawData, d => +d.Overall))/(d3.max(rawData, d => +d.Overall) - d3.min(rawData, d => +d.Overall)))
                +(((+d.Defending) - d3.min(rawData, d => +d.Defending))/(d3.max(rawData, d => +d.Defending) - d3.min(rawData, d => +d.Defending)))
                +(((+d.Attacking) - d3.min(rawData, d => +d.Attacking))/(d3.max(rawData, d => +d.Attacking) - d3.min(rawData, d => +d.Attacking)))
                +(((+d.Goalkeeping) - d3.min(rawData, d => +d.Goalkeeping))/(d3.max(rawData, d => +d.Goalkeeping) - d3.min(rawData, d => +d.Goalkeeping)))
                +(((+d.Age) - d3.min(rawData, d => +d.Age))/(d3.max(rawData, d => +d.Age) - d3.min(rawData, d => +d.Age)))
                +(((+d.Mentality) - d3.min(rawData, d => +d.Mentality))/(d3.max(rawData, d => +d.Mentality) - d3.min(rawData, d => +d.Mentality)))
                +(((+d.Movement) - d3.min(rawData, d => +d.Movement))/(d3.max(rawData, d => +d.Movement) - d3.min(rawData, d => +d.Movement)))
                +(((+d.potential) - d3.min(rawData, d => +d.potential))/(d3.max(rawData, d => +d.potential) - d3.min(rawData, d => +d.potential)))
                +(((+d.Power) - d3.min(rawData, d => +d.Power))/(d3.max(rawData, d => +d.Power) - d3.min(rawData, d => +d.Power)))
                +(((+d.Skill) - d3.min(rawData, d => +d.Skill))/(d3.max(rawData, d => +d.Skill) - d3.min(rawData, d => +d.Skill)))
                +(((+d.skill_moves) - d3.min(rawData, d => +d.skill_moves))/(d3.max(rawData, d => +d.skill_moves) - d3.min(rawData, d => +d.skill_moves)))
                +(((+d['Value(EUR)']) - d3.min(rawData, d => +d['Value(EUR)']))/(d3.max(rawData, d => +d['Value(EUR)']) - d3.min(rawData, d => +d['Value(EUR)'])))
                +(((+d.wage_eur) - d3.min(rawData, d => +d.wage_eur))/(d3.max(rawData, d => +d.wage_eur) - d3.min(rawData, d => +d.wage_eur))))
                /13),
            size: (((((+d.Overall) - d3.min(rawData, d => +d.Overall))/(d3.max(rawData, d => +d.Overall) - d3.min(rawData, d => +d.Overall)))
                +(((+d.Defending) - d3.min(rawData, d => +d.Defending))/(d3.max(rawData, d => +d.Defending) - d3.min(rawData, d => +d.Defending)))
                +(((+d.Attacking) - d3.min(rawData, d => +d.Attacking))/(d3.max(rawData, d => +d.Attacking) - d3.min(rawData, d => +d.Attacking)))
                +(((+d.Goalkeeping) - d3.min(rawData, d => +d.Goalkeeping))/(d3.max(rawData, d => +d.Goalkeeping) - d3.min(rawData, d => +d.Goalkeeping)))
                +(((+d.Age) - d3.min(rawData, d => +d.Age))/(d3.max(rawData, d => +d.Age) - d3.min(rawData, d => +d.Age)))
                +(((+d.Mentality) - d3.min(rawData, d => +d.Mentality))/(d3.max(rawData, d => +d.Mentality) - d3.min(rawData, d => +d.Mentality)))
                +(((+d.Movement) - d3.min(rawData, d => +d.Movement))/(d3.max(rawData, d => +d.Movement) - d3.min(rawData, d => +d.Movement)))
                +(((+d.potential) - d3.min(rawData, d => +d.potential))/(d3.max(rawData, d => +d.potential) - d3.min(rawData, d => +d.potential)))
                +(((+d.Power) - d3.min(rawData, d => +d.Power))/(d3.max(rawData, d => +d.Power) - d3.min(rawData, d => +d.Power)))
                +(((+d.Skill) - d3.min(rawData, d => +d.Skill))/(d3.max(rawData, d => +d.Skill) - d3.min(rawData, d => +d.Skill)))
                +(((+d.skill_moves) - d3.min(rawData, d => +d.skill_moves))/(d3.max(rawData, d => +d.skill_moves) - d3.min(rawData, d => +d.skill_moves)))
                +(((+d['Value(EUR)']) - d3.min(rawData, d => +d['Value(EUR)']))/(d3.max(rawData, d => +d['Value(EUR)']) - d3.min(rawData, d => +d['Value(EUR)'])))
                +(((+d.wage_eur) - d3.min(rawData, d => +d.wage_eur))/(d3.max(rawData, d => +d.wage_eur) - d3.min(rawData, d => +d.wage_eur))))
                /13),
            x: (((((+d.Overall) - d3.min(rawData, d => +d.Overall))/(d3.max(rawData, d => +d.Overall) - d3.min(rawData, d => +d.Overall)))
                +(((+d.Defending) - d3.min(rawData, d => +d.Defending))/(d3.max(rawData, d => +d.Defending) - d3.min(rawData, d => +d.Defending)))
                +(((+d.Attacking) - d3.min(rawData, d => +d.Attacking))/(d3.max(rawData, d => +d.Attacking) - d3.min(rawData, d => +d.Attacking)))
                +(((+d.Goalkeeping) - d3.min(rawData, d => +d.Goalkeeping))/(d3.max(rawData, d => +d.Goalkeeping) - d3.min(rawData, d => +d.Goalkeeping)))
                +(((+d.Age) - d3.min(rawData, d => +d.Age))/(d3.max(rawData, d => +d.Age) - d3.min(rawData, d => +d.Age)))
                +(((+d.Mentality) - d3.min(rawData, d => +d.Mentality))/(d3.max(rawData, d => +d.Mentality) - d3.min(rawData, d => +d.Mentality)))
                +(((+d.Movement) - d3.min(rawData, d => +d.Movement))/(d3.max(rawData, d => +d.Movement) - d3.min(rawData, d => +d.Movement)))
                +(((+d.potential) - d3.min(rawData, d => +d.potential))/(d3.max(rawData, d => +d.potential) - d3.min(rawData, d => +d.potential)))
                +(((+d.Power) - d3.min(rawData, d => +d.Power))/(d3.max(rawData, d => +d.Power) - d3.min(rawData, d => +d.Power)))
                +(((+d.Skill) - d3.min(rawData, d => +d.Skill))/(d3.max(rawData, d => +d.Skill) - d3.min(rawData, d => +d.Skill)))
                +(((+d.skill_moves) - d3.min(rawData, d => +d.skill_moves))/(d3.max(rawData, d => +d.skill_moves) - d3.min(rawData, d => +d.skill_moves)))
                +(((+d['Value(EUR)']) - d3.min(rawData, d => +d['Value(EUR)']))/(d3.max(rawData, d => +d['Value(EUR)']) - d3.min(rawData, d => +d['Value(EUR)'])))
                +(((+d.wage_eur) - d3.min(rawData, d => +d.wage_eur))/(d3.max(rawData, d => +d.wage_eur) - d3.min(rawData, d => +d.wage_eur))))
                /13) * (bubbleWidth),
            y: (((((+d.Overall) - d3.min(rawData, d => +d.Overall))/(d3.max(rawData, d => +d.Overall) - d3.min(rawData, d => +d.Overall)))
                +(((+d.Defending) - d3.min(rawData, d => +d.Defending))/(d3.max(rawData, d => +d.Defending) - d3.min(rawData, d => +d.Defending)))
                +(((+d.Attacking) - d3.min(rawData, d => +d.Attacking))/(d3.max(rawData, d => +d.Attacking) - d3.min(rawData, d => +d.Attacking)))
                +(((+d.Goalkeeping) - d3.min(rawData, d => +d.Goalkeeping))/(d3.max(rawData, d => +d.Goalkeeping) - d3.min(rawData, d => +d.Goalkeeping)))
                +(((+d.Age) - d3.min(rawData, d => +d.Age))/(d3.max(rawData, d => +d.Age) - d3.min(rawData, d => +d.Age)))
                +(((+d.Mentality) - d3.min(rawData, d => +d.Mentality))/(d3.max(rawData, d => +d.Mentality) - d3.min(rawData, d => +d.Mentality)))
                +(((+d.Movement) - d3.min(rawData, d => +d.Movement))/(d3.max(rawData, d => +d.Movement) - d3.min(rawData, d => +d.Movement)))
                +(((+d.potential) - d3.min(rawData, d => +d.potential))/(d3.max(rawData, d => +d.potential) - d3.min(rawData, d => +d.potential)))
                +(((+d.Power) - d3.min(rawData, d => +d.Power))/(d3.max(rawData, d => +d.Power) - d3.min(rawData, d => +d.Power)))
                +(((+d.Skill) - d3.min(rawData, d => +d.Skill))/(d3.max(rawData, d => +d.Skill) - d3.min(rawData, d => +d.Skill)))
                +(((+d.skill_moves) - d3.min(rawData, d => +d.skill_moves))/(d3.max(rawData, d => +d.skill_moves) - d3.min(rawData, d => +d.skill_moves)))
                +(((+d['Value(EUR)']) - d3.min(rawData, d => +d['Value(EUR)']))/(d3.max(rawData, d => +d['Value(EUR)']) - d3.min(rawData, d => +d['Value(EUR)'])))
                +(((+d.wage_eur) - d3.min(rawData, d => +d.wage_eur))/(d3.max(rawData, d => +d.wage_eur) - d3.min(rawData, d => +d.wage_eur))))
                /13) * (bubbleHeight)
        }))

        return myNodes;
    }

    let bubbleChart = function func(selector, rawData) {
        bubbleNodes = createBubbleNodes(rawData);

        bubbleSvg = d3.select(selector)
            .append('svg')
            .attr('width', bubbleWidth)
            .attr('height', bubbleHeight)

        const elements = bubbleSvg.selectAll('.bubble2')
            .data(bubbleNodes, d => d.Club)
            .enter()
            .append('g')

        bubbles = elements
            .append('circle')
            .on('mouseover', function (d) {
                bubblePlotTooltip.style("display", null);
            })
            .on('mouseout', function (d) {
                bubblePlotTooltip.style("display", "none");
            })
            .on('mousemove', function (d) {
                var xPosition = d3.mouse(this)[0]+10;
                var yPosition = d3.mouse(this)[1]+10;
                bubblePlotTooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
                bubblePlotTooltip.select("text").text(d.Club)

            })
            .on('click', function (d) {
                var xPosition = d3.mouse(this)[0]+10;
                var yPosition = d3.mouse(this)[1]+10;
                bubblePlotTooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
                bubblePlotTooltip.select("text").text(d.Club)
                brush2([d.Club]);
            })
            .classed('bubble2', true)
            .attr('r', d => d.radius)
            .attr('fill', d => fillColour(+d.cluster))

        var bubblePlotTooltip = bubbleSvg.append("g")
        .attr("class", "stackedBar-tooltip")
        .style("display", "none");

        bubblePlotTooltip.append("text")
            .attr("dy", "1.2em")
            .style("text-anchor", "start")
            .attr("fill", "#fff")
            .attr("font-family", "Open Sans")
            .attr("font-size", "18px")
            .attr("font-weight", "bold");

         var bubblePlotLegend = d3.select(".bubble").select("svg").append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data([0,1,2,3])
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        bubblePlotLegend.append("rect")
            .attr("x", bubbleWidth-40)
            .attr("y", bubbleHeight -90)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", clusterColors);

        bubblePlotLegend.append("text")
            .attr("class", "legend-text")
            .attr("x", bubbleWidth-45)
            .attr("y", bubbleHeight-90+9.5)
            .attr("dy", "0.32em")
            .text(function(d) { return "Cluster "+(d+1); });

        d3.select(".bubble").select("svg").append("text")
            .attr("class", "title-text")
            .attr("x", bubbleWidth-140)
            .attr("y", 40)
            .attr("fill", "#fff")
            .text("Clubs by size");

        simulation.nodes(bubbleNodes)
            .on('tick', ticked)
            .restart();
    }

    function ticked() {
        bubbles
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)

    }

    return bubbleChart;
}

let myBubbleChart = bubbleChart();

$.post("", {'data_type': 'club_agg'}, function (data) {
    data = JSON.parse(data);
    myBubbleChart('.bubble', data);
});
