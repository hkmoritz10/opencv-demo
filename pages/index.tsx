import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { MutableRefObject, useEffect, useRef, useState } from 'react'
import { cv } from '../services/cv'
import { loadOpenCV } from '../public/ts/loader'

// requestVideoFrameCallback fill
interface VideoFrameMetadata {
  presentationTime: DOMHighResTimeStamp;
  expectedDisplayTime: DOMHighResTimeStamp;
  width: number;
  height: number;
  mediaTime: number;
  presentedFrames: number;
  processingDuration?: number;
  captureTime?: DOMHighResTimeStamp;
  receiveTime?: DOMHighResTimeStamp;
  rtpTimestamp?: number;
};
type VideoFrameRequestCallbackId = number;

interface HTMLVideoElement extends HTMLMediaElement {
  requestVideoFrameCallback(callback: (now: DOMHighResTimeStamp, metadata: VideoFrameMetadata) => any): VideoFrameRequestCallbackId;
  cancelVideoFrameCallback(handle: VideoFrameRequestCallbackId): void;
  disablePictureInPicture: boolean;
  height: number;
  width: number;
  onenterpictureinpicture(): void;
  onleavepictureinpicture(): void;
  playsInline: boolean;
  poster: string;
  videoHeight: number;
  videoWidth: number;
  requestPictureInPicture(): Promise<PictureInPictureWindow>;
  getVideoPlaybackQuality(): VideoPlaybackQuality;
}

// We'll limit the processing size to 1080
const maxVideoSize = 1080

const Home: NextPage = () => {
  //const [processing, setProcessing] = useState(false);
  const videoElement: MutableRefObject<HTMLVideoElement | null> = useRef(null);
  const canvasEl: MutableRefObject<HTMLCanvasElement | null> = useRef(null);

  /**
   * In the useEffect hook what we are going to do is load the video
   * element so that it plays what you see on the camera. This way
   * it's like a viewer of what the camera sees and then at any
   * time we can capture a frame to take a picture and upload it
   * to OpenCV.
   */
  useEffect(() => {

    async function setupCamera(): Promise<HTMLVideoElement> {
      if (videoElement.current !== null) {
        videoElement.current.width = 320;
        videoElement.current.height = 320;
      }
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: 'user',
          },
        })

        if (videoElement.current !== null) {
          videoElement.current!.srcObject = stream
        }

        return new Promise(resolve => {
          if (videoElement.current !== null) {
            videoElement.current!.onloadedmetadata = () => {
              resolve(videoElement.current!);
            }
          }
        })
      }
      const errorMessage =
        'This browser does not support video capture, or this device does not have a camera'
      alert(errorMessage)
      return Promise.reject(errorMessage)
    }

    async function setupFrameCapture(): Promise<HTMLVideoElement> {
      const video = await setupCamera();

      return video;
    }

    async function drawingLoop(now: number, frame: VideoFrameMetadata): Promise<void> {
      const bitmap = await createImageBitmap(videoElement.current!);
      console.log(`drawingLoop: grayScale bitmap ${bitmap} ${bitmap.width}x${bitmap.height}`);
      const processedImage: MessageEvent = await cv.grayScale(bitmap);
      console.log("processed image received");
      if (canvasEl.current !== null) {
        const ctx = canvasEl.current.getContext('2d');
        // Render the processed image to the canvas
        if (processedImage.data.payload !== null) {
          ctx!.putImageData(processedImage.data.payload, 0, 0)
        }
        if (videoElement.current !== null) {
          if (!videoElement.current.ended) {
            videoElement.current.requestVideoFrameCallback(drawingLoop);
          } else {
          }
        }
      }
    }

    async function loaded_cb() {
      console.log( `opencv loaded callback called` );
    }

    async function load() {
      // Load the model
      loadOpenCV({
        'wasm': '/js/opencv_wasm.js',
        'threads': '/js/opencv_wasm_threads.js',
//        'simd': '/js/opencv_wasm_simd.js',
//        'threadsSimd': '/js/opencv_wasm_simd_threads.js'
      }, loaded_cb );

      await loaded_cb();

      const videoLoaded = await setupFrameCapture();

      videoLoaded.play();
      console.log("Start drawing loop");
      videoLoaded.requestVideoFrameCallback(drawingLoop);

      return videoLoaded;
    }

    load();
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <video style={{ width: 320 + "px" }} className="video" playsInline ref={videoElement} />
      <canvas
        ref={canvasEl}
        width={maxVideoSize}
        height={maxVideoSize}
      ></canvas>
      <canvas id="offScreenCanvas"
        width={maxVideoSize}
        height={maxVideoSize}
        style={{ visibility: 'hidden' }}
      ></canvas>
    </div>
  )
}

export default Home;


