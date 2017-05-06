var states = ["", "Alabama", "Alaska", "", "Arizona", "Arkansas", "California", "", "Colorado", "Connecticut", "Delaware", "",
    "Florida", "Georgia", "", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas",
    "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
    "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
    "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
    "Pennsylvania", "", "Rhodes Island", "South Carolina", "South Dakota", "Tennessee", "Texas",
    "Utah", "Vermont", "Virginia", "", "Washington", "West Virginia", "Wisconsin", "Wyoming"];

var months = ["January", "January", "February", "March", "April", "May",
    "June", "July", "August", "September", "October", "November", "December"]

var dataset;
var width = 960;
var height = 600;
var svg = d3.select('svg')
	.attr('width', width)
	.attr('height', height);
var statesData = [];
for(var i = 0; i < states.length; i++)
    statesData[i] = 0;
var statesDataMin = 0;
var statesDataMax = 0;
var path = d3.geoPath();

d3.csv("homicides.csv", function(data) {
    dataset = data.map(function(d) {
        // for each homicide
        stateIdx = states.indexOf(d["State"]);
        if(stateIdx == -1) {
            // Handle case "District of Columbia" because it is also "Washingtown"
            if(d["State"] == "District of Columbia") stateIdx = 40;
            else {
                console.log("[ERROR] State not found: " + d["State"]);
                return;
            }
        }
        infos = [+d["Year"],
               months.indexOf(d["Month"]) + 1,
              +d["Incident"],
               d["Crime Type"],
               d["Crime Solved"] == "Yes",
               d["Victim Sex"] == "Male",
              +d["Victim Age"],
               d["Victim Race"],
               d["Perpetrator Sex"] == "Male",
              +d["Perpetrator Age"],
               d["Perpetrator Race"],
               d["Relationship"],
               d["Weapon"]];
        statesData[stateIdx]++;
        return stateIdx + infos;
    });
    //update min and max
    statesDataMin = d3.min(statesData);
    statesDataMax = d3.max(statesData);
    // load map
    d3.queue()
        .defer(d3.json, "https://d3js.org/us-10m.v1.json")
        .await(ready);
});

function getColor(id) {
    val = Math.round((statesData[id] - statesDataMin) * 255 / (statesDataMax - statesDataMin));
    return (val < 16 ? "0" : "") + val.toString(16);
}

function ready(error, us) {
    if (error) throw error;
    svg.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        // for each state
        .enter().append("path")
        // state color
        .attr("fill", function(d) {c = getColor(parseInt(d.id)); return "#"+c+c+c;})
        .attr("d", path)
        // on mouse over event
        .on("mouseover", function(d){
            return document.getElementById("name").innerHTML = d.id + " - " + states[parseInt(d.id)];
        });
}
