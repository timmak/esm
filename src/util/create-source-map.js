import toStringLiteral from "./to-string-literal.js"

const newlineRegExp = /\n/g

function createSourceMap(filename, content) {
  let lineCount = -1
  let mapping = ""

  while (lineCount < 0 ||
      newlineRegExp.test(content)) {
    mapping += (++lineCount ? ";" : "") + "AA" + (lineCount ? "C" : "A") + "A"
  }

  return '{"version":3,"sources":[' +
    toStringLiteral(filename) +
    '],"names":[],"mappings":"' + mapping + '"}'
}

export default createSourceMap
