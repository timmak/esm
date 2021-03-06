import functionPrototypeToString from "./shim/function-prototype-to-string.js"

const Shim = {
  __proto__: null,
  enable(context) {
    functionPrototypeToString.enable(context)
    return context
  }
}

export default Shim
