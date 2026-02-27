// Import the file system module
const fs = require('fs');

// Define the file path
const filePath = 'toRun.txt';
let data = "";

try {
    // Read the file content synchronously with 'utf-8' encoding
    data = fs.readFileSync(filePath, 'utf-8');
} catch (err) {
    console.error("Error reading the file:", err);
}
let debugMode = false;
run(data, {"PI": Math.PI, "E": Math.E})
function run(code, setVars){
  function decide(txt){
    if(txt.match(/\/.*\//)) txt = RegExp(txt.replaceAll("/", ""))
    if(typeof(txt) == 'string'){
      txt = txt.replaceAll("|", "\"")
      if(debugMode) console.log("--DECIDE(" + txt + ")--")
      if(txt.match(/^[0-9]+(\.[0-9]+)?$/g)){
        value = parseFloat(txt);
        if(debugMode) console.log("number: " + value)
      } else if(txt.match(/^\".*\"/)){
        value = txt.replaceAll("\"", "")
        if(debugMode) console.log("string: " + value)
      } else if(txt.match(/^\[.*\]/)){
        value = JSON.parse("["+ txt.replace("[", "").replace("]", "").split(", ").map((v)=>variableReplace(v)) + "]")
        if(debugMode) console.log("array: " + JSON.stringify(value))
      } else if (txt.match(/.+( .*| (.* <? )+)?/g)){
        let splt = txt.split(" < ")
        let first = splt[0].split(" ")
        let firstFirst = first.shift()
        let inp = first.join(" ")
        value = fn(firstFirst, inp, value)
      }
    } else {
      value = txt
    }
  }
  function variableReplace(txt){
    if(vars[txt]){
      return vars[txt]
    } else {
      return txt
    }
  }
  function fn(type, input, val){
    input = input.replaceAll("\"", "")
    if(debugMode) console.log("--Function(" + [type, input, val].join(", ") + ")--")
    input = variableReplace(input)
    if(type == "store"){
      if(input != ""){
        if(input.match(/\[.+\]/)){
          vars[variableReplace(input.toString().replaceAll(/|\[|\]/g, ""))] = val
          if(debugMode) console.log("storing variable '" + variableReplace(input.toString().replaceAll(/"|\[|\]/g, "")) + "'")
        } else {
          vars[input] = val
          if(debugMode) console.log("storing variable '" + input + "'")
        }
      }else{
        vars[curVar] = val
        if(debugMode) console.log("storing variable '" + curVar + "'")
      }
      return val
    } else if(type == "+"){
      if(typeof(val) == 'number'){
        if(debugMode) console.log("adding " + val + " + " + parseFloat(input))
        return val + parseFloat(input)
      }else{
        if(debugMode) console.log("adding values " + val + " + " + input + "(" + typeof(input) + ")")
        return val + input
      }
    } else if(type == "get_var"){
      if(debugMode) console.log("getting variable '" + val + "'")
      return variableReplace(val)
    } else if(type == "-"){
      if(debugMode) console.log("subtracting " + val + " - " + parseFloat(input))
      return val - parseFloat(input)
    } else if(type == "*"){
      if(debugMode) console.log("multiplying " + val + " * " + parseFloat(input))
      return val * parseFloat(input)
    } else if(type == "/"){
      if(debugMode) console.log("dividing " + val + " / " + parseFloat(input))
      return val / parseFloat(input)
    } else if(type == "^"){
      if(debugMode) console.log("power " + val + " ^ " + parseFloat(input))
      return Math.pow(val, parseFloat(input))
    } else if(type == "="){
      if(val != null && val !== 'number'){
        if(debugMode) console.log("comparing " + val + " == " + input)
         return val == input
      } else{
        if(debugMode) console.log("comparing numbers " + val + " == " + parseFloat(input))
        return val == parseFloat(input)
      }
    } else if(type == "->"){
      if(debugMode) console.log("comparing " + val + " > " + parseFloat(input))
      return val > parseFloat(input)
    } else if(type == "<-"){
      if(debugMode) console.log("comparing " + val + " > " + parseFloat(input))
      return val < parseFloat(input)
    } else if(type == "=->"){
      if(debugMode) console.log("comparing " + val + " > " + parseFloat(input))
      return val >= parseFloat(input)
    } else if(type == "<-="){
      if(debugMode) console.log("comparing " + val + " > " + parseFloat(input))
      return val <= parseFloat(input)
    } else if(type == "log"){
      if(debugMode) console.log("log:")
      console.log(val)
      return val
    } else if(type == "?"){
      if(debugMode) console.log("continue line? " + val)
      shouldContinueLine = (val == true)
      if(val == false) lastLineIsFalse = 2
      return val
    } else if(type == "??"){
      if(lastLineIsFalse == 1){
        if(val != null){
          if(debugMode) console.log("continue line? " + val)
          shouldContinueLine = (val == true)
          if(val == false) lastLineIsFalse = 2
          return val
        } else {
          if(debugMode) console.log("else running.")
          shouldContinueLine = true
          return true
        }
      } else {
        if(debugMode) console.log("else failed.")
        shouldContinueLine = false
        return false
      }
    } else if(type == "!"){
      if(debugMode) console.log("--REPEAT("+val+")--")
      if(debugMode) console.log("to repeat: " + repeatPattern)
      for(vars[input] = 0; vars[input] < val-1; vars[input]++){
        if(debugMode) console.log("-repeat " + (vars[input] + 1) + ": " + repeatPattern)
        run(repeatPattern, vars);
      }
      return vars[input]
    } else if (type == "length"){
      if(typeof(val) == 'object') {
        if(debugMode) console.log("finding the length of " + JSON.stringify(val))
        return val.length
      }
      else {
        if(debugMode) console.log("can't find the length of " + val + " (" + typeof(val) + ")")
        return val
      }
    } else if (type == "round"){
      return Math.round(val)
    } else if (type == "ceil"){
      return Math.ceil(val)
    } else if (type == "floor"){
      return Math.floor(val)
    } else if (type == "trunc"){
      return Math.trunc(val)
    } else if (type == "abs"){
      return Math.abs(val)
    } else if (type == "sign"){
      return Math.sign(val)
    } else if (type == "exp"){
      return Math.exp(val)
    } else if (type == "logr"){
      return Math.log(val)
    } else if (type == "sin"){
      return Math.sin(val)
    } else if (type == "cos"){
      return Math.cos(val)
    } else if (type == "tan"){
      return Math.tan(val)
    } else if (type == "asin"){
      return Math.asin(val)
    } else if (type == "acos"){
      return Math.acos(val)
    } else if (type == "atan"){
      return Math.atan(val)
    } else if (type == "sinh"){
      return Math.sinh(val)
    } else if (type == "cosh"){
      return Math.cosh(val)
    } else if (type == "tanh"){
      return Math.tanh(val)
    } else if (type == "asinh"){
      return Math.asinh(val)
    } else if (type == "acosh"){
      return Math.acosh(val)
    } else if (type == "atanh"){
      return Math.atanh(val)
    } else if (type == "max"){
      return Math.max(val, input)
    } else if (type == "min"){
      return Math.min(val, input)
    } else if(type == "sqrt"){
      return Math.sqrt(val)
    } else if (type == "random"){
      return Math.random() * (input - val) + val;
    } else if (type == "match"){
      return input.match(val) != null
    } else if (type == "split"){
      return val.split(input)
    } else if(type.match(/.+\[[0-9]\]/g)){
      let varia = type.replace(/[\[0-9\]]/g, "")
      if(debugMode) console.log("getting array value: " + varia + "[" + parseInt(type.replace(/[^0-9]/g, "")) + "]")
      return vars[varia][parseInt(type.replace(/[^0-9]/g, ""))]
    } else if(type.match(/.+\[.+\]/g)){
      let varia = type.replace(/\[.+\]/g, "")
      if(debugMode) console.log("getting array value: " + varia + "[" + type.replace(/.+\[/g, "").replace(/\]/g, "") + "]")
      return vars[varia][vars[type.replace(/.+\[/g, "").replace(/\]/g, "")]]
    } else if(vars[type] != null){
      curVar=type;
      if(debugMode) console.log("variable " + type)
      return vars[type]
    } else {
      return val
    }
  }
  /**
  * Get all indexes of a specific character in a string
  * @param {string} str - The string to search
  * @param {string} char - The character to find (must be a single character)
  * @returns {number[]} - Array of indexes where the character occurs
  */
  function getAllIndexes(str, char) {
    // Input validation
    if (typeof str !== 'string' || typeof char !== 'string') {
      throw new TypeError('Both arguments must be strings.');
    }
    if (char.length !== 1) {
      throw new Error('The search character must be exactly one character long.');
    }

    const indexes = [];
    for (let i = 0; i < str.length; i++) {
      if (str[i] === char) {
        indexes.push(i);
      }
    }
    return indexes;
  }
  let currentLine = "";
  let repeatPattern = "";
  let vars = setVars
  let value = null;
  let curVar = "";
  let shouldContinueLine = true;
  let lastLineIsFalse = 0;
  code.split("\n").map((v)=>v.trim()).forEach((s, i)=>{
    if(debugMode) console.log(JSON.stringify(vars))
    shouldContinueLine = true;
    if(lastLineIsFalse > 0) lastLineIsFalse -= 1;
    value = null
    if(debugMode) console.log("-->Line " + i + ":")
    currentLine = s.replace(/^.*! [A-Za-z]+ >|> \?!.*$/g, '').trim();
    repeatPattern = currentLine.replace(/^.*! [A-Za-z]+ >|> \?!.*$/g, '').trim()
    if(debugMode) console.log("/\\/\\repeat pattern: " + repeatPattern);
    s.split(" > ").map((v)=>v.trim()).forEach((h)=>{
      if(debugMode) console.log(JSON.stringify(vars))
      if(debugMode) console.log("/\\/\\start:\"" + currentLine + "\"")
      if(h == "?!") shouldContinueLine = true;
      currentLine = currentLine.replace(h + " > ", "")
      repeatPattern = currentLine.replace(/^.*! [A-Za-z]+ >|> \?!.*$/g, '').trim()
      if(shouldContinueLine) decide(h, vars)
    })
  })
}
