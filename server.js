var config = require('./config.json');
var spawn = require('child_process').spawn;
var dependencies = [];

var createPivotQuery = function(dependencies) {
  var dependencyArray = dependencies.slice(0, dependencies.length - 3).split("\n")

  //1. Get the query object
  var queryObject = getQueryObject(dependencyArray);

  //2. Search for additional conditions for the pivot query
  var constraints = [];
  for (var j in dependencyArray) {
    var dependency = getDependency(dependencyArray[j]);
    var constraint = null;

    // PREP
    // Search for PREP and decide which additional condition we have to use
    if (dependency === "prep") {
      constraint = getChild(dependencyArray[j]);
      parent = getParent(dependencyArray[j]);

      if (getPOBJConstraint(dependencyArray, constraint)) {
        var endConstraint = convertConstraint(constraint);
        constraints.push(endConstraint + " = " + getPOBJConstraint(dependencyArray, constraint))
      }
    }

    if (dependency === "rcmod") {
      constraint = getChild(dependencyArray[j]);
      var value = getRCMODConstraint(dependencyArray, constraint);
      constraints.push(constraint + " = " + value);
    }

    if (dependency === "amod" && getAMODConstraint(dependencyArray[j])) {
      constraints.push("description = " + getAMODConstraint(dependencyArray[j]))
    }

    if (dependency === "amod" && getDateAMODConstraint(dependencyArray)) {
      constraints.push(getDateAMODConstraint(dependencyArray))
    }
  }

  return "?" + queryObject + ": " + constraints.join("; ");
}

var getDateAMODConstraint = function(dependencyArray) {
  for (var k in dependencyArray) {
    var child = getChild(dependencyArray[k]);
    var parent = getParent(dependencyArray[k]);
    var childDependency = getDependency(dependencyArray[k]);

    //If there is a dependency between year/month and last
    if (childDependency !== "amod") {
      continue;
    }

    var dateModifier = null;
    if (child === "last") {
      dateModifier = 1;
    }
    else {
      dateModifier = 0;
    }

    if (parent === "month") {
      var month = new Date().getMonth() + 1;
      month -= dateModifier;
      if (month === 0) {
        month = 12;
      }
      return "month = " + month;
    }
    else if (parent === "year") {
      var year = new Date().getFullYear();
      year -= dateModifier;
      return "year = " + year;
    }
  }
}

//pobj - subject - for example "in Salzburg"
var getPOBJConstraint = function(dependencyArray, constraint) {
  for (var k in dependencyArray) {
    var childDependency = getDependency(dependencyArray[k]);
    var parent = getParent(dependencyArray[k]);
    var value = getChild(dependencyArray[k]);

    if (childDependency === "pobj" && parent === constraint && value !== "year" && value !== "month") {
      return value;
    }
  }
  return null;
}

var convertConstraint = function(constraint) {
  switch (constraint) {
    case "in":
      constraint = "location";
      break;
    case "on":
      constraint = "location";
      break;
    case "at":
      constraint = "event";
      break;
    default:
      break;
  }
  return constraint;
}

//AMOD => ajectives
//Without date like "month" or "year"
var getAMODConstraint = function(dependency) {
  var child = getChild(dependency);
  var parent = getParent(dependency);
  if (parent !== "year" && parent !== "month") {
    return child;
  }
  else {
    return null;
  }
}

//RCMOD - verbs
var getRCMODConstraint = function(dependencyArray, constraint) {
  for (var k in dependencyArray) {
    var childDependency = getDependency(dependencyArray[k]);
    var parent = getParent(dependencyArray[k]);
    var value = null;
    // Subjects - for example "employ programmers"
    if (childDependency === "dobj" && parent === constraint) {
      return getChild(dependencyArray[k]);
    }
  }
}

// XCOMP
// Search for XCOMP and get child as query object
var getQueryObject = function(dependencyArray) {
  for (var j in dependencyArray) {
    var dependency = getDependency(dependencyArray[j]);
    if (dependency === "xcomp" || dependency === "ccomp") {
      return getChild(dependencyArray[j]);
    }
  }
}

var getParent = function(value) {
  return value.split("(")[1].split("-")[0];
}

var getChild = function(value) {
  return value.split(", ")[1].split("-")[0];
}

var getDependency = function(value) {
  return value.split("(")[0];
}

console.log("Reading. Please wait.")
var child = spawn("java", config.call);

child.stdout.on('data', function(buffer) {
  var data = buffer.toString();
  dependencies.push(data);
});

child.stderr.on('data', function(data) {
  //console.log('stderr: ' + data);
});

child.on('close', function(code) {
  console.log("File reading exited with code " + code + "\n\n");
  for (var i in dependencies) {
    console.log(createPivotQuery(dependencies[i]));
  }
});