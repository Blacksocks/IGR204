/* =========================================== */
/* ================== DEFINE ================= */
/* =========================================== */

var HOMICIDES_DATA  = "data/homicides_small.csv";
var POP_DATA        = "data/data_us_pop.csv";
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
    this.death = [26];  // number of death (men + women)
    this.men = [26];    // number of death (men)
    // Black, White, Native American, Asian
    this.femaleEthnicity = [26];
    this.maleEthnicity = [26];
    for (var i = 0 ; i < 26 ; i++) {
      this.death[i] = 0;
      this.men[i] = 0;
      this.femaleEthnicity[i] = [0, 0, 0, 0];
      this.maleEthnicity[i] = [0, 0, 0, 0];
    }
    this.color = "#" + BLACK;
}

function PopulationInState(name) {
  this.name = name;
  this.id = 0;
  this.population = [26]; //Whole population
  this.men = [26]; //Number of men in population
  //Black, White, Native, Asian
  this.femaleEthnicity = [26];
  this.maleEthnicity = [26];
  for (var i = 0 ; i < 26 ; i++) {
    this.population[i] = 0;
    this.men[i] = 0;
    this.femaleEthnicity[i] = [0, 0, 0, 0];
    this.maleEthnicity[i] = [0, 0, 0, 0];
  }

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
//Init states population data
var statesPopulationData = [];
for(var i = 0; i < statesNames.length; i++)
    statesPopulationData[i] = new PopulationInState(statesNames[i]);
// init states homicides data
var statesDeathData = [];
for(var i = 0; i < statesNames.length; i++)
    statesDeathData[i] = new DeathInState(statesNames[i]);
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
//Top and bottom margins for men and women display
var marginTop = 20;
var marginBottom = 5;
//Year chosen to display information
var yearToDisplay = 0;
//For data loading.
var yearDone = 0;
var previousYear = 1990;

/* =========================================== */
/* ================== FUNCTIONS ============== */
/* =========================================== */

function loadData()
{
    d3.csv(POP_DATA, function (pdata) {
      d3.csv(HOMICIDES_DATA, function(hdata) {
          pdata.map(function (d) {
            // For each entry in the population_Data.
            var stateIdx = d["State Nb"] - 1;
            if(stateIdx == -1) {
                console.log("[ERROR] State not found: " + d["State"]);
                return;
            }
            var year = d["Year"];
            if (year == -1) {
              console.log("[ERROR] Year not found: " + d["State"]);
              return;
            }
            if (year != previousYear)
              yearDone++;
            if (d["Sex"] == 1) {//Male
              if (d["Race"] == 1) //White
                statesPopulationData[stateIdx].maleEthnicity[yearDone][1] += parseInt(d["Population"], 10);
              else if (d["Race"] == 2) //Black
                statesPopulationData[stateIdx].maleEthnicity[yearDone][0] += parseInt(d["Population"], 10);
              else if (d["Race"] == 3) //Native
                statesPopulationData[stateIdx].maleEthnicity[yearDone][2] += parseInt(d["Population"], 10);
              else if (d["Race"] == 4) //Asian
                statesPopulationData[stateIdx].maleEthnicity[yearDone][3] += parseInt(d["Population"], 10);
              else {
                console.log("[WARNING] Race not found!");
                return;
              }
            }
            else if (d["Sex"] == 2) { //Female
              if (d["Race"] == 1) //White
                statesPopulationData[stateIdx].femaleEthnicity[yearDone][1] += parseInt(d["Population"], 10);
              else if (d["Race"] == 2) //Black
                statesPopulationData[stateIdx].femaleEthnicity[yearDone][0] += parseInt(d["Population"], 10);
              else if (d["Race"] == 3) //Native
                statesPopulationData[stateIdx].femaleEthnicity[yearDone][2] += parseInt(d["Population"], 10);
              else if (d["Race"] == 4) //Asian
                statesPopulationData[stateIdx].femaleEthnicity[yearDone][3] += parseInt(d["Population"], 10);
              else {
                console.log("[WARNING] Race not found!");
                return;
              }
            }
            else {
              console.log("[WARNING] Sex not found!");
              return;
            }
            statesPopulationData[stateIdx].population[yearDone] += parseInt(d["Population"], 10);
            if (d["Sex"] == 1) statesPopulationData[stateIdx].men[yearDone] += parseInt(d["Population"], 10);
            previousYear = year;
          });
          yearDone = 0, previousYear = 1990;
          hdata.map(function(d) {
              // for each homicide
              var stateIdx = statesNames.indexOf(d["State"]);
              if(stateIdx == -1) {
                  console.log("[ERROR] State not found: " + d["State"]);
                  return;
              }
              //TODO : Update reduce/compute on homicides_small.csv to keep data where data >= 1990. Then remove condition.
              if (d["Date"] >= 1990) {
                var year = d["Date"];
                if (year == -1) {
                  console.log("[ERROR] Year not found: " + d["State"]);
                  return;
                }
                if (year != previousYear)
                  yearDone++;
                var raceIdx = 0;
                if(d["Race"] == "White") raceIdx = 1;
                else if(d["Race"] == "Native American/Alaska Native") raceIdx = 2;
                else if(d["Race"] == "Asian/Pacific Islander") raceIdx = 3;
                else if(d["Race"] != "Black"){
                    console.log("[WARNING] Ethnie not found: " + d["Victim Race"]);
                    return;
                }
                statesDeathData[stateIdx].maleEthnicity[yearDone][raceIdx] += +d["Men"];
                statesDeathData[stateIdx].femaleEthnicity[yearDone][raceIdx] += +d["Women"];
                statesDeathData[stateIdx].death[yearDone] += +d["Men"] + +d["Women"];
                statesDeathData[stateIdx].men[yearDone] += +d["Men"];
                previousYear = year;
              }
          });
          //update min and max
          minDeath = statesDeathData[0].death[yearToDisplay];
          maxDeath = minDeath;
          for(var i = 1; i < statesNames.length; i++) {
              if(statesDeathData[i].death[yearToDisplay] < minDeath && statesDeathData[i].death[yearToDisplay] != 0) minDeath = statesDeathData[i].death[yearToDisplay];
              else if(statesDeathData[i].death[yearToDisplay] > maxDeath) maxDeath = statesDeathData[i].death[yearToDisplay];
          }
          console.log("Min: " + minDeath + " vs max: " + maxDeath);
          // load map
          d3.queue()
              .defer(d3.json, "https://d3js.org/us-10m.v1.json")
              .await(dataReady);
      });
    });
}

function c(x)
{
    return Math.sqrt(x);
}

function getColor(id)
{
    var cst = (c(statesDeathData[id].death[yearToDisplay]) - c(minDeath)) / (c(maxDeath) - c(minDeath));
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
    for(var i = 0; i < statesDeathData.length; i++)
        $("#state" + idlnk_[i]).attr("fill", statesDeathData[i].color);
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
            displayDescription();
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
        statesDeathData[i].id = idlnk_[i];
        idlnk[idlnk_[i]] = i;
    }
    // set color
    for(var i = 0; i < idlnk_.length; i++)
        statesDeathData[i].color = getColor(i);
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
        addText(paths[i], statesDeathData[i].name, i);
}

