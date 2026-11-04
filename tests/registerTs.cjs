const { registerHooks } = require('node:module');
const { extname, resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

// Node needs the same source alias as Vite and explicit TypeScript extensions.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      const sourcePath = resolve(__dirname, '../src', specifier.slice(2));
      const modulePath = extname(sourcePath) ? sourcePath : `${sourcePath}.ts`;

      return nextResolve(pathToFileURL(modulePath).href, context);
    }

    if (specifier.startsWith('.') && !extname(specifier)) {
      return nextResolve(`${specifier}.ts`, context);
    }

    return nextResolve(specifier, context);
  },
});
