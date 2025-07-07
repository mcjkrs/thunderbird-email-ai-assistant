#!/bin/bash

# 1. Run webpack to bundle the script and its dependencies
./node_modules/.bin/webpack

# 2. Run web-ext to package the extension
./node_modules/.bin/web-ext build --overwrite-dest --ignore-files "tmp/" "package.json" "package-lock.json" "webpack.config.js" --ignore-files "build.bash" --ignore-files "sign.bash"
