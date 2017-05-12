/* =========================================== */
/* ================== DEFINE ================= */
/* =========================================== */

var BLACK           = "000000";
var WALLPAPER_WHITE = "FEE1B9";
var WALLPAPER_NAUSA = "BF9765";
var WALLPAPER_ASIAN = "E9A357";
var WALLPAPER_BLACK = "633C1D";
var WALLPAPER_EMPTY = "111111";
var MAP_ALPHA       = "AA";
var MAP_STROKE      = "EEEEEE";

/* =========================================== */
/* ============ CONVERSION DATA ============== */
/* =========================================== */

var statesNames = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
    "Washington_", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas",
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

function State(name) {
    this.name = name;
    this.id = 0;
    this.death = 0;  // number of death (men + women)
    this.men = 0;    // number of death (men)
    // Black, White, Native American, Asian
    this.ethnicity = [0, 0, 0, 0];
    this.color = "#" + BLACK;
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
$("#map").css("top", (($(window).height() - height) / 2) + "px");
$("#map").css("left", (($(window).width() - width) / 2) + "px");
var svg = d3.select('svg')
    .style("width", width + 'px')
    .style("height", height + 'px');
// init states data
var statesData = [];
for(var i = 0; i < statesNames.length; i++)
    statesData[i] = new State(statesNames[i]);
var minDeath = 0;
var maxDeath = 0;
var path = d3.geoPath();
// convert state id to statesNames array index
var idlnk = [];
// convert statesNames array index into state id
var idlnk_ = [];
// total number of person into wallpaper
var nbWp = 0;
// number of men and women display into wallpaper
var tmpNbMen = 0;
var tmpNbWomen = 0;
// is the mouse overing a state
var mouseOveringState = 0;
// which state is currently highlighted
var currState = -1;

/* =========================================== */
/* ================== FUNCTIONS ============== */
/* =========================================== */

function loadData()
{
    d3.csv("data/homicides.csv", function(data) {
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
            if(d["Victim Race"] == "Black")
                statesData[stateIdx].ethnicity[0]++;
            else if(d["Victim Race"] == "White")
                statesData[stateIdx].ethnicity[1]++;
            else if(d["Victim Race"] == "Native American/Alaska Native")
                statesData[stateIdx].ethnicity[2]++;
            else if(d["Victim Race"] == "Asian/Pacific Islander")
                statesData[stateIdx].ethnicity[3]++;
            else {
                console.log("[WARNING] Ethnie not found: " + d["Victim Race"]);
                return;
            }
            statesData[stateIdx].death++;
            if(d["Victim Sex"] == "Male") statesData[stateIdx].men++;
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
            .await(dataReady);
    });
}

function c(x) {
    return Math.sqrt(x);
}

function getColor(id) {
    min = 65;
    max = 190;
    val = Math.round((c(statesData[id].death) - c(minDeath)) * (max - min) / (c(maxDeath) - c(minDeath))) + min;
    val_ =  256 - val; // invert
    // from max to min
    val_ = (val_ < 16 ? "0" : "") + val_.toString(16);
    // from min to max
    val = (val < 16 ? "0" : "") + val.toString(16);
    max = (max < 16 ? "0" : "") + max.toString(16);
    min = (min < 16 ? "0" : "") + min.toString(16);
    return "#" + val + val_ + min;
}

function hideAllStatesBut(id) {
    if(currState == -1) {
        for(var i = 0; i < statesData.length; i++) {
            var c = $("#state" + idlnk_[i]).attr("fill").substr(1, 6);
            if(i != id)
                $("#state" + idlnk_[i]).attr("fill", "#" + c + MAP_ALPHA);
        }
    }
    else {
        var c = $("#state" + idlnk_[id]).attr("fill").substr(1, 6);
        $("#state" + idlnk_[id]).attr("fill", "#" + c);
        c = $("#state" + idlnk_[currState]).attr("fill");
        $("#state" + idlnk_[currState]).attr("fill", c + MAP_ALPHA);
    }
}

function showAllStates() {
    for(var i = 0; i < statesData.length; i++)
        $("#state" + idlnk_[i]).attr("fill", statesData[i].color);
}

function displayName(id) {
    $("#countryName" + id).css("display", "block");
}

function hideName(id) {
    $("#countryName" + id).css("display", "none");
}

function dataReady(error, us) {
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
        .attr("stroke", function(d) {return "#" + MAP_STROKE;})
        .attr("transform", "scale(" + width / 1000 + ")")
        // on mouse event
        .on("mouseover", function(d){
            mouseOveringState++;
            setTimeout(mouseOveringStateHandler, 20);
            id = idlnk[parseInt(d.id)];
            hideAllStatesBut(id);
            displayName(id);
            menWomenColor(statesData[id].men, statesData[id].death - statesData[id].men, statesData[id].ethnicity);
            currState = id;
        })
        .on("mouseleave", function(d){
            setTimeout(mouseLeavingStateHandler, 10);
            hideName(idlnk[parseInt(d.id)]);
        })
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
    for (var i = 0; i < idlnk_.length; i++)
        addText(paths[i], statesData[i].name, i);

    setWallpaper();
}

function mouseOveringStateHandler()
{
    mouseOveringState--;
}

function mouseLeavingStateHandler()
{
    if(mouseOveringState)
        return;
    menWomenColor(0, 0, [0, 0, 0, 0]);
    showAllStates();
    currState = -1;
}

function setWallpaper()
{
    var w = 20;
    var h = 2 * w;
    var nbX = $(window).width() / w;
    var nbY = $(window).height() / (h + 4);
    nbWp = Math.floor(nbX) * Math.floor(nbY);
    var data1 = "";
    $(".wallpaper").load('img/man.svg', function(data, text, jq){
        data1 = data;
        $(".wallpaper").load('img/woman.svg', function(data2, text, jq){
            $(".wallpaper").html("");
            var parser = new DOMParser();
            var svgImg = parser.parseFromString(data1, "image/svg+xml").documentElement;
            var t1 = "<svg class=\"man\" id=\"wp";
            var t3 = "\" viewBox=\"0 0 249 497\" width=\""+w+"\" height=\""+h+"\">" + $(svgImg).html() + "</svg>";
            var i = 0;
            for(; i < nbWp / 2; i++)
                $(".wallpaper").append(t1 + i + t3);
            svgImg = parser.parseFromString(data2, "image/svg+xml").documentElement;
            t1 = "<svg class=\"woman\" id=\"wp";
            t3 = "\" viewBox=\"0 0 249 497\" width=\""+w+"\" height=\""+h+"\">" + $(svgImg).html() + "</svg>";
            for(; i < nbWp; i++)
                $(".wallpaper").append(t1 + i + t3);
        });
    });
}

function colorWallpaper(e){
    var rd = Math.random();
    if(rd < e[0])
        return WALLPAPER_WHITE;
    else if(rd < e[1])
        return WALLPAPER_NAUSA
    else if(rd < e[2])
        return WALLPAPER_ASIAN
    return WALLPAPER_BLACK
}

function menWomenColor(men, women, ethnicity)
{
    var death = men + women;
    men = Math.floor(men * nbWp / maxDeath);
    women = Math.floor(women * nbWp / maxDeath);
    // set ratio ethnicity (e)
    var e = [ethnicity[0] / death, 0, 0];
    for(var i = 1; i < 3; i++)
        e[i] = ethnicity[i] / death + e[i-1];
    // set person color
    for(var i = tmpNbMen; i < men; i++)
        $("#wp" + i).find("path").attr("style", "fill:#" + colorWallpaper(e));
    for(var i = men; i < tmpNbMen; i++)
        $("#wp" + i).find("path").attr("style", "fill:#" + WALLPAPER_EMPTY);
    for(var i = tmpNbWomen; i < women; i++)
        $("#wp" + (nbWp - i - 1)).find("path").attr("style", "fill:#" + colorWallpaper(e));
    for(var i = women; i < tmpNbWomen; i++)
        $("#wp" + (nbWp - i - 1)).find("path").attr("style", "fill:#" + WALLPAPER_EMPTY);
    tmpNbMen = men;
    tmpNbWomen = women;
}

function addText(p, name, i)
{
    var b = p.getBBox();
    var top = Math.round(b.y * width / 1000 + b.height / 2 + $("#map").offset().top) + 6;
    var left = Math.round(b.x * width / 1000 + b.width / 2 + $("#map").offset().left) + 16;
    $("body").append("<div class=\"contryName noselect\" id=\"countryName" + i + "\" style=\"top:" + top + "px;left:" + left + "px\">" + name + "</div>");
}

/* =========================================== */
/* =============== CONCRETE CODE ============= */
/* =========================================== */

loadData();
