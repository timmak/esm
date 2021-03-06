import ENTRY from "../../constant/entry.js"

import _loadESM from "./_load.js"
import builtinEntries from "../../builtin-entries.js"
import errors from "../../errors.js"

const {
  STATE_PARSING_COMPLETED,
  TYPE_ESM
} = ENTRY

const {
  ERR_EXPORT_MISSING,
  ERR_EXPORT_STAR_CONFLICT
} = errors

function validate(entry) {
  const { dependencySpecifiers, exportSpecifiers } = entry.compileData

  const children = { __proto__: null }
  const mod = entry.module

  // Parse children.
  for (const name in dependencySpecifiers) {
    if (name in builtinEntries) {
      continue
    }

    const childEntry =
    children[name] = _loadESM(name, mod)

    entry.children[childEntry.name] = childEntry

    if (childEntry.state < STATE_PARSING_COMPLETED) {
      childEntry.state = STATE_PARSING_COMPLETED
    }
  }

  const { namedExports } = entry.package.options.cjs

  // Validate requested child export names.
  for (const name in children) {
    const childEntry = children[name]
    const child = childEntry.module
    const requestedExportNames = dependencySpecifiers[name]

    if (childEntry.type !== TYPE_ESM) {
      if (! namedExports &&
          requestedExportNames.length &&
          (requestedExportNames.length > 1 ||
           requestedExportNames[0] !== "default")) {
        throw new ERR_EXPORT_MISSING(child, requestedExportNames[0])
      }

      continue
    }

    const childCompileData = childEntry.compileData
    const childExportStars = childCompileData.exportStars
    const skipExportMissing = childEntry.package.options.cjs.vars

    for (const requestedName of requestedExportNames) {
      const { exportSpecifiers:childExportSpecifiers } = childCompileData

      if (requestedName in childExportSpecifiers) {
        if (childExportSpecifiers[requestedName] < 3) {
          continue
        }

        throw new ERR_EXPORT_STAR_CONFLICT(mod, requestedName)
      }

      let throwExportMissing = ! skipExportMissing

      if (throwExportMissing) {
        for (const childName of childExportStars) {
          if (! (childName in children)) {
            throwExportMissing = false
            break
          }
        }
      }

      if (throwExportMissing) {
        throw new ERR_EXPORT_MISSING(child, requestedName)
      }
    }
  }

  // Resolve export names from star exports.
  for (const childName of entry.compileData.exportStars) {
    if (childName in builtinEntries) {
      continue
    }

    const childEntry = children[childName]

    if (childEntry.type !== TYPE_ESM) {
      continue
    }

    for (const exportName in childEntry.compileData.exportSpecifiers) {
      if (exportName in exportSpecifiers) {
        if (exportSpecifiers[exportName] === 2) {
          // Export specifier is conflicted.
          exportSpecifiers[exportName] = 3
        }
      } else {
        // Export specifier is imported.
        exportSpecifiers[exportName] = 2
      }
    }
  }
}

export default validate
