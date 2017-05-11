var statesNames = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
    "Washington_", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas",
    "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
    "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
    "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
    "Pennsylvania", "Rhodes Island", "South Carolina", "South Dakota", "Tennessee", "Texas",
    "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];

var months = ["January", "January", "February", "March", "April", "May",
    "June", "July", "August", "September", "October", "November", "December"]

function State(name) {
    this.name = name;
    this.id = 0;
    this.death = 0;  // number of death (men + women)
    this.men = 0;    // number of death (men)
    // Black, White, Native American, Asian
    this.ethnic = [0, 0, 0, 0];
    this.color = "#000000";
}

// map position and size
var ratio = 1.67; // width on height country ratio
var width = $(window).width() * 0.8;
var height = width / ratio;
if($(window).width() / $(window).height() > ratio) {
    height = $(window).height() * 0.8;
    width = height * ratio;
}
$("#map").css("top", (($(window).height() - height) / 2) + "px");
$("#map").css("left", (($(window).width() - width) / 2) + "px");
var svg = d3.select('svg')
    .style("width", width + 'px')
    .style("height", height + 'px');
// init states data
var statesData = [];
for(var i = 0; i < statesNames.length; i++)
    statesData[i] = new State(statesNames[i]);
minDeath = 0;
maxDeath = 0;
var path = d3.geoPath();
// convert state id to statesNames array index
idlnk = []
// convert statesNames array index into state id
idlnk_ = []

d3.csv("data/homicides_small.csv", function(data) {
    data.map(function(d) {
        // for each homicide
        stateIdx = statesNames.indexOf(d["State"]);
        if(stateIdx == -1) {
            // Handle case "District of Columbia" because it is also "Washingtown"
            if(d["State"] == "District of Columbia") stateIdx = 46;
            else {
                console.log("[ERROR] State not found: " + d["State"]);
                return;
            }
        }
        /*infos = [+d["Year"],
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
               d["Weapon"]];*/
        statesData[stateIdx].death++;
        if(d["Victim Sex"] == "Male") statesData[stateIdx].men++;
        if(d["Victim Race"] == "Black")
            statesData[stateIdx].ethnic[0]++;
        else if(d["Victim Race"] == "White")
            statesData[stateIdx].ethnic[1]++;
        else if(d["Victim Race"] == "Native American/Alaska Native")
            statesData[stateIdx].ethnic[2]++;
        else if(d["Victim Race"] == "Asian/Pacific Islander")
            statesData[stateIdx].ethnic[3]++;
        else
            console.log("[WARNING] Ethnie not found: " + d["Victim Race"]);
    });
    //update min and max
    minDeath = statesData[0].death;
    maxDeath = minDeath;
    for(var i = 1; i < statesNames.length; i++) {
        if(statesData[i].death < minDeath) minDeath = statesData[i].death;
        else if(statesData[i].death > maxDeath) maxDeath = statesData[i].death;
    }
    // load map
    d3.queue()
        .defer(d3.json, "https://d3js.org/us-10m.v1.json")
        .await(ready);
});

function c(x) {
    return Math.sqrt(x);
}

function getColor(id) {
    min = 50;
    max = 230;
    val = Math.round((c(statesData[id].death) - c(minDeath)) * (max - min) / (c(maxDeath) - c(minDeath))) + min;
    val =  256 - val; // invert
    val = (val < 16 ? "0" : "") + val.toString(16);
    return "#ee" + val + val;
}

function hideAllStatesBut(id) {
    for(var i = 0; i < statesData.length; i++) {
        if(i != idlnk[id])
            $("#state" + idlnk_[i]).attr("fill", "rgba(0, 0, 0, 0)");
        else
            $("#countryName" + i).css("display", "block");
    }
}

function hideName(id) {
    $("#countryName" + id).css("display", "none");
}

function showAllStates() {
    for(var i = 0; i < statesData.length; i++)
        $("#state" + idlnk_[i]).attr("fill", statesData[i].color);
}

function ready(error, us) {
    if (error) throw error;
    $(".loading").css("display", "none");
    svg.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        // for each state
        .enter().append("path")
        .attr("id", function(d) {idlnk_.push(parseInt(d.id));return "state" + parseInt(d.id);})
        .attr("d", path)
        .attr("stroke", function(d) {return "#eeeeee";})
        .attr("transform", "scale(" + width / 1000 + ")")
        // on mouse event
        .on("mouseover", function(d){
            id = idlnk[parseInt(d.id)];
            hideAllStatesBut(parseInt(d.id));
            document.getElementById("name").innerHTML = id + " (" + parseInt(d.id) + ")" + " - " + statesData[id].name + ", death:" + statesData[id].death;
        })
        .on("mouseleave", function(d){
            showAllStates();
            hideName(idlnk[parseInt(d.id)]);
        });
    // manage country index
    idlnk_.sort(function(a, b) {return a - b;});
    idlnk.length = idlnk_[idlnk_.length - 1];
    for(var i = 0; i < idlnk_.length; i++) {
        statesData[i].id = idlnk_[i];
        idlnk[idlnk_[i]] = i;
    }
    // set color
    for(var i = 0; i < idlnk_.length; i++)
        statesData[i].color = getColor(i);
    showAllStates();
    // set states name
    var paths = document.querySelectorAll("path");
    paths = [].slice.call(paths).sort(function(a,b){
        return a.id.substr(5, 2) - b.id.substr(5, 2);
    });
    //[].sort.call( paths, function(a,b) {return a - b;});
    //paths.sort(function(a, b) {return a - b;});
    for (var i = 0; i < idlnk_.length; i++)
        addText(paths[i], statesData[i].name, i);
}

function addText(p, name, i)
{
    var b = p.getBBox();
    var top = Math.round(b.y * width / 1000 + b.height / 2 + $("#map").offset().top) + 6;
    var left = Math.round(b.x * width / 1000 + b.width / 2 + $("#map").offset().left) + 16;
    $("body").append("<div class=\"contryName noselect\" id=\"countryName" + i + "\" style=\"top:" + top + "px;left:" + left + "px\">" + name + "</div>");
}
