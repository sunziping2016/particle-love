export default class MyCanvas {
    private mContainer: HTMLElement;
    private mCanvas: HTMLCanvasElement;
    private mScale: number;
    private mResizeEventListener: () => void;

    public constructor(container: HTMLElement | string) {
        if (typeof container === 'string') {
            const select = document.querySelector<HTMLElement>(container);
            if (select === null)
                throw new Error('Cannot find the selected element');
            container = select;
        }
        this.mContainer = container;
        this.mCanvas = document.createElement('canvas');
        this.mScale = window.devicePixelRatio;
        this.updateCanvasSize();
        this.mContainer.appendChild(this.mCanvas);
        this.mResizeEventListener = this.updateCanvasSize.bind(this);
        window.addEventListener('resize', this.mResizeEventListener);
    }

    public dispose(): void {
        window.removeEventListener('resize', this.mResizeEventListener);
        this.mContainer.removeChild(this.mCanvas);
    }

    public get width(): number {
        return this.mContainer.clientWidth;
    }
    public get height(): number {
        return this.mContainer.clientHeight;
    }
    public get scale(): number {
        return this.mScale;
    }
    public get canvas(): HTMLCanvasElement {
        return this.mCanvas;
    }

    private updateCanvasSize(): void {
        const width = this.width, height = this.height;
        this.mCanvas.style.width = `${width}px`;
        this.mCanvas.style.height = `${height}px`;
        this.mCanvas.width = Math.floor(width * this.mScale);
        this.mCanvas.height = Math.floor(height * this.mScale);
    }
}