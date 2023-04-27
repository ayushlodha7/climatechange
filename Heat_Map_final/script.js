const padding = {left: 70, right: 115, top: 40, bottom: 40};
const width = 1200;
const height = 600;
const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

const colors = ['#022873','#2d62cc','#87fbff', '#57cf5f','#efff87','#ffffbf','#fee08b','#fdae61','#f46d43','#d73027','#a50026']
 
const svg = d3.select('#heatMap')
              .append('svg')
              .attr('viewBox', '0 0 ' + width + ' ' + height)
              .attr('preserveAspectRatio', 'xMinYMin meet');

/* Sample data
{ "baseTemperature": 8.66,
  "monthlyVariance": [
    {
      "year": 1753,
      "month": 1,
      "variance": -1.366
    },
    {
      "year": 1753,
      "month": 2,
      "variance": -2.223
    }]
} */

d3.json(url).then(function(jsonData) {
  
  var baseTemp = jsonData.baseTemperature;
  var Data = jsonData.monthlyVariance;

  d3.select('#description')
    .html(d3.min(jsonData.monthlyVariance, d => d.year) + ' - ' + d3.max(jsonData.monthlyVariance, d => d.year) + ', Base Temperature: ' + baseTemp + '&#8451;');
  
  //Change numerical months to 0 based indexing
  Data.forEach(d => d.month -= 1);
  
  // find the lowest and highest values of variance from base temp
  // will be used to determine color of rectangle
  var colorDomain = d3.extent(Data.map(d => baseTemp + d.variance));
  var colorScale = d3.scaleQuantile()
                     .domain(colorDomain)
                     .range(colors);
  
  //X & Y Scales
  const xScale = d3.scaleBand()
                   .domain(Data.map(d => d.year))
                   .range([padding.left, width - padding.right])
                   .paddingOuter(0.5);

  const yScale = d3.scaleBand()
                  .domain([0,1,2,3,4,5,6,7,8,9,10,11])
                  .range([height - padding.top, padding.bottom]);

  //x-Axis  
  const xAxis = d3.axisBottom(xScale)
                  .tickFormat(d3.format("d"))
                  .tickSizeOuter(0)
                  .tickValues(xScale.domain().filter(yr => yr % 10 === 0)); //set ticks to years divisible by 10

    svg.append("g")
       .attr("transform", "translate(0," + (height - padding.top) + ")")
       .attr("id", "x-axis")
       .style('font-size', 12)
       .call(xAxis);

  //Y-Axis
  const yAxis = d3.axisLeft(yScale)
                  .tickFormat(month => {
                      var dateM = new Date()
                      dateM.setUTCMonth(month)
                      return d3.timeFormat("%B")(dateM)})
                  .tickSizeOuter(0)

  svg.append("g")
      .attr("transform", "translate(" + padding.left + ", 0)")
      .attr("id", "y-axis")
      .style('font-size', 12)
      .call(yAxis)
 
  //Label for x-Axis
  svg.append('text')
      .attr('x', (width - padding.left) /2 + 10)
      .attr('y', height - padding.bottom + 38)
      .text('Year')
      .style('font-size', 15)
      .style('font-weight', 'bold')
  
  //Label for y-Axis
  svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -width/4)
      .attr('y', padding.top - 30)
      .text('Months')
      .style('font-size', 15)
      .style('font-weight', 'bold')
  
  //tool tip
  var tip = d3.tip()
              .attr('id', 'tooltip')
              .offset(function(){ return [this.getBBox().height / 2, 0] })
              .html(d => {
                    var date = new Date(d.year, d.month)
                    d3.select('#tooltip').attr('data-year', d.year)
                    return "<span>" + d3.timeFormat("%B %Y")(date) + "<br>Temp: " + (baseTemp + d.variance).toFixed(2) + '&#8451;' + "<br>Variance: " + d.variance + "</span>"
                    })
  svg.call(tip);

  //plot the heat map
  svg.selectAll("rect .cell")
      .data(Data)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.year))
      .attr("y", d => yScale(d.month))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", d => colorScale(baseTemp + d.variance))
      .attr("class", "cell")
      .attr("data-month", d => d.month)
      .attr("data-year", d => d.year)
      .attr("data-temp", d => baseTemp + d.variance)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)


      //legend
      svg.append("g")
      .attr("class", "legend")
      .attr("id", "legend")
      .attr("transform", "translate(" + (width - padding.right + 10) + ", " + (padding.top) + ")");

      var legend = d3.legendColor()
        .labelFormat(d3.format(".2f"))
        .shapePadding(6)
        .shapeWidth(20)
        .shapeHeight(30)
        .labelAlign("middle")
        .labelDelimiter("-")
        .labelOffset(5)
        .scale(colorScale);

      svg.select(".legend")
        .call(legend);
   
});