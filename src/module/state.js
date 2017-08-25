import FastObject from "../fast-object.js"

import extensions from "./extensions.js"
import initPaths from "./init-paths.js"

const state = new FastObject
state._cache = Object.create(null)
state._extensions = extensions
state.globalPaths = initPaths()
state.requireDepth = 0

export default state