var config = require('./config.json');

var spawn = require('child_process').spawn;
var dependencies = [];

// var child = spawn("java", [
//   "-mx1024m",
//   "-cp",
//   "./parsers/stanford/*",
//   "edu.stanford.nlp.parser.lexparser.LexicalizedParser",
//   "-outputFormat",
//   "penn",
//   "edu/stanford/nlp/models/lexparser/englishFactored.ser.gz",
//   "./parsers/stanford/input.txt"
// ]);

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