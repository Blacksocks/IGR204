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
var MAP_STROKE      = "222222";
var MAP_MIN_COLOR   = "33CC33";
var MAP_MAX_COLOR   = "CC3333";
var MIN_DATE        = 1990;
var MAX_DATE        = 2014;
var DEATH_ONLY      = 0;
var POP_ONLY        = 1;
var DEATH_AND_POP   = 2;

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
    this.death = [MAX_DATE-MIN_DATE+1];  // number of death (men + women)
    this.men = [MAX_DATE-MIN_DATE+1];    // number of death (men)
    // Black, White, Native American, Asian
    this.femaleEthnicity = [MAX_DATE-MIN_DATE+1];
    this.maleEthnicity = [MAX_DATE-MIN_DATE+1];
    for (var i = 0 ; i < MAX_DATE-MIN_DATE+1 ; i++) {
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
  this.population = [MAX_DATE-MIN_DATE+1]; //Whole population
  this.men = [MAX_DATE-MIN_DATE+1]; //Number of men in population
  //Black, White, Native, Asian
  this.femaleEthnicity = [MAX_DATE-MIN_DATE+1];
  this.maleEthnicity = [MAX_DATE-MIN_DATE+1];
  for (var i = 0 ; i < MAX_DATE-MIN_DATE+1 ; i++) {
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
var width = $(window).width() * 0.72;
var height = width / ratio;
if($(window).width() / $(window).height() > ratio) {
    height = $(window).height() * 0.72;
    width = height * ratio;
}
$("#mapsvg").css("top", (($(window).height() - height - 40) / 2) + "px");
$("#mapsvg").css("left", (($(window).width() - width) / 10) + "px");
var svg = d3.select('svg')
    .style("width", width + 'px')
    .style("height", height + 'px');
//Init states population data
var statesPopulationData = [];
for(var i = 0; i < statesNames.length; i++)
    statesPopulationData[i] = new PopulationInState(statesNames[i]);
var populationNationWide = [MAX_DATE-MIN_DATE+1];
for (var i = 0 ; i < MAX_DATE-MIN_DATE+1 ; i++)
    populationNationWide[i] = 0;
// init states homicides data
var statesDeathData = [];
for(var i = 0; i < statesNames.length; i++)
    statesDeathData[i] = new DeathInState(statesNames[i]);
var deathNationWide = [MAX_DATE-MIN_DATE+1];
for (var i = 0 ; i < MAX_DATE-MIN_DATE+1 ; i++)
    deathNationWide[i] = 0;
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
var marginTop = 40;
var marginBottom = 20;
//Year chosen to display information
var yearToDisplay = 0;
var scrolling = 0;
//Display death only, death linked with population, or population only.
var whatToDisplay = DEATH_ONLY;
var minCurrDisp = 0;
var maxCurrDisp = 0;

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
                var year = +d["Year"];
                if (year == -1) {
                    console.log("[ERROR] Year not found: " + d["State"]);
                    return;
                }
                year -= MIN_DATE;
                if (d["Sex"] == 1) {//Male
                    if (d["Race"] == 1) //White
                        statesPopulationData[stateIdx].maleEthnicity[year][1] += parseInt(d["Population"], 10);
                    else if (d["Race"] == 2) //Black
                        statesPopulationData[stateIdx].maleEthnicity[year][0] += parseInt(d["Population"], 10);
                    else if (d["Race"] == 3) //Native
                        statesPopulationData[stateIdx].maleEthnicity[year][2] += parseInt(d["Population"], 10);
                    else if (d["Race"] == 4) //Asian
                        statesPopulationData[stateIdx].maleEthnicity[year][3] += parseInt(d["Population"], 10);
                    else {
                        console.log("[WARNING] Race not found!");
                        return;
                    }
                }
                else if (d["Sex"] == 2) { //Female
                    if (d["Race"] == 1) //White
                        statesPopulationData[stateIdx].femaleEthnicity[year][1] += parseInt(d["Population"], 10);
                    else if (d["Race"] == 2) //Black
                        statesPopulationData[stateIdx].femaleEthnicity[year][0] += parseInt(d["Population"], 10);
                    else if (d["Race"] == 3) //Native
                        statesPopulationData[stateIdx].femaleEthnicity[year][2] += parseInt(d["Population"], 10);
                    else if (d["Race"] == 4) //Asian
                        statesPopulationData[stateIdx].femaleEthnicity[year][3] += parseInt(d["Population"], 10);
                    else {
                        console.log("[WARNING] Race not found!");
                        return;
                    }
                }
                else {
                    console.log("[WARNING] Sex not found!");
                    return;
                }
                statesPopulationData[stateIdx].population[year] += parseInt(d["Population"], 10);
                if (d["Sex"] == 1) statesPopulationData[stateIdx].men[year] += parseInt(d["Population"], 10);
                populationNationWide[year] += parseInt(d["Population"], 10);

            });
            hdata.map(function(d) {
                // for each homicide
                var stateIdx = statesNames.indexOf(d["State"]);
                if(stateIdx == -1) {
                    console.log("[ERROR] State not found: " + d["State"]);
                    return;
                }
                var year = +d["Date"];
                if (year == -1) {
                    console.log("[ERROR] Year not found: " + d["State"]);
                    return;
                }
                year -= MIN_DATE;
                var raceIdx = 0;
                if(d["Race"] == "White") raceIdx = 1;
                else if(d["Race"] == "Native American/Alaska Native") raceIdx = 2;
                else if(d["Race"] == "Asian/Pacific Islander") raceIdx = 3;
                else if(d["Race"] != "Black"){
                    console.log("[WARNING] Ethnie not found: " + d["Victim Race"]);
                    return;
                }
                statesDeathData[stateIdx].maleEthnicity[year][raceIdx] += +d["Men"];
                statesDeathData[stateIdx].femaleEthnicity[year][raceIdx] += +d["Women"];
                statesDeathData[stateIdx].death[year] += +d["Men"] + +d["Women"];
                statesDeathData[stateIdx].men[year] += +d["Men"];
                deathNationWide[year] += +d["Men"] + +d["Women"];
            });
            //update min and max
            getMinMaxCurrStat();
            // load map
            d3.queue()
                .defer(d3.json, "https://d3js.org/us-10m.v1.json")
                .await(dataReady);
        });
    });
}

