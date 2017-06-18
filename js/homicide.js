/* =========================================== */
/* ================== DEFINE ================= */
/* =========================================== */

var DATA            = "data/homicides_small.csv";
var BLACK           = "000000";
var WALLPAPER_WHITE = "FEE1B9";
var WALLPAPER_NAUSA = "BF9765";
var WALLPAPER_ASIAN = "E9A357";
var WALLPAPER_BLACK = "633C1D";
var WALLPAPER_EMPTY = "111111";
var MAP_ALPHA       = "AA";
var MAP_STROKE      = "222222";
var MAP_MIN_COLOR   = "41BE41";
var MAP_MAX_COLOR   = "BE4141";

/* =========================================== */
/* ============ CONVERSION DATA ============== */
/* =========================================== */

var statesNames = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
    "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas",
    "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
    "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
    "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
    "Pennsylvania", "Rhodes Island", "South Carolina", "South Dakota", "Tennessee", "Texas",
    "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];

var months = ["January", "January", "February", "March", "April", "May",
    "June", "July", "August", "September", "October", "November", "December"]

/* =========================================== */
/* ================= CLASSES ================= */
/* =========================================== */

function DeathInState(name) {
    this.name = name;
    this.id = 0;
    this.death = 0;  // number of death (men + women)
    this.men = 0;    // number of death (men)
    // Black, White, Native American, Asian
    this.femaleEthnicity = [0, 0, 0, 0];
    this.maleEthnicity = [0, 0, 0, 0];
    this.color = "#" + BLACK;
}

function PopulationInState(name) {
  this.name = name;
  this.id = 0;
  this.population = 0; //Whole population
  this.men = 0; //Number of men in population
  //Black, White, Native, Asian
  this.femaleEthnicity = [0, 0, 0, 0];
  this.maleEthnicity = [0, 0, 0, 0];
}

/* =========================================== */
/* ============= GLOBAL VARIABLES ============ */
/* =========================================== */

// map position and size
var ratio = 1.67; // width on height country ratio
var width = $(window).width() * 0.8;
var height = width / ratio;
if($(window).width() / $(window).height() > ratio) {
    height = $(window).height() * 0.8;
    width = height * ratio;
}
$("#mapsvg").css("top", (($(window).height() - height) / 2) + "px");
$("#mapsvg").css("left", (($(window).width() - width) / 2) + "px");
var svg = d3.select('svg')
    .style("width", width + 'px')
    .style("height", height + 'px');
// init states data
var statesData = [];
for(var i = 0; i < statesNames.length; i++)
    statesData[i] = new DeathInState(statesNames[i]);
var minDeath = 0;
var maxDeath = 0;
var path = d3.geoPath();
// convert state id to statesNames array index
var idlnk = [];
// convert statesNames array index into state id
var idlnk_ = [];
// is the mouse overing a state
var mouseOveringState = 0;
// which state is currently highlighted
var currState = -1;
//Number of men and women to display. 4 men and 4 women.
var nbMW = 4;

/* =========================================== */
/* ================== FUNCTIONS ============== */
/* =========================================== */

