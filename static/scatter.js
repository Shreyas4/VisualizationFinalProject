var scatterMargin = {top: 10, right: 10, bottom: 10, left: 15},
    scatterWidth = d3.select(".my-scatter-col").node().getBoundingClientRect().width - scatterMargin.left - scatterMargin.right,
    scatterHeight = d3.select(".my-scatter-col").node().getBoundingClientRect().height - scatterMargin.top - scatterMargin.bottom;

// append the svg object to the body of the page
var svgScatter = d3.select(".scatterplot")
    .append("svg")
    .attr("width", scatterWidth)
    .attr("height", scatterHeight)
    .style("display", "block")
    .style("margin", "auto")
    .append("g")
    .attr("transform",
        "translate(" + scatterMargin.left + "," + scatterMargin.top + ")");

//Read the data
$.post("", {'data_type': 'club_agg'}, function (data) {
    data = JSON.parse(data);

    // Add X axis
    var pc1 = data.map(function (a) { return a.pc1*100;});
    var pc2 = data.map(function (a) { return a.pc2*100;})
    var scatterXScale = d3.scaleLinear()
        .range([ 0, scatterWidth-110 ])
        .domain([d3.min(pc1), d3.max(pc1)]);
    var scatterYScale = d3.scaleLinear()
        .range([ scatterHeight-30, 65])
        .domain([d3.min(pc2), d3.max(pc2)]);
    svgScatter.append("g")
        .call(d3.axisBottom(scatterXScale))
        .attr("class", "axis")
        .attr("transform", "translate(0," + scatterYScale(0) + ")")
        .append("text")
        .attr("class", "title")
        .attr("x", scatterXScale(210))
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("PC-1 (x100)");

    // Add Y axis
    svgScatter.append("g")
        .call(d3.axisLeft(scatterYScale))
        .attr("class", "axis")
        .attr("transform", "translate(" + scatterXScale(0) + ", 0)")
        .append("text")
        .attr("class", "title")
        .attr("x", scatterXScale(-120))
        .attr("y", scatterYScale(57))
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("PC-2 (x100)");

    // Color scale: give me a specie name, I return a color
    var color = d3.scaleOrdinal()
        .domain([0,1,2,3])
        // .range(["#f8ffca", "#b6d084", "#ffcb32", "#2f7604"]);
        .range(["#858741", "#F19B47","#CB4747", "#E4D866"]);


    // Add dots
    var myCircle = svgScatter.append('g')
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return scatterXScale(d.pc1*100); } )
        .attr("cy", function (d) { return scatterYScale(d.pc2*100); } )
        .attr("r", 5)
        .style("fill", function (d) { return color(d.cluster) } )
        .style("opacity", 0.8)

    // Add brushing
    svgScatter
        .call( d3.brush()                 // Add the brush feature using the d3.brush function
            .extent( [ [0,50], [scatterWidth-110,scatterHeight-25] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
            // .on("end brush", brushStart)
            .on("brush", updateScatterOnBrush)
            .on("end", updateScatterOnBrushEnd)// Each time the brush selection changes, trigger the 'updateChart' function
        )

    var scatterplotLegend = svgScatter.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data([0,1,2,3])
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        scatterplotLegend.append("rect")
            .attr("x", scatterWidth - 50)
            .attr("y", scatterHeight-100)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", color);

        scatterplotLegend.append("text")
            .attr("class", "legend-text")
            .attr("x", scatterWidth - 55)
            .attr("y", scatterHeight-100+9.5)
            .attr("dy", "0.32em")
            .text(function(d) { return "Cluster "+(d+1); });

        svgScatter.append("text")
            .attr("class", "title-text")
            .attr("x", scatterWidth-120)
            .attr("y", 35)
            .attr("fill", "#fff")
            .text("PCA Plot");

    // Function that is triggered when brushing is performed
    function updateScatterOnBrush() {
        brushExtent = d3.event.selection
        var clubList = d3.selectAll("circle").data().filter(function (d) {
            if (isBrushed(brushExtent, scatterXScale(d.pc1*100), scatterYScale(d.pc2*100))){
                return true;
            }
        });
        var half_length = Math.ceil(clubList.length / 2);

        var leftSide = clubList.splice(0,half_length);
        leftSide = leftSide.map(function (d) {
            return d.Club;
        })
        brush2(leftSide);
        d3.selectAll("circle").classed("selected", function(d){ return isBrushed(brushExtent, scatterXScale(d.pc1*100), scatterYScale(d.pc2*100) ) } )
        d3.selectAll("circle").classed("not-selected", function(d){ return !isBrushed(brushExtent, scatterXScale(d.pc1*100), scatterYScale(d.pc2*100) ) } )
    }

    function updateScatterOnBrushEnd() {
        if (d3.event.selection !== null) return;
        d3.selectAll("circle").classed("selected", false )
        d3.selectAll("circle").classed("not-selected", false )
        var clubList = d3.selectAll("circle").data().filter(function (d) {
            return true;
        });
        var half_length = Math.ceil(clubList.length / 2);

        var leftSide = clubList.splice(0,half_length);
        leftSide = leftSide.map(function (d) {
            return d.Club;
        })
        brush2(leftSide);
    }

    // A function that return TRUE or FALSE according if a dot is in the selection or not
    function isBrushed(brush_coords, cx, cy) {
        var x0 = brush_coords[0][0],
            x1 = brush_coords[1][0],
            y0 = brush_coords[0][1],
            y1 = brush_coords[1][1];
        return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;    // This return TRUE or FALSE depending on if the points is in the selected area
    }

})

function updateScatterOnSelectionFromParallelCoordinates(selected_clubs) {
    d3.selectAll("circle").classed("selected", function(d){ return selected_clubs.includes(d['Club']) } )
    d3.selectAll("circle").classed("not-selected", function(d){ return !selected_clubs.includes(d['Club']) } )
}