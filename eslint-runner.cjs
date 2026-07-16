const Module = require('module');

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === 'typescript') {
    try {
      return originalResolve.call(this, '@typescript/typescript6', parent, isMain, options);
    } catch (e) {
      // Fallback if resolved package is not found
    }
  }
  return originalResolve.call(this, request, parent, isMain, options);
};

// Require ESLint binary
require('./node_modules/eslint/bin/eslint.js');