function loadData()
{
    d3.csv(DATA, function(data) {
        data.map(function(d) {
            // for each homicide
            stateIdx = statesNames.indexOf(d["State"]);
            if(stateIdx == -1) {
                console.log("[ERROR] State not found: " + d["State"]);
                return;
            }
            if(d["Victim Race"] == "Black") {
                if(d["Victim Sex"] == "Male")
                  statesData[stateIdx].maleEthnicity[0] += +d["Number Death"];
                else
                  statesData[stateIdx].femaleEthnicity[0] += +d["Number Death"];
              }
            else if(d["Victim Race"] == "White") {
                if(d["Victim Sex"] == "Male")
                  statesData[stateIdx].maleEthnicity[0] += +d["Number Death"];
                else
                  statesData[stateIdx].femaleEthnicity[0] += +d["Number Death"];
                }
            else if(d["Victim Race"] == "Native American/Alaska Native") {
                if(d["Victim Sex"] == "Male")
                  statesData[stateIdx].maleEthnicity[0] += +d["Number Death"];
                else
                  statesData[stateIdx].femaleEthnicity[0] += +d["Number Death"];
                }
            else if(d["Victim Race"] == "Asian/Pacific Islander") {
                if(d["Victim Sex"] == "Male")
                  statesData[stateIdx].maleEthnicity[0] += +d["Number Death"];
                else
                  statesData[stateIdx].femaleEthnicity[0] += +d["Number Death"];
                }
            else {
                console.log("[WARNING] Ethnie not found: " + d["Victim Race"]);
                return;
            }
            statesData[stateIdx].death += +d["Number Death"];
            if(d["Victim Sex"] == "Male") statesData[stateIdx].men += +d["Number Death"];
        });
        //update min and max
        minDeath = statesData[0].death;
        maxDeath = minDeath;
        for(var i = 1; i < statesNames.length; i++) {
            if(statesData[i].death < minDeath && statesData[i].death != 0) minDeath = statesData[i].death;
            else if(statesData[i].death > maxDeath) maxDeath = statesData[i].death;
        }
        // load map
        d3.queue()
            .defer(d3.json, "https://d3js.org/us-10m.v1.json")
            .await(dataReady);
    });
}

function c(x)
{
    return Math.sqrt(x);
}

function getColor(id)
{
    var cst = (c(statesData[id].death) - c(minDeath)) / (c(maxDeath) - c(minDeath));
    var res = "#";
    for(var i = 0; i < 3; i++) {
        var minColor = parseInt("0x" + MAP_MIN_COLOR.substr(2 * i, 2).toString(10));
        var maxColor = parseInt("0x" + MAP_MAX_COLOR.substr(2 * i, 2).toString(10));
        var val = Math.round(cst * (maxColor - minColor) + minColor);
        res += (val < 16 ? "0" : "") + val.toString(16);
    }
    return res;
}

function showAllStates()
{
    for(var i = 0; i < statesData.length; i++)
        $("#state" + idlnk_[i]).attr("fill", statesData[i].color);
}

function displayName(id)
{
    $("#stateName" + id).css("display", "block");
}

function hideName(id)
{
    $("#stateName" + id).css("display", "none");
}

