var config = require('./config.json');

var spawn = require('child_process').spawn;
var dependencies = [];

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
  for(var dep in dependencies) {
    console.log(dependencies[dep]);
  }
  console.log("File reading exited with code " + code);
});