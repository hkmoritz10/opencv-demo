#!/bin/sh

cd ../opencv

docker run --rm --workdir /src -v "$(get-location):/src" "emscripten/emsdk:2.0.10" emcmake python3 ./platforms/js/build_js.py --clean_build_dir --build_wasm --simd --threads --build_loader --build_test build_wasm_simd_threads 
copy build_wasm_simd_threads\bin\opencv.js build_wasm_simd_threads\bin\opencv_wasm_simd_threads.js 

docker run --rm --workdir /src -v "$(get-location):/src" "emscripten/emsdk:2.0.10" emcmake python3 ./platforms/js/build_js.py --clean_build_dir --build_wasm --simd --build_loader --build_test build_wasm_simd
copy build_wasm_simd\bin\opencv.js build_wasm_simd\bin\opencv_wasm_simd.js 

docker run --rm --workdir /src -v "$(get-location):/src" "emscripten/emsdk:2.0.10" emcmake python3 ./platforms/js/build_js.py --clean_build_dir --build_wasm --threads --build_loader --build_test build_wasm_threads 
copy build_wasm_threads\bin\opencv.js build_wasm_threads\bin\opencv_wasm_threads.js 

docker run --rm --workdir /src -v "$(get-location):/src" "emscripten/emsdk:2.0.10" emcmake python3 ./platforms/js/build_js.py --clean_build_dir --build_wasm --build_loader --build_test build_wasm 
copy build_wasm\bin\opencv.js build_wasm\bin\opencv_wasm.js 

 