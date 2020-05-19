// bubbleChart creation function; instantiate new bubble chart given a DOM element to display it in and a dataset to visualise
function bubbleChart() {
    const bubbleWidth = d3.select(".my-bubble-col").node().getBoundingClientRect().width - 10 - 13;
    const bubbleHeight = d3.select(".my-bubble-col").node().getBoundingClientRect().height - 10 - 13;


    // location to centre the bubbles
    const bubbleCentre = { x: bubbleWidth/2-60, y: bubbleHeight/2+30 };

    // strength to apply to the position forces
    const forceStrength = 0.03;

    // these will be set in createNodes and chart functions
    let bubbleSvg = null;
    let bubbles = null;
    let clubNames = null;
    let bubbleNodes = [];

    // charge is dependent on size of the bubble, so bigger towards the middle
    function charge(d) {
        return Math.pow(d.radius, 2.0) * 0.01
    }

    // create a force simulation and add forces to it
    const simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody().strength(charge))
        // .force('center', d3.forceCenter(centre.x, centre.y))
        .force('x', d3.forceX().strength(forceStrength).x(bubbleCentre.x))
        .force('y', d3.forceY().strength(forceStrength).y(bubbleCentre.y))
        .force('collision', d3.forceCollide().radius(d => d.radius + 1));

    // force simulation starts up automatically, which we don't want as there aren't any nodes yet
    simulation.stop();

    // set up colour scale
    const fillColour = d3.scaleOrdinal()
        .domain([0,1,2,3])
        .range(["#858741", "#E4D866", "#F19B47","#CB4747"]);

    // data manipulation function takes raw data from csv and converts it into an array of node objects
    // each node will store data and visualisation values to draw a bubble
    // rawData is expected to be an array of data objects, read in d3.csv
    // function returns the new node array, with a node for each element in the rawData input
    function createBubbleNodes(rawData) {
        // use max size in the data as the max in the scale's domain
        // note we have to ensure that size is a number
        // ,,,,international_reputation,,,Overall,potential,Power,Skill,skill_moves,Value(EUR),wage_eur

        // size bubbles based on area
        const radiusScale = d3.scaleSqrt()
            .domain([0, 1])
            .range([0, 17])

        // use map() to convert raw data into node data
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

    // main entry point to bubble chart, returned by parent closure
    // prepares rawData for visualisation and adds an svg element to the provided selector and starts the visualisation process
    let bubbleChart = function func(selector, rawData) {
        // convert raw data into nodes data
        bubbleNodes = createBubbleNodes(rawData);

        // create svg element inside provided selector
        bubbleSvg = d3.select(selector)
            .append('svg')
            .attr('width', bubbleWidth)
            .attr('height', bubbleHeight)

        // bind nodes data to circle elements
        const elements = bubbleSvg.selectAll('.bubble2')
            .data(bubbleNodes, d => d.Club)
            .enter()
            .append('g')

        bubbles = elements
            .append('circle')
            .on('mouseover', function (d) {
                // elements.append("text")
                //     .attr('class', 'bubble-text')
                //     // .attr('dy', '.3em')
                //     .style('fill', '#fff')
                //     .style('text-anchor', 'middle')
                //     .attr('x', function() {
                //         return d.x;
                //     })
                //     .attr('y', function() {
                //         return d.y-10;
                //     })
                //     .text(function() {
                //         return d.Club;
                //     });
                bubblePlotTooltip.style("display", null);
            })
            .on('mouseout', function (d) {
                // d3.selectAll('.bubble-text')
                //     .remove()
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
            // .attr("x", 30)
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

        // set simulation's nodes to our newly created nodes array
        // simulation starts running automatically once nodes are set
        simulation.nodes(bubbleNodes)
            .on('tick', ticked)
            .restart();
    }

    // callback function called after every tick of the force simulation
    // here we do the actual repositioning of the circles based on current x and y value of their bound node data
    // x and y values are modified by the force simulation
    function ticked() {
        bubbles
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)

    }

    // return chart function from closure
    return bubbleChart;
}

// new bubble chart instance
let myBubbleChart = bubbleChart();

// function called once promise is resolved and data is loaded from csv
// calls bubble chart function to display inside #vis div
$.post("", {'data_type': 'club_agg'}, function (data) {
    data = JSON.parse(data);
    myBubbleChart('.bubble', data);
});

// $.post("", {'task': task.value, 'datatype': datatype.value}, function (data_received) {
//         updateChart(data_received, task, datatype);
//     });