function sq(x)
{
    return Math.sqrt(x);
}

function cb(x)
{
    return Math.cbrt(x);
}

function getColor(id)
{
    var x = -1;
    if (whatToDisplay == DEATH_ONLY) {
      x = statesDeathData[id].death[yearToDisplay];
      var cstCurrYear = (sq(x) - sq(minCurrDisp)) / (sq(maxCurrDisp) - sq(minCurrDisp));
    }
    else if (whatToDisplay == POP_ONLY) {
      x = statesPopulationData[id].population[yearToDisplay];
      if (x > 4000000)
        var cstCurrYear = (cb(x) - cb(minCurrDisp)) / (cb(maxCurrDisp) - cb(minCurrDisp));
      else {
        var cstCurrYear = (sq(x) - sq(minCurrDisp)) / (sq(maxCurrDisp) - sq(minCurrDisp));
      }
      if (cstCurrYear > 1) cstCurrYear = 1;
    }
    else if (whatToDisplay == DEATH_AND_POP) {
      if (id == 8) //District of Colombia
        return "#BE4141";
      var x = statesDeathData[id].death[yearToDisplay] / statesPopulationData[id].population[yearToDisplay];
      var cstCurrYear = (Math.pow(x,0.8) - sq(minCurrDisp)) / (Math.pow(maxCurrDisp,0.8) - sq(minCurrDisp));
    }
    var res = "#";
    for(var i = 0; i < 3; i++) {
        var minColor = parseInt("0x" + MAP_MIN_COLOR.substr(2 * i, 2).toString(10));
        var maxColor = parseInt("0x" + MAP_MAX_COLOR.substr(2 * i, 2).toString(10));
        var val = Math.round(cstCurrYear * (maxColor - minColor) + minColor);
        res += (val < 16 ? "0" : "") + val.toString(16);
    }
    return res;
}

