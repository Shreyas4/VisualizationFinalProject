// bubbleChart creation function; instantiate new bubble chart given a DOM element to display it in and a dataset to visualise
function bubbleChart() {
    const bubbleWidth = d3.select(".my-bubble-col").node().getBoundingClientRect().width - 10 - 13;
    const bubbleHeight = d3.select(".my-bubble-col").node().getBoundingClientRect().height - 10 - 13;


    // location to centre the bubbles
    const bubbleCentre = { x: bubbleWidth/2, y: bubbleHeight/2 };

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
        .range([ "#CC9752", "#0F3B5F", "#CCCC00","#E5DBCF"]);

    // data manipulation function takes raw data from csv and converts it into an array of node objects
    // each node will store data and visualisation values to draw a bubble
    // rawData is expected to be an array of data objects, read in d3.csv
    // function returns the new node array, with a node for each element in the rawData input
    function createBubbleNodes(rawData) {
        // use max size in the data as the max in the scale's domain
        // note we have to ensure that size is a number
        const maxSize = d3.max(rawData, d => +d.Overall);
        const minSize = d3.min(rawData, d => +d.Overall);

        // size bubbles based on area
        const radiusScale = d3.scaleSqrt()
            .domain([0, maxSize])
            .range([0, 30])

        // use map() to convert raw data into node data
        const myNodes = rawData.map(d => ({
            ...d,
            radius: radiusScale(((+d.Overall) - minSize)/(maxSize - minSize)*40),
            size: ((+d.Overall) - minSize)/(maxSize - minSize),
            x: ((+d.Overall) - minSize)/(maxSize - minSize) * (bubbleWidth),
            y: ((+d.Overall) - minSize)/(maxSize - minSize) * (bubbleHeight)
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
                elements.append("text")
                    .attr('class', 'bubble-text')
                    // .attr('dy', '.3em')
                    .style('fill', '#fff')
                    .style('text-anchor', 'middle')
                    .attr('x', function() {
                        return d.x;
                    })
                    .attr('y', function() {
                        return d.y-10;
                    })
                    .text(function() {
                        return d.Club;
                    });
            })
            .on('mouseout', function (d) {
                d3.selectAll('.bubble-text')
                    .remove()
            })
            .on('click', function (d) {
                brush2([d.Club]);
            })
            .classed('bubble2', true)
            .attr('r', d => d.radius)
            .attr('fill', d => fillColour(+d.cluster))

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
d3.csv("static/Club_AggData.csv", function display(data) {
    myBubbleChart('.bubble', data);
});