import { stringify } from "querystring";

class CV {
    _status! : { [ msg: string] : [string, MessageEvent | ErrorEvent | null ] };
    worker! : Worker;
    offContext : CanvasRenderingContext2D | null = null;

    /**
     * We will use this method privately to communicate with the worker and
     * return a promise with the result of the event. This way we can call
     * the worker asynchronously.
     */
    _dispatch( event : { msg: string, payload : object | null } ) : Promise<MessageEvent> {
      const { msg } = event
      this._status[msg] = ['loading', null];

      console.log( `_dispatch ${event} postMessage`);
      this.worker!.postMessage(event);

      return new Promise((res, rej) => {
        let interval = setInterval(() => {
          const status = this._status[msg]
          if (status[0] === 'done') res(status[1] as MessageEvent );
          if (status[0] === 'error') rej(status[1] as ErrorEvent );
          if (status[0] !== 'loading') {
            delete this._status[msg]
            clearInterval(interval)
          }
        }, 50)
      })
    }
  
    /**
     * First, we will load the worker and capture the onmessage
     * and onerror events to always know the status of the event
     * we have triggered.
     *
     * Then, we are going to call the 'load' event, as we've just
     * implemented it so that the worker can capture it.
     */
    load() {
      this._status = { };
      this.worker = new Worker('/js/opencv_js.worker.js'); // load worker
  
      // Capture events and save [status, event] inside the _status object
      this.worker.onmessage = (e) => (this._status[e.data.msg] = ['done', e]);
      this.worker.onerror = (e) => (this._status[e.message] = ['error', e]);

      
      //if(!ctx) fallbackToWebGL(bitmap);

      return this._dispatch({ msg: 'load', payload: null });
    }

    getOffscreenCanvasContext( ) : CanvasRenderingContext2D | null {
      let offCanvas = document.querySelector( '#offScreenCanvas' ) as HTMLCanvasElement;
      
      console.log( `load: offCanvas ${offCanvas}` );
      if ( offCanvas !== null ) {
        this.offContext = offCanvas.getContext('2d');
      }
      return this.offContext
    }

    bitmapToImage( bitmap : ImageBitmap ) : ImageData | null {
      console.log( `bitmapToImage ${bitmap}`);
      let image : ImageData | null = null;
      
      let ctx = this.getOffscreenCanvasContext();

      if ( this.offContext !== null ) {
        let bm = bitmap as ImageBitmap;
        console.log( `bitmapToImage ${bm}`);
        this.offContext.drawImage( bm, 0, 0);
        image = this.offContext?.getImageData(0, 0, bitmap.width, bitmap.height);
      }
      return image!;
    }

    grayScale(bitmap : ImageBitmap) : Promise<MessageEvent> {
      console.log(`grayscale ${bitmap} ${bitmap.width}x${bitmap.height}`);
      const image = this.bitmapToImage( bitmap );
      console.log(`grayscale ${image}`);
      return this._dispatch({ msg: 'grayScale', payload: image });
    }
  }
  
  // Export the same instant everywhere
  export default new CV();