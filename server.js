var config = require('./config.json');
var spawn = require('child_process').spawn;
var dependencies = [];

var createPivotQuery = function (dependencies) {
  var pivotQueries = [];
  for(var i in dependencies){
    var dependencyArray = dependencies[i].slice(0, dependencies[i].length-3).split("\n")
    var queryObject = null;
    var foundQueryObject = false;

    console.log(dependencyArray);

    // XCOMP
    // Search for XCOMP and get child as query object
    for (var j in dependencyArray) {
      var dependecy = dependencyArray[j].split("(")[0]; // xcomp(Show-1, people-4) --> extracts 
      if (dependecy === "xcomp") {
        queryObject = dependencyArray[j].split(", ")[1].split("-")[0]; // root(ROOT-0, Show-1) --> extracts Show
        foundQueryObject = true;
      }
    }

    // PREP
    // Search for PREP and decide which additional condition we have to use
    var constraints = [];
    for (var j in dependencyArray) {
      var dependecy = dependencyArray[j].split("(")[0];
      var constraint = null;
      if (dependecy === "prep") {
        var constraint = dependencyArray[j].split(", ")[1].split("-")[0];

        switch(constraint) {
          case "in":
            constraint = "location";
            break;
          case "on":
            constraint = "location";
            break;
          case "at":
            constraint = "event";
          default:
            break;
        }

        for (var k in dependencyArray) {
          var dependecy = dependencyArray[k].split("(")[0];
          var value = null;
          if (dependecy === "pobj") {
            value = dependencyArray[k].split(", ")[1].split("-")[0];

            constraints.push(constraint + ": " + value);
          }
        }
      }
    }

    constraints = constraints.join(";");

    pivotQueries.push("?" + queryObject + ": " + constraints);
    return pivotQueries; //check only the first sentence
  }
}


/**

 Show me all people

 root(ROOT-0, Show-1)
 nsubj(people-4, me-2)
 det(people-4, all-3)
 xcomp(Show-1, people-4)

 ?people

 **/

console.log("Reading. Please wait.")
var child = spawn("java", config.call);

child.stdout.on('data', function (buffer) {
  var data = buffer.toString();
  dependencies.push(data);
});

child.stderr.on('data', function (data) {
  //console.log('stderr: ' + data);
});

child.on('close', function (code) {
  console.log("File reading exited with code " + code + "\n\n");
  console.log(createPivotQuery(dependencies));
});