function getMinMaxCurrStat()
{
    if (whatToDisplay == DEATH_ONLY) {
      minCurrDisp = statesDeathData[0].death[yearToDisplay];
      maxCurrDisp = minCurrDisp;
      for (var y = 0 ; y < MAX_DATE - MIN_DATE ; y++) {
        for(var i = 0; i < statesNames.length; i++) {
            if(statesDeathData[i].death[y] < minCurrDisp && statesDeathData[i].death[y] != 0) minCurrDisp = statesDeathData[i].death[y];
            else if(statesDeathData[i].death[y] > maxCurrDisp) maxCurrDisp = statesDeathData[i].death[y];
        }
      }
    }
    else if (whatToDisplay == POP_ONLY) {
      minCurrDisp = statesPopulationData[0].population[0];
      maxCurrDisp = minCurrDisp;
      for (var y = 0 ; y < MAX_DATE - MIN_DATE ; y++) {
        for(var i = 0; i < statesNames.length; i++) {
            if(statesPopulationData[i].population[y] < minCurrDisp && statesPopulationData[i].population[y] != 0) minCurrDisp = statesPopulationData[i].population[y];
            else if(statesPopulationData[i].population[y] > maxCurrDisp) maxCurrDisp = statesPopulationData[i].population[y];
        }
      }
    }
    else if (whatToDisplay == DEATH_AND_POP) {
      minCurrDisp = statesDeathData[0].death[yearToDisplay]/statesPopulationData[0].population[yearToDisplay];
      maxCurrDisp = minCurrDisp;
      for (var year = 0 ; year < MAX_DATE - MIN_DATE ; year++) {
        for(var i = 0; i < statesNames.length; i++) {
          if (i == 8) i = 9; //Skipping District of Columbia
            var x = statesDeathData[i].death[year];
            var y = statesPopulationData[i].population[year];
            if (y != 0) {
              if(x/y < minCurrDisp) minCurrDisp = x/y;
              else if(x/y > maxCurrDisp) maxCurrDisp = x/y;
            }
        }
      }
    }
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
    $(".personBox").each(function(){$(this).css("color", "#111");});
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
        .attr("class", "state")
        .attr("d", path)
        .attr("stroke", function(d) {return "#" + MAP_STROKE;})
        .attr("transform", "scale(" + width / 1000 + ")")
        // on mouse event
        .on("mouseover", function(d){
            mouseOveringState++;
            setTimeout(mouseOveringStateHandler, 20);
            id = idlnk[parseInt(d.id)];
            displayName(id);
            menWomenColor(true);
            displayDescription();
            displayDataMW(id);
            currState = id;
        })
        .on("mouseleave", function(d){
            setTimeout(mouseLeavingStateHandler, 10);
            hideName(idlnk[parseInt(d.id)]);
        })
        .on("click", function(d){
            window.open("sunburst.html?state=" + statesNames[idlnk[parseInt(d.id)]], "_blank");
        });
    // manage country index
    idlnk_.sort(function(a, b) {return a - b;});
    idlnk.length = idlnk_[idlnk_.length - 1];
    for(var i = 0; i < idlnk_.length; i++) {
        statesDeathData[i].id = idlnk_[i];
        idlnk[idlnk_[i]] = i;
    }
    updateColors();
    setWallpaper();
    setStateNames();
}

