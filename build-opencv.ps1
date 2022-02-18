#!/bin/sh

$OPENCV_ROOT="D:\Scratch\OpenCV"
$EMSCRIPT_VERSION="2.0.10"

$currDir = Get-Location

$builds = ( "wasm", "wasm_simd", "wasm_threads", "wasm_simd_threads")

cd ${OPENCV_ROOT}
ForEach( $build in $builds ) {
    docker run --rm --workdir /src -v "$(get-location):/src" "emscripten/emsdk:${EMSCRIPT_VERSION}" emcmake python3 ./platforms/js/build_js.py --clean_build_dir --build_wasm --simd --threads --build_loader --build_test build_$build 
    copy build_wasm_simd_threads\bin\opencv.js build_wasm_simd_threads\bin\opencv_wasm_simd_threads.js 
    copy build_wasm_simd_threads\bin\opencv.js $currDir/js/    
}
