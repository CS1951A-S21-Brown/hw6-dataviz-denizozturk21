// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 175};

let WC_YEAR_LATEST = 2018;
let WC_YEAR_SEC = 2014;
// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = 500, graph_1_height = 500;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 275;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;

let g1 = d3.select("#graph1").append("svg");
g1.attr("width", graph_1_width).attr("heigth", graph_1_height)
.attr("transform", `translate(${margin.left},${margin.top})`).append("g");


let g2 = d3.select("#graph2").append("svg");
g2.attr("width", graph_2_width).attr("heigth", graph_2_height)
.attr("transform", `translate(${margin.left},${margin.top})`).append("g");

let g3 = d3.select("#graph3").append("svg");
g3.attr("width", graph_3_width).attr("heigth", graph_3_height)
.attr("transform", `translate(${margin.left},${margin.top})`).append("g");

//add title here
g1.append("text").text("Annual Seasons").attr("transform",
`translate(${(500) / 2},
${(500 ) + 15})`);

g1.append("text").text("Number of Games").attr("transform",
`translate(${(graph_1_width-margin.left-margin.right) / 2},
${(graph_1_height-margin.bottom-margin.top ) /2})`);
//var coloring = d3.scaleLinear().domain([1,10])
 // .range(["white", "blue"]);
 let coloring = d3.scaleOrdinal()
    .range(d3.quantize(d3.interpolateHcl("#D03B12", "#12D021"), 10));

g2.append("text").attr("transform",
`translate(${(graph_2_width-margin.left-margin.right) / 2},
${-15})`).text("Nations with the highest winning ratios");

g2.append("text").text("Winning Percentage").attr("transform",
`translate(100,100)`);

g3.append("text").text("Opponent Average Winning Percentage").attr("transform",
`translate(${(graph_3_width-margin.left-margin.right) / 2},
${(graph_3_height-margin.bottom-margin.top ) /2})`);

g3.append("text").text("Winning Percentage").attr("transform",
`translate(${(graph_3_width-margin.left-margin.right) / 2},
${-15})`);

var sliderPlaceholder1 = 2010;
var sliderPlaceholder2 = 2020;

let yearSlider = new Slider('#yearSlider',{reversed : true});
yearSlider.on('slide', function(t){
    //let temp = $('#yearSlider').val();
    if(t[0] != null) {
        sliderPlaceholder1 = parseInt(t[0]);
        sliderPlaceholder2 = parseInt(t[1]);
        //console.log(sliderPlaceholder1);
    }
    var datum = [];
    d3.csv("/data/football.csv").then(function(games) {
        gSize = games.length;
        //console.log(gSize);
        for(var index=0;index<gSize;index++){
            var fullDate = games[index].date;
            var year = "";
            //fdLength = fullDate.length();
            for(var letterIndex=0;letterIndex<4;letterIndex++){
                year += fullDate.charAt(letterIndex);
            }
            var yearInt = parseInt(year);
            if(sliderPlaceholder1 <= yearInt) {
                if(sliderPlaceholder2 >= yearInt) {
                    datum.push(yearInt);
                }
            }
        }
        dict = new Map();
        var yearSet = [];
        var count  = 0;
        var latest = Number.NEGATIVE_INFINITY;
        while (count<datum.length){
            if(yearSet[datum[count]]){
                yearSet[datum[count]] += 1;
            }else{
                yearSet[datum[count]] = 1;
            }
            dict.set(datum[count], yearSet[datum[count]]);
            if (latest<yearSet[datum[count]]){
                latest = yearSet[datum[count]];
            }
            count++;
        }
        x_range = [0, 250];
        y_range = [0, 250];
        var x_axis = d3.scaleLinear().range(x_range);
        var y_axis = d3.scaleBand().range(y_range);
        let setData = Array.from(dict).map(([season,games]) => ({season,games}));
        setData.sort((game1, game2) => game2.season - game1.season).slice(0,10);
        coloring.domain(setData.map(function(game) {return parseInt(game.season)}));
        y_axis.domain(setData.map(function(game) {return parseInt(game.season)}));
        x_axis.domain([0, latest]);
        console.log(setData);
        g1.selectAll("text").data(setData).enter().append("text").text(function(game){return parseInt(game.games)})
        .attr("y", function(game){return y_axis(parseInt(game.season))})
        .attr("x", x_axis(0))
        g1.selectAll("rect").data(setData).enter().append("rect")
        .attr("y", function(game){return y_axis(parseInt(game.season))})
        .attr("x", function(game){return x_axis(parseInt(game.games))})
        .attr("height",y_axis.bandwidth())
        .attr("width",function(game){return x_axis(parseInt(game.games))})
        .attr("fill",function(game){return coloring(game.games)});
        //g1.selectAll("text").data(setData).exit().remove();
        //g1.selectAll("rect").data(setData).exit().remove();  
})});