function setStateNames()
{
    var paths = document.querySelectorAll("path");
    paths = [].slice.call(paths).sort(function(a,b){
        return a.id.substr(5, 2) - b.id.substr(5, 2);
    });
    for (var i = 0; i < idlnk_.length; i++) {
        addText(paths[i], statesDeathData[i].name, i);
      }
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
    var w = screen.width/22;
    var h = 2 * w;
    var data1 = "";
    $(".wallpaper").load('img/man.svg', function(data, text, jq){
        data1 = data;
        $(".wallpaper").load('img/woman.svg', function(data2, text, jq){
            $(".wallpaper").html("");
            var parser = new DOMParser();
            var svgImg = parser.parseFromString(data1, "image/svg+xml").documentElement;
            var t1 = "<div class=\"personBox\" style=\"top:" + marginTop + "px;right:";
            var t2 = "px\" id=\"mp";
            var t3 = "\"><svg class=\"man\" viewBox=\"0 0 249 497\" style=\"margin:4px 10px 0 10px\" width=\""+w+"\" height=\""+h+"\">" + $(svgImg).html() + "</svg></div>";
            var right = [nbMW];
            var border = 60;
            for(var i = 0; i < nbMW; i++)
                $(".wallpaper").append(t1 + (border + i*(w+40)) + t2 + (nbMW - 1 - i) + t3);
            svgImg = parser.parseFromString(data2, "image/svg+xml").documentElement;
            var margin = $(".wallpaper").height() - marginBottom - h - 70;
            t1 = "<div class=\"personBox\" style=\"top:" + margin + "px;right:";
            t2 = "px\" id=\"wp";
            t3 = "\"><svg class=\"woman\"\" viewBox=\"0 0 249 497\" style=\"margin:4px 10px 0 10px\" width=\""+w+"\" height=\""+h+"\">" + $(svgImg).html() + "</svg></div>";
            for(var i = 0; i < nbMW; i++)
                $(".wallpaper").append(t1 + (border + i*(w+40)) + t2 + (nbMW - 1 - i) + t3);
            addDescriptionMW();
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
    // set person color and display information such as death, and population.
    if (color) {
      for(var i = 0; i < nbMW; i++) {
          $("#mp" + i).find("path").attr("style", "fill:#" + colorWallpaper(i));
          $("#wp" + i).find("path").attr("style", "fill:#" + colorWallpaper(i));
      }
    }
    else {
      for(var i = 0; i < nbMW; i++) {
          $("#mp" + (nbMW-1-i)).find("path").attr("style", "fill:#" + WALLPAPER_EMPTY);
          $("#wp" + (nbMW-1-i)).find("path").attr("style", "fill:#" + WALLPAPER_EMPTY);
          $("#dataM" + i).text("");
          $("#dataW" + (nbMW-1-i)).text("");
      }
    }
}

function displayDataMW(id)
{
    for (var i = 0 ; i < nbMW ; i++) {
        msg = "<span class=\"colorDeath\">" + statesDeathData[id].maleEthnicity[yearToDisplay][i] +
        "</span> /<br /><span class=\"colorPop\">" + statesPopulationData[id].maleEthnicity[yearToDisplay][i] + "</span>" +
        " <br /> <span class=\"colorPercentage \">" + (10000*statesDeathData[id].maleEthnicity[yearToDisplay][i]/statesPopulationData[id].maleEthnicity[yearToDisplay][i]).toPrecision(2) + "&#8241;</span>";
        $("#dataM" + i).html(msg);
        msg = "<span class=\"colorDeath\">" + statesDeathData[id].femaleEthnicity[yearToDisplay][i] +
        "</span> /<br /><span class=\"colorPop\">" + statesPopulationData[id].femaleEthnicity[yearToDisplay][i] + "</span>" +
        " <br /> <span class=\"colorPercentage \">" + (10000*statesDeathData[id].femaleEthnicity[yearToDisplay][i]/statesPopulationData[id].femaleEthnicity[yearToDisplay][i]).toPrecision(2) + "&#8241;</span>";
        $("#dataW" + i).html(msg);
        $(".personBox").each(function(){$(this).css("color", "#EEE");});
    }
}

function addText(p, name, i)
{
    var b = p.getBBox();
    var top = Math.round(b.y * width / 1000 + b.height / 2 + $("#mapsvg").offset().top);
    var left = Math.round(b.x * width / 1000 + b.width / 2 + $("#mapsvg").offset().left);
    $("#map").append("<div class=\"stateName noselect\" id=\"stateName" + i + "\" style=\"top:" + top + "px;left:" + left + "px\">" + name +
                  "<br />" + "<span class=\"colorDeath \" >" + statesDeathData[i].death[yearToDisplay] + "</span> /" +
                  "<br />" + "<span class=\"colorPop \" >" + statesPopulationData[i].population[yearToDisplay] + "</span></div>");
}

function addDescriptionMW() {
    var name = ["Black", "White", "Native", "Asian"];
    for (var i = 0; i < nbMW; i++) {
        $("#mp" + i).prepend("<b>" + name[i] + "</b><br />");
        $("#wp" + i).prepend("<b>" + name[i] + "</b><br />");
        $("#mp" + i).append("<div id=\"dataM" + i + "\"></div>");
        $("#wp" + i).append("<div id=\"dataW" + i + "\"></div>");
    }
}

function setLegend()
{
    $("#leg_color_1").css("background", "#" + MAP_MIN_COLOR);
    $("#leg_color_2").css("background", "#" + MAP_MAX_COLOR);
    $("#leg_color_3").css("background", "#3399CC");
    $("#leg_color_4").css("background", "#BE4141");
}

function updateColors()
{
    getMinMaxCurrStat();
    // reset color
    for(var i = 0; i < idlnk_.length; i++)
        statesDeathData[i].color = getColor(i);
    showAllStates();
}

function updateTimeline()
{
    var maxPx = $("#timeline").width();
    var pointer = maxPx * yearToDisplay / (MAX_DATE - MIN_DATE);
    var time = 400;
    $(".timeline-content").stop().animate({
        "background-position-x": pointer + "px"
    }, time);
    var textPos = (pointer + 8) + "px";
    if(pointer > maxPx - 54)
        textPos = (maxPx - 46) + "px";
    $("#date-timeline").stop().animate({
        "left": textPos
    }, time);
    $("#date-timeline").text(yearToDisplay + MIN_DATE);
    updateColors();
    if (currState != -1)
      displayDataMW(currState);
}

function onTimeline(e)
{
    var maxPx = $("#timeline").width();
    var date = Math.round(e.pageX*(MAX_DATE - MIN_DATE) / maxPx + MIN_DATE);
    yearToDisplay = date - MIN_DATE;
    updateTimeline();
}

function displayOnMap(data)
{
    $("#radio1" + data + " .check").css('display', 'block');
    $("#radio1" + ((data + 1) % 3) + " .check").css('display', 'none');
    $("#radio1" + ((data + 2) % 3) + " .check").css('display', 'none');
    if(data == POP_ONLY)
        displayPop();
    else if(data == DEATH_AND_POP)
        displayDeathAndPop();
    else
        displayDeath();
    updateTimeBack();
}

function displayDeath()
{
    whatToDisplay = DEATH_ONLY;
    $("#titleBanner").html("Compared to other states, the number of homicides in a precise year is displayed for each state");
    updateColors();
}

function displayPop()
{
    whatToDisplay = POP_ONLY;
    $("#titleBanner").html("Compared to other states, the population in a precise year is displayed for each state");
    updateColors();
}

function displayDeathAndPop()
{
    whatToDisplay = DEATH_AND_POP;
    $("#titleBanner").html("Compared to other states, the number of homicides over the population in a precise year is displayed for each state");
    updateColors();
}

function mmNationWide()
{
    var min = nationWideValue(0);
    var max = min;
    for(var i = 1; i <= MAX_DATE - MIN_DATE; i++) {
        var tmp = nationWideValue(i);
        if(tmp < min)
            min = tmp;
        else if(tmp > max)
            max = tmp;
    }
    return [min, max];
}

function nationWideValue(i)
{
    if(whatToDisplay == POP_ONLY)
        return populationNationWide[i];
    if(whatToDisplay == DEATH_AND_POP)
        return deathNationWide[i] / populationNationWide[i];
    return deathNationWide[i];
}

function updateTimeBack()
{
    var maxPx = $("#timeline").width();
    var maxH = $("#timeline").height();
    var step = maxPx / (MAX_DATE - MIN_DATE);
    var mm = mmNationWide();
    var c=document.getElementById("timeBack");
    var ctx=c.getContext("2d");
    ctx.clearRect(0, 0, maxPx, maxH);
    ctx.fillStyle = "#222";
    var xPos = 0;
    ctx.beginPath();
    ctx.moveTo(xPos, maxH);
    for(var i = 0; i <= MAX_DATE - MIN_DATE; i++)
    {
        ctx.lineTo(xPos, maxH - (nationWideValue(i)) * (maxH * 0.9) / (mm[1]));
        xPos += step;
    }
    xPos -= 1;
    ctx.lineTo(xPos, maxH);
    ctx.fill();
}

function initTimeBack()
{
    var maxPx = $("#timeline").width();
    var maxH = $("#timeline").height();
    $("#timeBack").attr("width", maxPx + "px");
    $("#timeBack").attr("height", "60px");
    updateTimeBack();
}

// Mouse wheel scrolling event
$(window).bind('mousewheel DOMMouseScroll', function(event){
    var scrollingLimit = 2;
    if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0)
        scrolling--;
    else
        scrolling++;
    if(scrolling > scrollingLimit) {
        scrolling = 0;
        yearToDisplay++;
        if(yearToDisplay > MAX_DATE - MIN_DATE)
            yearToDisplay = MAX_DATE - MIN_DATE;
        else
            updateTimeline();
    }
    else if (scrolling < -scrollingLimit) {
        scrolling = 0;
        yearToDisplay--;
        if(yearToDisplay < 0)
            yearToDisplay = 0;
        else
            updateTimeline();
    }
});

/* =========================================== */
/* =============== CONCRETE CODE ============= */
/* =========================================== */

setLegend();
loadData();
$(document).ready(function(){
	$("#timeline").click(function(e) {onTimeline(e);});
    initTimeBack();
    $("#radio10 .check").css('display', 'block');
});
