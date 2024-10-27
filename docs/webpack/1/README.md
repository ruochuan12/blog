
https://createapp.dev/webpack


```json
{
  "name": "empty-project",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "keywords": [],
  "author": "",
  "license": "ISC",
  "scripts": {
    "clean": "rm dist/bundle.js",
    "build-dev": "webpack --mode development",
    "build-prod": "webpack --mode production"
  },
  "dependencies": {},
  "devDependencies": {
    "webpack": "^5.95.0",
    "webpack-cli": "^5.1.4"
  }
}
```

```js
const webpack = require('webpack');
const path = require('path');

const config = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  }
};

module.exports = config;
```
