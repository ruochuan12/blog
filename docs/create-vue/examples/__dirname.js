#!/usr/bin/env node

// https://stackoverflow.com/questions/64383909/dirname-is-not-defined-in-node-14-version
// https://github.com/nodejs/help/issues/2907

// import { fileURLToPath } from 'url';
// import { dirname } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

console.log(__dirname, '__dirname');