function dataReady(error, us)
{
    if (error) throw error;
    svg.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        // for each state
        .enter().append("path")
        .attr("id", function(d) {idlnk_.push(parseInt(d.id));return "state" + parseInt(d.id);})
        .attr("d", path)
        .attr("stroke", function(d) {return "#" + MAP_STROKE;})
        .attr("transform", "scale(" + width / 1000 + ")")
        // on mouse event
        .on("mouseover", function(d){
            console.log("[INFO] Map mouseover");
            mouseOveringState++;
            setTimeout(mouseOveringStateHandler, 20);
            id = idlnk[parseInt(d.id)];
            displayName(id);
            menWomenColor(true);
            currState = id;
        })
        .on("mouseleave", function(d){
            console.log("[INFO] Map mouseleave");
            setTimeout(mouseLeavingStateHandler, 10);
            hideName(idlnk[parseInt(d.id)]);
        })
        .on("click", function(d){
            sunburst(statesNames[idlnk[parseInt(d.id)]]);
            $("#sunburst").css("display", "block");
            $("#map").css("display", "none");
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
    setWallpaper();
    setStateNames();

}

function setStateNames()
{
    var paths = document.querySelectorAll("path");
    paths = [].slice.call(paths).sort(function(a,b){
        return a.id.substr(5, 2) - b.id.substr(5, 2);
    });
    for (var i = 0; i < idlnk_.length; i++)
        addText(paths[i], statesData[i].name, i);
}

function displayPage()
{
    $(".loading").css("display", "none");
    $("#mapsvg").css("opacity", "1.0");
    $("#legend").css("opacity", "1.0");
    $("body").find(".stateName").css("opacity", "1.0");
    $(".maintitle").css("display", "inline");
}

function mouseOveringStateHandler()
{
    mouseOveringState--;
}

function mouseLeavingStateHandler()
{
    if(mouseOveringState)
        return;
    menWomenColor(false);
    currState = -1;
}

function setWallpaper()
{
    var w = screen.width/20;
    var h = 2 * w;
    var margin = 5;
    var data1 = "";
    $(".wallpaper").load('img/man.svg', function(data, text, jq){
        data1 = data;
        $(".wallpaper").load('img/woman.svg', function(data2, text, jq){
            $(".wallpaper").html("");
            var parser = new DOMParser();
            var svgImg = parser.parseFromString(data1, "image/svg+xml").documentElement;
            var t1 = "<svg class=\"man\" id=\"mp";
            var t2 = "\" viewBox=\"0 0 249 497\" style=\"top: "+margin+"px;left:";
            var t3 = "px\" width=\""+w+"\" height=\""+h+"\">" + $(svgImg).html() + "</svg>";
            var i = 0;
            for(; i < nbMW; i++)
                $(".wallpaper").append(t1 + i + t2 + i*(w+6) + t3);
            svgImg = parser.parseFromString(data2, "image/svg+xml").documentElement;
            t1 = "<svg class=\"woman\" id=\"wp";
            t2 = "\" viewBox=\"0 0 249 497\" style=\"bottom: "+margin+"px; right:";
            t3 = "px\" width=\""+w+"\" height=\""+h+"\">" + $(svgImg).html() + "</svg>";
            i = 0;
            var border = 60;
            for(; i < nbMW; i++)
                $(".wallpaper").append(t1 + i + t2 + (border + i*(w+20)) + t3);
            displayPage();
        });
    });
}

function colorWallpaper(e)
{
    if(e == 0)
        return WALLPAPER_BLACK;
    else if(e == 1)
        return WALLPAPER_WHITE;
    else if(e == 2)
        return WALLPAPER_NAUSA;
    return WALLPAPER_ASIAN;
}

function menWomenColor(color)
{
    // set person color
    if (color) {
      for(var i = 0; i < nbMW; i++) {
          $("#mp" + i).find("path").attr("style", "fill:#" + colorWallpaper(i));
          $("#wp" + (nbMW-1-i)).find("path").attr("style", "fill:#" + colorWallpaper(i));
      }
    }
    else {
      for(var i = 0; i < nbMW; i++) {
          $("#mp" + i).find("path").attr("style", "fill:#" + WALLPAPER_EMPTY);
          $("#wp" + (nbMW-1-i)).find("path").attr("style", "fill:#" + WALLPAPER_EMPTY);
      }
    }
}

function addText(p, name, i)
{
    var b = p.getBBox();
    var top = Math.round(b.y * width / 1000 + b.height / 2 + $("#mapsvg").offset().top);
    var left = Math.round(b.x * width / 1000 + b.width / 2 + $("#mapsvg").offset().left);
    $("#map").append("<div class=\"stateName noselect\" id=\"stateName" + i + "\" style=\"top:" + top + "px;left:" + left + "px\">" + name + "</div>");
}

function setLegend()
{
    $("#leg_color_1").css("background", "#" + MAP_MIN_COLOR);
    $("#leg_color_2").css("background", "#" + MAP_MAX_COLOR);
    $("#leg_color_3").css("background", "#" + WALLPAPER_WHITE);
    $("#leg_color_4").css("background", "#" + WALLPAPER_BLACK);
    $("#leg_color_5").css("background", "#" + WALLPAPER_NAUSA);
    $("#leg_color_6").css("background", "#" + WALLPAPER_ASIAN);
}

/* =========================================== */
/* =============== CONCRETE CODE ============= */
/* =========================================== */

setLegend();
loadData();