d3.csv("/data/football.csv").then(function(games) {
    let teamMap = new Map();
    games = games.filter(game=>game.tournament==="FIFA World Cup");
    games = games.filter((game=> parseInt(game.date.substring(0,4))==2018) || parseInt(game.date.substring(0,4))==2014);
    gSize = games.length;
        //console.log(gSize);
    for(var index=0;index<gSize;index++){
        if(!teamMap.has(games[index].away_team)){
            teamMap.set(games[index].away_team, new Map());
            teamMap.get(games[index].away_team).set("Games played",0);
            teamMap.get(games[index].away_team).set("Wins",0);
            teamMap.get(games[index].away_team).set("Ties",0);
            teamMap.get(games[index].away_team).set("Teams played against",[]);
         } 
        if(!teamMap.has(games[index].home_team)){
            teamMap.set(games[index].home_team, new Map());
            teamMap.get(games[index].home_team).set("Games played",0);
            teamMap.get(games[index].home_team).set("Wins",0);
            teamMap.get(games[index].home_team).set("Ties",0);
            teamMap.get(games[index].home_team).set("Teams played against",[]);
        }
        //console.log(teamMap); 
        teamMap.get(games[index].away_team).set("Games played",teamMap.get(games[index].away_team).get("Games played")+1);
        teamMap.get(games[index].home_team).set("Games played",teamMap.get(games[index].home_team).get("Games played")+1);
        var a1 = teamMap.get(games[index].home_team).get("Teams played against");
        //console.log(teamMap.get(games[index].home_team).get("Teams played against"));
        a1.push(games[index].away_team);
        var a2 = teamMap.get(games[index].away_team).get("Teams played against");
        //console.log(teamMap.get(games[index].away_team).get("Teams played against"));
        a2.push(games[index].home_team);;
        teamMap.get(games[index].away_team).set("Teams played against",a2);
        teamMap.get(games[index].home_team).set("Teams played against",a1);
        if(parseInt(games[index].home_score) < parseInt(games[index].away_score)) {
            teamMap.get(games[index].away_team).set("Wins",teamMap.get(games[index].away_team).get("Wins")+1);
        } else if (parseInt(games[index].home_score) == parseInt(games[index].away_score)) {
            teamMap.get(games[index].home_team).set("Ties",teamMap.get(games[index].home_team).get("Ties")+1);
            teamMap.get(games[index].away_team).set("Ties",teamMap.get(games[index].away_team).get("Ties")+1);
        } else {
            teamMap.get(games[index].home_team).set("Wins",teamMap.get(games[index].home_team).get("Wins")+1);
        }
    }
    console.log(teamMap);
    var averages = [];
    function forAllTeams(v, k, m) {
        m.get(k).set("Win Percentage", (m.get(k).get("Wins")+(m.get(k).get("Ties") * 0.5))/m.get(k).get("Games played"));
    }
    function forAllTeams2(v, k, m) {
         //console.log(here);
         let temp = v.get("Teams played against");
         console.log(temp);
         let tempW = m.get(k).get("Win Percentage");
         //let tsize = temp.length;
         var sum = 0.0;
         for(var j=0; j<temp.length;j++) {
             console.log(temp[j]);
             sum += teamMap.get(temp[j]).get("Win Percentage");
         }
         var numRivals = temp.length;
         var numRivalsAvg = sum/numRivals;
         console.log( tempW - sum/numRivals)
         averages.id = k;
         averages.score = tempW - sum/numRivals;
    }
    teamMap.forEach(forAllTeams);
    teamMap.forEach(forAllTeams2);
    console.log(teamMap);
    r = [-100,100];
    r2 = [0,100];
    var y = d3.scaleLinear().range([-600,600]).domain(r);
    var x = d3.scaleLinear().range([0,100]).domain(r2);
    g3.append("g").call(d3.axisLeft(y));
    g3.append("g").call(d3.axisBottom(x)).attr("transform", "translate(0, 100)");
    //Array.from(teamMap).map(([season,games]) => ({season,games}));
    console.log(averages);
    g3.append("g").selectAll("dot").data(averages).enter()
    .append("circle").attr("cy", function(team){return team}).attr("cx", function(team){return team}).attr("r", 5);
});

