/* 
Author: jialiangzhao
class: cs444
homework08
content: This is a linear Parallel Coordinates 
report graph. He can freely adjust the location 
of different data, and can also select the data
 you like. Check the four boxes to find the data 
 you want. The framed data will become opaque.

*/



////////////////////////////////////////////////////////////////////////
// Global variables for the dataset 

let data = iris;

// dims will store the four axes in left-to-right display order
let dims = [
  "sepalLength",
  "sepalWidth",
  "petalLength",
  "petalWidth"
];

// mapping from dimension id to dimension name used for text labels
let dimNames = {
  "sepalLength": "Sepal Length",
  "sepalWidth": "Sepal Width",
  "petalLength": "Petal Length",
  "petalWidth": "Petal Width",
};




////////////////////////////////////////////////////////////////////////
// Global variables for the svg

let width = dims.length*125;
let height = 500;
let padding = 50;

let svg = d3.select("#pcplot")
  .append("svg")
  .attr("width", width).attr("height", height);




////////////////////////////////////////////////////////////////////////
// Initialize the x and y scales, axes, and brushes.  
//  - xScale stores a mapping from dimension id to x position
//  - yScales[] stores each y scale, one per dimension id
//  - axes[] stores each axis, one per id
//  - brushes[] stores each brush, one per id
//  - brushRanges[] stores each brush's event.selection, one per id

let xScale = d3.scalePoint()
  .domain(dims)
  .range([padding, width-padding]);

 
let yScales = {};
let axes = {};
let brushes = {};
let brushRanges = {};

//to allow me to 
//adjust the maximum and minimum values of the axis.
let axes1 = {};
let yScales1={};

// For each dimension, we will initialize a yScale, axis, brush, and
// brushRange
dims.forEach(function(dim) {
  //create a scale for each dimension
  yScales[dim] = d3.scaleLinear()
    .domain( d3.extent(data, function(datum) { return datum[dim]; }) )
    .range([height-padding, padding]);

//I created another yscale to allow me to 
//adjust the maximum and minimum values of the axis.
  yScales1[dim]=d3.scaleLinear()
  .domain( d3.extent(data, function(datum) { return datum[dim]; }) )
  .range( [padding ,height-padding] );

//I created another axes1 to allow me to 
//adjust the maximum and minimum values of the axis.
  axes1[dim]=d3.axisLeft()
  .scale(yScales1[dim])
  .ticks(10);
  //set up a vertical axis for each dimensions
  axes[dim] = d3.axisLeft()
    .scale(yScales[dim])
    .ticks(10);
  
  //set up brushes as a 20 pixel width band
  //we will use transforms to place them in the right location
  brushes[dim] = d3.brushY()
    .extent([[-10, padding], [+10, height-padding]]);
  
  //brushes will be hooked up to their respective updateBrush functions
  brushes[dim]
    .on("brush", updateBrush(dim))
    .on("end", updateBrush(dim))

  //initial brush ranges to null
  brushRanges[dim] = null;
});




////////////////////////////////////////////////////////////////////////
// Make the parallel coordinates plots 
let color=function(d){
  if(d.species==="setosa")
  {return "lightgreen"; }

  if(d.species==="versicolor")
  {return "MediumPurple "; }

  if(d.species==="virginica")
  {return "DarkSalmon "; }
}
//Change the current use of yscale when the button is used.
current=yScales;
function path(d){
  return d3.line()(dims.map(function(p){return [xScale(p),current[p](d[p])];}));
}
//Change the current use of path when the button is used.
function path1(d){
  return d3.line()(dims.map(function(p){return [xScale(p),yScales1[p](d[p])];}));
}
// add the actual polylines for data elements, each with class "datapath"
svg.append("g")
  .selectAll(".datapath")
  .data(data)
  .enter()
  .append("path")
  .attr("class", "datapath")
  .attr("d",path)
  .attr("fill","none")
  .attr("stroke",color)
  .attr("stroke-width",2)
  .attr("opacity",0.75);
  //TODO: write the rest of this

// add the axis groups, each with class "axis"
svg.selectAll(".axis")
.data(dims).enter()
.append("g")
.attr("class","axis")
.attr("transform",function(d){return "translate("+xScale(d)+")"})
.each(function(d){d3.select(this).call(axes[d]);})

//TODO: write the rest of this

// add the axes labels, each with class "label"
svg.selectAll(".label")
.data(dims).enter()
.append("text")
.attr("class","label")
.style("text-anchor", "middle")
.attr("y", 20)
.attr("transform", function(d) { return "translate(" + xScale(d) + ")"; })
.text(function(d) {return dimNames[d]; })
.style("fill", "black");

  //TODO: write the rest of this, be sure to set the click function

// add the brush groups, each with class ".brush" 