function displayDescription() {
  $(".descriptionMW").css("display", "block");
}

function hideDescription() {
  $(".descriptionMW").css("display", "none");
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
    hideDescription();
    currState = -1;
}

function setWallpaper()
{
    var w = screen.width/20;
    var h = 2 * w;
    var data1 = "";
    $(".wallpaper").load('img/man.svg', function(data, text, jq){
        data1 = data;
        $(".wallpaper").load('img/woman.svg', function(data2, text, jq){
            $(".wallpaper").html("");
            var parser = new DOMParser();
            var svgImg = parser.parseFromString(data1, "image/svg+xml").documentElement;
            var t1 = "<svg class=\"man\" id=\"mp";
            var t2 = "\" viewBox=\"0 0 249 497\" style=\"top: "+marginTop+"px;left:";
            var t3 = "px\" width=\""+w+"\" height=\""+h+"\">" + $(svgImg).html() + "</svg>";
            var i = 0;
            var left = [nbMW];
            for(; i < nbMW; i++) {
                left[i] = i*(w+6);
                $(".wallpaper").append(t1 + i + t2 + left[i] + t3);
              }
            svgImg = parser.parseFromString(data2, "image/svg+xml").documentElement;
            t1 = "<svg class=\"woman\" id=\"wp";
            t2 = "\" viewBox=\"0 0 249 497\" style=\"bottom: "+marginBottom+"px; right:";
            t3 = "px\" width=\""+w+"\" height=\""+h+"\">" + $(svgImg).html() + "</svg>";
            i = 0;
            var border = 60;
            var right = [nbMW];
            for(; i < nbMW; i++) {
                right[i] = border + i*(w+20);
                $(".wallpaper").append(t1 + i + t2 + right[i] + t3);
            }
            addDescriptionMW(left, right);
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

function addDescriptionMW(left, right) {
  var name = ["Black", "White", "Native", "Asian"];
  for (var i = 0 ; i < nbMW ; i++) {
  $(".wallpaper").append("<div class=\"descriptionMW noselect\" id=\"description" + 2*i + "\" style=\"top:" + (marginTop-20) + "px;left:" + (left[i]+13) + "px\">" + name[i] + "</div>");
  $(".wallpaper").append("<div class=\"descriptionMW noselect\" id=\"description" + (2*i+1) + "\" style=\"bottom:" + (marginBottom+ $("#wp1").height()) + "px;right:" + (right[nbMW - 1 - i]+11)+ "px\">" + name[i] + "</div>");
  }
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
