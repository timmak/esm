// Based on Node's `Module.prototype.load` method.
// Copyright Node.js contributors. Released under MIT license:
// https://github.com/nodejs/node/blob/master/lib/module.js

import { dirname, extname } from "path"

import Module from "../module.js"

const ExError = __external__.Error

function load(filename) {
  if (this.loaded) {
    throw new ExError("Module already loaded: " + this.id)
  }

  let ext = extname(filename)

  if (ext === "" ||
      typeof Module._extensions[ext] !== "function") {
    ext = ".js"
  }

  this.filename = filename
  this.paths = Module._nodeModulePaths(dirname(filename))

  Module._extensions[ext](this, filename)
  this.loaded = true
}

export default load