d3.csv("/data/football.csv").then(function(games) {
    let teamMap = new Map();
    gSize = games.length;
    for(var index=0;index<gSize;index++){
        if(!teamMap.has(games[index].away_team)){
            teamMap.set(games[index].away_team, new Map());
            teamMap.get(games[index].away_team).set("Games played",0);
            teamMap.get(games[index].away_team).set("Wins",0);
            teamMap.get(games[index].away_team).set("Ties",0);
         } 
        if(!teamMap.has(games[index].home_team)){
            teamMap.set(games[index].home_team, new Map());
            teamMap.get(games[index].home_team).set("Games played",0);
            teamMap.get(games[index].home_team).set("Wins",0);
            teamMap.get(games[index].home_team).set("Ties",0);
        }
        teamMap.get(games[index].away_team).set("Games played",teamMap.get(games[index].away_team).get("Games played")+1);
        teamMap.get(games[index].home_team).set("Games played",teamMap.get(games[index].home_team).get("Games played")+1);
        if(parseInt(games[index].home_score) < parseInt(games[index].away_score)) {
            teamMap.get(games[index].away_team).set("Wins",teamMap.get(games[index].away_team).get("Wins")+1);
        } else if (parseInt(games[index].home_score) == parseInt(games[index].away_score)) {
            teamMap.get(games[index].home_team).set("Ties",teamMap.get(games[index].home_team).get("Ties")+1);
            teamMap.get(games[index].away_team).set("Ties",teamMap.get(games[index].away_team).get("Ties")+1);
        } else {
            teamMap.get(games[index].home_team).set("Wins",teamMap.get(games[index].home_team).get("Wins")+1);
        }
    }
    for (let k of teamMap.keys()) {
        if(teamMap.get(k).get("Games played") < 75){
          teamMap.delete(k);
      }
    }
    var averages = [];
    function forAllTeams(v, k, m) {
        m.get(k).set("Win Percentage", (m.get(k).get("Wins")+(m.get(k).get("Ties") * 0.5))/m.get(k).get("Games played"));
    }
    teamMap.forEach(forAllTeams);
    //console.log(teamMap);
    teams = []
    function forAllToArray(v, k, m) {
        teams.push([k, m.get(k).get("Win Percentage")]);
    }
    teamMap.forEach(forAllToArray);
    console.log(teams);
    teams.sort((t1,t2)=>t2[1]-t1[1]);
    console.log(teams);
    var x = d3.scaleBand()
      .domain(teams.map(function(team) { return team[0]}))     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
      .range([0, 100]);
        g2.append("g")
      .attr("transform", "translate(0," + 100 + ")")
      .call(d3.axisBottom(x));

  // Y axis: scale and draw:
    var y = d3.scaleLinear()
      .range([1000, 0]);
      y.domain([0, d3.max(teams, function(team) { return team[1]; })]);   // d3.hist has to be called before the Y axis obviously
    g2.append("g")
      .call(d3.axisLeft(y));

  // append the bar rectangles to the svg element
  g2.selectAll("rect")
      .data(teams).enter()
      .append("rect")
        .attr("x", function(team) { return x(team[0])})
        .attr("y", function(team) { return 1000-y(team[1])})
        .attr("width", x.bandwidth)
        .attr("height", function(d) {
        return y(d);
       });
        
});