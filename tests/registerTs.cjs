const { existsSync } = require('node:fs');
const { registerHooks } = require('node:module');
const { extname, resolve } = require('node:path');
const { fileURLToPath, pathToFileURL } = require('node:url');

const resolveSource = (sourcePath) => {
  if (extname(sourcePath)) return sourcePath;

  const filePath = sourcePath + '.ts';
  return existsSync(filePath) ? filePath : resolve(sourcePath, 'index.ts');
};

const resolveTypeScript = (sourcePath, context, nextResolve) => {
  const modulePath = resolveSource(sourcePath);
  const specifier = context.conditions.includes('require')
    ? modulePath
    : pathToFileURL(modulePath).href;

  return nextResolve(specifier, context);
};

// Node needs the same source alias and directory imports as Vite.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      const sourcePath = resolve(__dirname, '../src', specifier.slice(2));

      return resolveTypeScript(sourcePath, context, nextResolve);
    }

    if (specifier.startsWith('.') && !extname(specifier)) {
      const sourcePath = fileURLToPath(new URL(specifier, context.parentURL));

      return resolveTypeScript(sourcePath, context, nextResolve);
    }

    return nextResolve(specifier, context);
  },
});
