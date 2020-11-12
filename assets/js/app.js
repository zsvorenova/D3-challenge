function makeResponsive() {
  // if the SVG area isn't empty when the browser loads,
  // remove it and replace it with a resized version of the chart/svg
  var svgArea = d3.select("body").select("svg");

  // when we resize it removes svg and then recreate it - IMPORTANT!! NEW!!
  if (!svgArea.empty()) {
    svgArea.remove();
  };
  // 1. DEFINE THE VARIABLES 
  // the width of the chart will be defined by the width of the column div for scatter plot
  var svgWidth = parseInt(d3.select(".col-md-9").style("width"));
  var svgHeight = 500;

  var margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 100
  };
  // calculating height/width for the chart
  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // Initial Params for axis
  var chosenXAxis = "poverty";
  var chosenYAxis = "healthcare";
  var r=15;

  // 2. SVG ELEMENT
  // Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
  var svg = d3.select("#scatter")
    .classed("chart", true) // maybe?
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
  // 3. DEFINE FUNCTIONS USED LATER
  // function used for updating x-scale var upon click on axis label
  function xScale(censusData, chosenXAxis) {
      // create scales
      var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) *0.95,
          d3.max(censusData, d => d[chosenXAxis]) * 1])
        .range([0, width]);
    
      return xLinearScale;
    
  };

  // function used for updating y-scale var upon click on axis label
  function yScale(censusData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenYAxis])*0.8,
        d3.max(censusData, d => d[chosenYAxis]) *1.05])
      .range([height, 0]);

    return yLinearScale;
  };

  // function used for updating xAxis var upon click on axis label
  function renderAxes(newXScale, xAxis) {
      var bottomAxis = d3.axisBottom(newXScale);
    
      xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    
      return xAxis;
  };

  // function used for updating yAxis var upon click on axis label
  function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
      return yAxis;
  };

  // function used for updating circles group with a transition to new circles
  function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

      circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    
      return circlesGroup;
  };

  // function used for updating circles group with new tooltip
  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

      var labelX;
      var labelY;

      switch(chosenXAxis) {
        case "poverty":
          labelX = "Poverty(%):";
          break;
        case "income":
          labelX = "Income:"
          break;
        default:
          labelX = "Age:";
      };
      
      switch(chosenYAxis) {
        case "healthcare":
          labelX = "Healthcare:";
          break;
        case "obesity":
          labelX = "Obesity:"
          break;
        default:
          labelX = "Smokes:";
      };

      var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
          return (`${d.state}<br>${labelX} ${d[chosenXAxis]}<br>${labelY} ${d[chosenYAxis]}%`);
        });
    
      circlesGroup.call(toolTip);
    
      circlesGroup.on("mouseover", toolTip.show)
        // onmouseout event
        .on("mouseout", toolTip.hide);
    
      return circlesGroup;
  };

  // function to update text in the circles 
  function renderCircleText(circlesText, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    
    circlesText.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis])+r/2);
    
      return circlesText;
  };


  // 4. READ DATA FILE AND PROCESS DATA
  d3.csv("../assets/data/data.csv").then(function(censusData, err) {
      if (err) throw err;

      // Data Exploration
      //console.log(censusData)
      
      // A: parse data - set values to numerical data types
      censusData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
      });

      // B: Create scales for x and y axis using function defined above
      var xLinearScale = xScale(censusData, chosenXAxis)
      var yLinearScale = yScale(censusData, chosenYAxis)

      // C: Create axis functions
      var bottomAxis = d3.axisBottom(xLinearScale);
      var leftAxis = d3.axisLeft(yLinearScale);

      // D: Append Axes to the chart
      var xAxis = chartGroup.append("g")
          .classed("x-axis", true)
          .attr("transform", `translate(0, ${height})`)
          .call(bottomAxis);

      var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

      // E: Create group for three x-axis labels
      var labelsXGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

      var povertyLabel = labelsXGroup.append("text")
          .attr("x", 0)
          .attr("y", 20)
          .attr("value", "poverty") // value to grab for event listener
          .classed("aText", true)
          .classed("active", true)
          .text("In Poverty %");

      var ageLabel = labelsXGroup.append("text")
          .attr("x", 0)
          .attr("y", 40)
          .attr("value", "age") // value to grab for event listener
          .classed("aText", true)
          .classed("inactive", true)
          .text("Age (Median)");
      
      var incomeLabel = labelsXGroup.append("text")
          .attr("x", 0)
          .attr("y", 60)
          .attr("value", "income") // value to grab for event listener
          .classed("aText", true)
          .classed("inactive", true)
          .text("Household Income (Median)");

      // F: Create group for three y-axis labels
      var labelsYGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")
      
      var healthLabel = labelsYGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("value", "healthcare") // value to grab for event listener
        .attr("dy", "1em")
        .classed("aText", true)
        .classed("active", true)
        .text("Lacks Healthcare (%)");
      
      var smokeLabel = labelsYGroup.append("text")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (height / 2))
        .attr("value", "smokes") // value to grab for event listener
        .attr("dy", "1em")
        .classed("aText", true)
        .classed("inactive", true)
        .text("Smokes (%)");

      var obesityLabel = labelsYGroup.append("text")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("value", "obesity") // value to grab for event listener
        .attr("dy", "1em")
        .classed("aText", true)
        .classed("inactive", true)
        .text("Obese (%)");

      // G: Create Circles
      var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", r)
        .attr("class", "stateCircle")

      // H: adding text to circles
      // http://bl.ocks.org/WilliamQLiu/803b712a4d6efbf7bdb4
      // https://www.dashingd3js.com/svg-text-element
      // http://bl.ocks.org/ChrisJamesC/4474971
      var circlesText = circlesGroup.select("text")
          .data(censusData)
          .enter()
          .append("text")
          .text((d)=>d.abbr)
          .attr("x", d => xLinearScale(d[chosenXAxis]))
          .attr("y", d => yLinearScale(d[chosenYAxis])+r/2)
          .attr("class", "stateText")
          .attr("font-size", r)
      
      // I: updateToolTip function above csv import
      var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
      
      // J: x axis labels event listener
      labelsXGroup.selectAll("text")
          .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");

            if (value !== chosenXAxis) {

              // replaces chosenXAxis with value
              chosenXAxis = value;
              // console.log(chosenXAxis)

              // updates x scale for new data
              xLinearScale = xScale(censusData, chosenXAxis);

              // updates x axis with transition
              xAxis = renderAxes(xLinearScale, xAxis);
              
              // updates circles with new values
              circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

              // update circles text with new values
              circlesText = renderCircleText(circlesText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

              // updates tooltips with new info
              circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

              // changes classes to change bold text
              switch(chosenXAxis) {
                case "age":
                  ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                  povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  break;
                case "income":
                  ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
                  break;
                default:
                  ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                  incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);              
              };
            };
      });

      // K: y-axis event listener 
      labelsYGroup.selectAll("text")
          .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

            // replaces chosenYAxis with value
            chosenYAxis = value;

            console.log(chosenYAxis)

            // functions here found above csv import
            // updates x scale for new data
            yLinearScale = yScale(censusData, chosenYAxis);

            // updates x axis with transition
            yAxis = renderYAxes(yLinearScale, yAxis);
            
            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // update circles text with new x values
            circlesText = renderCircleText(circlesText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            switch(chosenYAxis) {
              case "smokes":
                smokeLabel
                  .classed("active", true)
                  .classed("inactive", false);
                healthLabel
                  .classed("active", false)
                  .classed("inactive", true);
                obesityLabel
                  .classed("active", false)
                  .classed("inactive", true);
                break;
              case "obesity":
                smokeLabel
                  .classed("active", false)
                  .classed("inactive", true);
                healthLabel
                  .classed("active", false)
                  .classed("inactive", true);
                obesityLabel
                  .classed("active", true)
                  .classed("inactive", false);
                break;
              default:
                smokeLabel
                  .classed("active", false)
                  .classed("inactive", true);
                healthLabel
                  .classed("active", true)
                  .classed("inactive", false);
                obesityLabel
                  .classed("active", false)
                  .classed("inactive", true);
            };
          };
      });
    
  }).catch(function(error) {
      console.log(error);
  });
};

// init page and make it responsive
makeResponsive();

d3.select(window).on("resize", makeResponsive);
