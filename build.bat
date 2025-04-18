@echo off
esbuild logic/index.js --bundle --platform=neutral --format=esm --outfile=logic/bundle.js
echo Done bundling
pause