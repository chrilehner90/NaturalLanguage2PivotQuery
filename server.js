var config = require('./config.json');

var spawn = require('child_process').spawn;
var dependencies = [];

var createPivotQuery = function(dependencies) {
  for(var parsedSentence in dependencies) {
    var dependencyArray = dependencies[parsedSentence].split("\n");
    for(var dependency in dependencyArray) {
        console.log(dependencyArray[dependency]); // one dependecy to parse ( e.g. root(ROOT-0, Show-1) )
    }
  }
}

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
  createPivotQuery(dependencies);
});


