/* Copyright 2013 Google Inc. All Rights Reserved.
** Licensed under the Apache License, Version 2.0
*/

// Dimensions of sunburst.
var width_chart = Math.round($(window).width() * 0.8);
var height_chart = Math.round($(window).height() * 0.8);
width_chart = Math.min(width_chart, height_chart);
height_chart = width_chart;
var radius = width_chart / 2;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
  w: 120, h: 40, s: 3, t: 10
};

// Mapping of step names to colors.
var colors = {
  // solved
  "yes": "#45c966",
  "no": "#ea5455",
  // weapon
  "Handgun": "#0070FF",
  "Knife": "#00B4E8",
  "Rifle": "#00B4E8",
  "Blunt Object": "#00B4E8",
  "Firearm": "#0070FF",
  "Shotgun": "#0070FF",
  "Strangulation": "#00B4E8",
  "Suffocation": "#0070FF",
  "Fire": "#0070FF",
  "Gun": "#00B4E8",
  "Explosives": "#00B4E8",
  "Drowning": "#00B4E8",
  "Poison": "#00B4E8",
  "Drugs": "#00B4E8",
  "Fall": "#0070FF",
  // relationship
  "Husband": "#FFA600",
  "Stranger": "#FFA600",
  "Acquaintance": "#FFA600",
  "Family": "#FFA600",
  "Wife": "#E87300",
  "Son": "#FFA600",
  "Stepmother": "#FFA600",
  "Friend": "#FFA600",
  "Boy/Girlfriend": "#E87300",
  "Daughter": "#E87300",
  "Mother": "#E87300",
  "Father": "#E87300",
  "Stepson": "#E87300",
  "In Law": "#E87300",
  "Neighbor": "#E87300",
  "Brother": "#FF4E00",
  "Ex Wife": "#FF4E00",
  "Employer": "#FF4E00",
  "Ex Husband": "#FF4E00",
  "Stepdaughter": "#FF4E00",
  "Stepfather": "#FF4E00",
  "Sister": "#FF4E00",
  // none
  "end": "#222222"
};

// Total size of all segments; we set this later, after loading the data.
var totalSize = 0;

var vis = d3.select("#chart").append("svg:svg")
    .attr("width", width_chart)
    .attr("height", height_chart)
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", "translate(" + width_chart / 2 + "," + height_chart / 2 + ")");

var partition = d3.partition()
    .size([2 * Math.PI, radius * radius]);

var arc = d3.arc()
    .startAngle(function(d) { return d.x0; })
    .endAngle(function(d) { return d.x1; })
    .innerRadius(function(d) { return Math.sqrt(d.y0); })
    .outerRadius(function(d) { return Math.sqrt(d.y1); });

// Use d3.text and d3.csvParseRows so that we do not need to have a header
// row, and can receive the csv as an array of arrays.
function sunburst(state)
{
    $("#sunburst").on("click", function(d){
        $("#map").css("display", "block");
        $("#sunburst").css("display", "none");
        d3.select("#chart path").remove();
    });
    d3.text("data/sunburst_" + state + ".csv", function(text) {
      var csv = d3.csvParseRows(text);
      var json = buildHierarchy(csv);
      createVisualization(json);
    });
}