svg.selectAll(".brush")
.data(dims).enter()
.append("g")
.attr("id","brush")
.attr("class",function(d,i){return "brush"+i;})
.attr("transform", function(d) { return "translate(" + xScale(d) + ")"; })
.each(function(d,i){
  d3.select(this)
  .call(brushes[d]);})
  //TODO: write the rest of this

  //brushes[dim] = d3.brushY()
  //.extent([[-10, padding], [+10, height-padding]]);


////////////////////////////////////////////////////////////////////////
// Interaction Callbacks


// Callback for swapping axes when a text label is clicked.
function onClick(event,d) {
  //It is realized that if the label is on the 
  //right, it will move to the left, and the others 
  //will move to the right.
  if(d!==dims[3]){
    index=dims.indexOf(d);
    dims[index]=dims[index+1];
    dims[index+1]=d;
  
  }else{
    index=dims.indexOf(d);
    dims[index]=dims[index-1];
    dims[index-1]=d;
  }
  //Readjust the x-axis.
  xScale = d3.scalePoint()
  .domain(dims)
  .range([padding, width-padding]);
  let a=d3.select("body").selectAll("text.label");
  a.transition().duration(1000)
  .style("text-anchor", "middle")
  .attr("y", 20)
  .attr("transform", function(d) { return "translate(" + xScale(d) + ")"; })
  .text(function(d) {return dimNames[d]; })
  .style("fill", "black");

  //Readjust the path.
  let way=d3.select("body").selectAll(".datapath");
  way.transition().duration(1000)
  .attr("d",path)
  .attr("fill","none")
  .attr("stroke",color)
  .attr("stroke-width",2);

  //Readjust the x-axis.
  let line=d3.select("body").selectAll("g.axis");
  line.transition().duration(1000)
  .attr("transform",function(d){return "translate("+xScale(d)+")"});
  


  onBrush(current);


}

function Callback(){
let name=d3.select("body").selectAll("text.label");
  name.on("click",onClick);
  
}
Callback();
// Returns a callback function that calls onBrush() for the brush
// associated with each dimension
function updateBrush(dim) {
  return function(event) {
    brushRanges[dim] = event.selection;
    onBrush(current);
  };
}

// Callback when brushing to select elements in the PC plot


//I added the scale to detect what the current 
//scale is and prepare for the button change.
function onBrush(scale) {
  let allLines = d3.selectAll(".datapath");
  
  brush0=brushRanges["sepalLength"];
  brush1=brushRanges["sepalWidth"];
  brush2=brushRanges["petalLength"];
  brush3=brushRanges["petalWidth"];

  function isSelected(d) {
  x=dims[0];
  y=dims[1];
  z=dims[2];
  w=dims[3];
  sl=scale[x](d[x]);
  sw=scale[y](d[y]);
  pl=scale[z](d[z]);
  pw=scale[w](d[w]);
  

  true0=false;
  true1=false;
  true2=false;
  true4=false;

  if(brush0===null){true0=true;}
  else{true0=brush0[0]<=sl && sl<=brush0[1];}
  
  if(brush1===null){true1=true;}
  else{true1=brush1[0]<=sw && sw<=brush1[1];}

  if(brush2===null){true2=true;}
  else{true2=brush2[0]<=pl && pl<=brush2[1];}

  if(brush3===null){true3=true;}
  else{true3=brush3[0]<=pw && pw<=brush3[1];}

  return true0 && true1 && true2 && true3;

  }

  let selected = allLines
    .filter(isSelected).attr("opacity",0.75);
  let notSelected = allLines
    .filter(function(d) { return !isSelected(d); })
    .attr("opacity",0.1);

  // Update the style of the selected and not selected data

  // TODO: write this
}


//This is the button function I added, every 
//time when the button is pressed. The path and y-axis 
//will be refreshed. It can also be changed when using 
//the brush.
var buttonList = [
  {
      id: "button-1",
      text: "low to high",
      click: function() { 
        current=yScales1;
        d3.selectAll("g.axis")
      .transition().duration(10000)
      .each(function(d){d3.select(this).call(axes1[d]);}); 
    
     way=d3.select("body").selectAll(".datapath");
  way.transition().duration(1000)
  .attr("d",path)
  .attr("fill","none")
  .attr("stroke",color)
  .attr("stroke-width",2);
    
  onBrush(current);
    }
  },
{id: "button-2",
text: "high to low",
click: function() { 
  current=yScales;
  d3.selectAll("g.axis")
.transition().duration(10000)
.each(function(d){d3.select(this).call(axes[d]);});

 way=d3.select("body").selectAll(".datapath");
  way.transition().duration(1000)
  .attr("d",path)
  .attr("fill","none")
  .attr("stroke",color)
  .attr("stroke-width",2);

  onBrush(current);

}}]
  svg.select("body")
    .data(buttonList)
    .enter()
    .append("button")
    .attr("id", function(d) { return d.id; })
    .text(function(d) { return d.text; })
    .on("click", function(event, d) {
        return d.click();
    });