#!/bin/sh

cd ../opencv

docker run --rm --workdir /code -v "$(get-location):/code" "trzeci/emscripten:latest" python ./platforms/js/build_js.py --build_wasm --simd --threads --build_loader --build_test build_wasm_simd_threads 
#mv build_wasm_simd_threads\bin\opencv.js build_wasm_simd_threads\bin\opencv_wasm_simd_threads.js 

docker run --rm --workdir /code -v "$(get-location):/code" "trzeci/emscripten:latest" python ./platforms/js/build_js.py --build_wasm --simd --build_loader --build_test build_wasm_simd
#mv build_wasm_simd\bin\opencv.js build_wasm_simd\bin\opencv_wasm_simd.js 

docker run --rm --workdir /code -v "$(get-location):/code" "trzeci/emscripten:latest" python ./platforms/js/build_js.py --build_wasm --threads --build_loader --build_test build_wasm_threads 
#mv build_wasm_threads\bin\opencv.js build_wasm_threads\bin\opencv_wasm_threads.js 

docker run --rm --workdir /code -v "$(get-location):/code" "trzeci/emscripten:latest" python ./platforms/js/build_js.py --build_wasm --build_loader --build_test build_wasm 
#mv build_wasm\bin\opencv.js build_wasm\bin\opencv_wasm.js 

