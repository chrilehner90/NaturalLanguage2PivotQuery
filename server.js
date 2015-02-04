var config = require('./config.json');

var spawn = require('child_process').spawn;
var dependencies = [];

var createPivotQuery = function (dependencies) {
  for(var i in dependencies){
    var dependencyArray = dependencies[i].slice(0, dependencies[i].length-3).split("\n")
    var queryObject = null;
    var foundQueryObject = false;

    console.log(dependencyArray);

    // XCOMP
    // Search for XCOMP and get child as query object
    for (var j in dependencyArray) {
      var dependecy = dependencyArray[j].split("(")[0];
      if (dependecy === "xcomp") {
        queryObject = dependencyArray[j].split(", ")[1].split("-")[0];
        foundQueryObject = true;
      }
    }

    // NSUBJ
    // When there is no XCOMP, search for the nsubj with "Show" as parent
    if(!foundQueryObject) {
      for (var j in dependencyArray) {
        var dependecy = dependencyArray[j].split("(")[0];
        if (dependecy === "nsubj") {
          var parent = dependencyArray[j].split("(")[1].split("-")[0];
          if(parent == "Show"){
            queryObject = dependencyArray[j].split(", ")[1].split("-")[0];
            foundQueryObject = true;
          }
        }
      }
    }
    console.log(queryObject);
  }

  // PREP
  return "?" + queryObject;
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