// Main function to draw and set up the visualization, once we have the data.
function createVisualization(json)
{
  // Basic setup of page elements.
  initializeBreadcrumbTrail();
  // Bounding circle underneath the sunburst, to make it easier to detect
  // when the mouse leaves the parent g.
  vis.append("svg:circle")
      .attr("r", radius)
      .style("opacity", 0);
  // Turn the data into a d3 hierarchy and calculate the sums.
  var root = d3.hierarchy(json)
      .sum(function(d) { return d.size; })
      .sort(function(a, b) { return b.value - a.value; });
  // For efficiency, filter nodes to keep only those large enough to see.
  var nodes = partition(root).descendants()
      .filter(function(d) {
          return (d.x1 - d.x0 > 0.005); // 0.005 radians = 0.29 degrees
      });
  var path = vis.data([json]).selectAll("path")
      .data(nodes)
      .enter().append("svg:path")
      .attr("class", "p_sunburst")
      .attr("display", function(d) { return d.depth ? null : "none"; })
      .attr("d", arc)
      .attr("fill-rule", "evenodd")
      .style("fill", function(d) { return colors[d.data.name]; })
      .style("opacity", 1)
      .on("mouseover", mouseover_chart);
  // Add the mouseleave handler to the bounding circle.
  d3.select("#container").on("mouseleave", mouseleave_chart);
  // Get total size of the tree = value of root node from partition.
  totalSize = path.datum().value;
 };

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover_chart(d)
{
  console.log("[INFO] Sunburst mouseover");
  var percentage = (100 * d.value / totalSize).toPrecision(3);
  var percentageString = percentage + "%";
  if (percentage < 0.1) {
    percentageString = "< 0.1%";
  }
  d3.select("#percentage")
      .text(percentageString);
  d3.select("#explanation")
      .style("visibility", "");
  var sequenceArray = d.ancestors().reverse();
  sequenceArray.shift(); // remove root node from the array
  updateBreadcrumbs(sequenceArray, percentageString);
  // Fade all the segments.
  d3.selectAll(".p_sunburst")
      .style("opacity", 0.3);
  // Then highlight only those that are an ancestor of the current segment.
  vis.selectAll(".p_sunburst")
      .filter(function(node) {
                return (sequenceArray.indexOf(node) >= 0);
              })
      .style("opacity", 1);
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave_chart(d)
{
  console.log("[INFO] Sunburst mouseleave");
  // Hide the breadcrumb trail
  d3.select("#trail")
      .style("visibility", "hidden");
  // Deactivate all segments during transition.
  d3.selectAll(".p_sunburst").on("mouseover", null);
  // Transition each segment to full opacity and then reactivate it.
  d3.selectAll(".p_sunburst")
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .on("end", function() {
              d3.select(this).on("mouseover", mouseover_chart);
          });
  d3.select("#explanation")
      .style("visibility", "hidden");
}

function initializeBreadcrumbTrail()
{
  // Add the svg area.
  var trail = d3.select("#sequence").append("svg:svg")
      .attr("width", width_chart)
      .attr("height", 40)
      .attr("id", "trail");
  // Add the label at the end, for the percentage.
  trail.append("svg:text")
    .attr("id", "endlabel")
    .style("fill", "#BBBBBB");
}

// Generate a string that describes the points of a breadcrumb polygon.
function breadcrumbPoints(d, i)
{
  var points = [];
  points.push("0,0");
  points.push(b.w + ",0");
  points.push(b.w + b.t + "," + (b.h / 2));
  points.push(b.w + "," + b.h);
  points.push("0," + b.h);
  if (i > 0) // Leftmost breadcrumb; don't include 6th vertex.
    points.push(b.t + "," + (b.h / 2));
  return points.join(" ");
}

// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray, percentageString)
{
  // Data join; key function combines name and depth (= position in sequence).
  var trail = d3.select("#trail")
      .selectAll("g")
      .data(nodeArray, function(d) { return d.data.name + d.depth; });
  // Remove exiting nodes.
  trail.exit().remove();
  // Add breadcrumb and label for entering nodes.
  var entering = trail.enter().append("svg:g");

  entering.append("svg:polygon")
      .attr("points", breadcrumbPoints)
      .style("fill", function(d) { return colors[d.data.name]; });
  entering.append("svg:text")
      .attr("x", (b.w + b.t) / 2)
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .style("fill", "#222")
      .text(function(d) { return d.data.name; });
  // Merge enter and update selections; set position for all nodes.
  entering.merge(trail).attr("transform", function(d, i) {
    return "translate(" + i * (b.w + b.s) + ", 0)";
  });
  // Now move and update the percentage at the end.
  d3.select("#trail").select("#endlabel")
      .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(percentageString);
  // Make the breadcrumb trail visible, if it's hidden.
  d3.select("#trail")
      .style("visibility", "");
}

// Take a 2-column CSV and transform it into a hierarchical structure suitable
// for a partition layout. The first column is a sequence of step names, from
// root to leaf, separated by hyphens. The second column is a count of how
// often that sequence occurred.
function buildHierarchy(csv)
{
  var root = {"name": "root", "children": []};
  for (var i = 0; i < csv.length; i++) {
    var sequence = csv[i][0];
    var size = +csv[i][1];
    if (isNaN(size)) // e.g. if this is a header row
      continue;
    var parts = sequence.split("-");
    var currentNode = root;
    for (var j = 0; j < parts.length; j++) {
      var children = currentNode["children"];
      var nodeName = parts[j];
      var childNode;
      if (j + 1 < parts.length) {
   // Not yet at the end of the sequence; move down the tree.
 	var foundChild = false;
 	for (var k = 0; k < children.length; k++) {
 	  if (children[k]["name"] == nodeName) {
 	    childNode = children[k];
 	    foundChild = true;
 	    break;
 	  }
 	}
  // If we don't already have a child node for this branch, create it.
 	if (!foundChild) {
 	  childNode = {"name": nodeName, "children": []};
 	  children.push(childNode);
 	}
 	currentNode = childNode;
      } else {
 	// Reached the end of the sequence; create a leaf node.
 	childNode = {"name": nodeName, "size": size};
 	children.push(childNode);
      }
    }
  }
  return root;
};
