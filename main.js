// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 70;
const margin = {top: 40, right: 100, bottom: 40, left: 100};

let WC_YEAR_LATEST = 2018;
let WC_YEAR_SEC = 2014;
// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = 500, graph_1_height = 500;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 500;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 250;

let g1 = d3.select("#graph1").append("svg");
g1.attr("width", graph_1_width).attr("heigth", graph_1_height)
.attr("transform", `translate(${margin.left},${margin.top})`).append("g");


let g2 = d3.select("#graph2").append("svg");
g2.attr("width", graph_2_width).attr("heigth", graph_2_height+50)
.attr("transform", `translate(${margin.left},${margin.top})`).append("g");

let g3 = d3.select("#graph3").append("svg");
g3.attr("width", graph_3_width).attr("heigth", graph_3_height)
.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

//add title here
g1.append("text").text("Annual Seasons").attr("transform",
`translate(${(500) / 2},
${(500) + 15})`);

g1.append("text").text("Number of Games").attr("transform",
`translate(${(graph_1_width-margin.left-margin.right) / 2},
${(graph_1_height-margin.bottom-margin.top) /2})`);
//var coloring = d3.scaleLinear().domain([1,10])
 // .range(["white", "blue"]);
 let coloring = d3.scaleOrdinal()
    .range(d3.quantize(d3.interpolateHcl("#D03B12", "#12D021"), 10));
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
        let setData = Array.from(dict).map(([season,games]) => ({season,games}));
        x_range = [0, graph_1_width];
        y_range = [graph_1_height, 0];
        setData.sort((game1, game2) => game2.season - game1.season);
        var xd = d3.scaleLinear().range(x_range);
        var yd = d3.scaleLinear().range(y_range);
        
        coloring.domain(setData.map(function(game) {return parseInt(game.games)}));
        yd.domain(setData.map(function(game) {return parseInt(game.season)}));
        xd.domain([0, 1200]);
        y_axis = g1.append("g");
        y_axis.call(d3.axisLeft(yd));
        //g1.append("g").call(d3.axisBottom(x_axis));
        setData = setData.slice(0,10);
        console.log(setData);
        console.log("setdata above");
        bs = g1.selectAll("rect").data(setData);
        g1.selectAll("text").data(setData).enter().append("text").merge(g1.selectAll("text").data(setData)).text(function(game){return parseInt(game.games)})
        .attr("y", function(game){console.log(parseInt(game.season)); return yd(parseInt(game.season))})
        .attr("x",function(game){return xd(parseInt(game.games))})
        bs.enter().append("rect").merge(bs)
        .attr("y", function(game){return (yd(game.season)/10)+400})
        .attr("x",  xd(0))
        .attr("height", function(game){graph_1_height - (yd(parseInt(game.season))/10)+400})
        .attr("width",function(game){return xd(parseInt(game.games))})
        .attr("fill",function(game){return coloring(game.games)});
        g1.selectAll("text").data(setData).exit().remove();
        g1.selectAll("rect").data(setData).exit().remove();  
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
    //var averages = [];
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
         //averages.score = tempW - sum/numRivals;
         teamMap.get(k).set("Rival Performance", (tempW - sum/numRivals));
         console.log("above");    }
    teams = [];
    teamMap.forEach(forAllTeams);
    teamMap.forEach(forAllTeams2);
    function forAllToArray(v, k, m) {
        teams.push([k, m.get(k).get("Win Percentage"), m.get(k).get("Rival Performance")]);
    }
    teamMap.forEach(forAllToArray);
    console.log(teams);
    teams.sort((t1,t2)=>t2[1]-t1[1]);
    console.log(teams);
    teams = teams.slice(0,10);
    console.log(teamMap);
    var x = d3.scaleLinear()
    //.domain()
    .range([ 0, graph_3_width -margin.left - margin.right ]).domain([0,d3.max(teams, function(d){return parseInt(d[0])})]);
  g3.append("g")
    .attr("transform", "translate(0," + graph_3_height + ")")
    .call(d3.axisBottom(x));
    console.log(teams[0][0]);
    console.log(teams[0][1]);
    console.log(teams[0][2]);
  // Add Y axis
  var y = d3.scaleBand()
    //
    .range([0, graph_3_height-margin.top-margin.bottom])
    .domain(teams.map(function(d){ return d[1] }));
  g3.append("g")
    .call(d3.axisLeft(y));
  var z = d3.scaleLinear()
    .domain([0, 1])
    .range([5, 30]);
  var myColor = d3.scaleOrdinal()
    .domain([0, 10])
    .range(d3.schemeSet2);
    console.log("teams below");
    console.log(teams);
   /* g3.enter().append("circle").data(teams).transition().duration(1000)
    .attr("cx", function (d) { return x(Date.parse(d[0])); } )
    .attr("cy", function (d) { return y(parseInt(d[1])); } )
    .attr("r", 4);
    g3.exit().remove();*/
    
  g3.append('g')
    .selectAll("dot")
    .data(teams)
    .enter()
    .append("circle")
      .attr("class", "bubbles")
      .attr("cx", function (d) { return x((d[0])); } )
      .attr("cy", function (d) { return y((d[1])); } )
      .attr("r", function (d) { return z(d[2]); } )
      .style("fill", function (d) { return myColor(d[2]); } );
    
    g3.exit().remove();
    //g3.selectAll("rect").data(teams).exit().remove();
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
    teams = teams.slice(0,10);
    console.log(teams);
    var x = d3.scaleBand().padding(0.1)
        .domain(teams.map(function(team) { return team[0]}))
        .range([0, graph_2_width - margin.left - margin.right]);
    g2.append("g")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(0," + graph_2_height + ")")
        .style("text-anchor", "end");
    var y = d3.scaleLinear().domain([0, 1])
      .range([graph_2_height-margin.top-margin.bottom, 0])
    ;
    g2.append("g").call(d3.axisLeft(y));
    g2.selectAll("rect").data(teams).enter()
        .append("rect")
        .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2},
                                            ${(graph_2_height - margin.top - margin.bottom) + 15})`)
        .merge(g2.selectAll("rect").data(teams))
        //.attr("fill", function(d) { return color(d[attr]) })    // OPTIONAL for students
        .attr("x", function(team) { return x(team[0])})
        .attr("y", function(team) { return (graph_2_height - margin.top - margin.bottom) - y(team[1])})
        .attr("height", function(team) { return y(team[1])})
        .attr("width", x.bandwidth);
    g2.append("text")
        .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2},
                                            ${(graph_2_height - margin.top - margin.bottom) + 15})`)
        .style("text-anchor", "middle")
        .text("Count");
    g2.selectAll("text").data(teams).exit().remove();
    g2.selectAll("rect").data(teams).exit().remove();
});