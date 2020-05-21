import cloneDeep from 'lodash-es/cloneDeep';

export interface PositionData {
    x: number;
    y: number;
}

export interface ScaleData {
    scale: number;
}

export interface ShapeData {
    shape: (ctx: CanvasRenderingContext2D) => void;
}

export interface OffsetData {
    offsetX: number;
    offsetY: number;
}

export interface FillStrokeData {
    fill: boolean;
    stroke: boolean;
}

export interface RotateData {
    rotate: number;
}

export interface FillColorData {
    fillColor: [number, number, number, number] | CanvasGradient | CanvasPattern;
}

export interface StrokeColorData {
    strokeColor: [number, number, number, number] | CanvasGradient | CanvasPattern;
}

export interface Animation<T> {
    next?: Animation<T>;

    init(data: T): void;
    step(data: T, elapsedTime: number): boolean;
}

export class AnimationManager<T> {
    private animation?: Animation<T>;
    private initialized: boolean;

    public constructor() {
        this.initialized = false;
    }

    public instant(animation: Animation<T>): this {
        this.animation = animation;
        this.initialized = false;
        return this;
    }

    public queued(animation: Animation<T>): this {
        if (!this.animation) {
            this.instant(animation);
        } else {
            let prev = this.animation;
            while (prev.next) {
                prev = prev.next;
            }
            prev.next = animation;
        }
        return this;
    }

    public step(data: T, elapsedTime: number): void {
        if (!this.animation)
            return;
        if (this.initialized) {
            const done = this.animation.step(data, elapsedTime);
            if (done) {
                this.animation = this.animation.next;
                if (this.animation)
                    this.animation.init(data);
                else
                    this.initialized = false;
            }
        } else {
            this.animation.init(data);
            this.initialized = true;
        }
    }
}

// from https://gist.github.com/gre/1650294
export const EasingFunctions: {[name: string]: (t: number) => number} = {
    // no easing, no acceleration
    linear: t => t,
    // accelerating from zero velocity
    easeInQuad: t => t*t,
    // decelerating to zero velocity
    easeOutQuad: t => t*(2-t),
    // acceleration until halfway, then deceleration
    easeInOutQuad: t => t<.5 ? 2*t*t : -1+(4-2*t)*t,
    // accelerating from zero velocity
    easeInCubic: t => t*t*t,
    // decelerating to zero velocity
    easeOutCubic: t => (--t)*t*t+1,
    // acceleration until halfway, then deceleration
    easeInOutCubic: t => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1,
    // accelerating from zero velocity
    easeInQuart: t => t*t*t*t,
    // decelerating to zero velocity
    easeOutQuart: t => 1-(--t)*t*t*t,
    // acceleration until halfway, then deceleration
    easeInOutQuart: t => t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t,
    // accelerating from zero velocity
    easeInQuint: t => t*t*t*t*t,
    // decelerating to zero velocity
    easeOutQuint: t => 1+(--t)*t*t*t*t,
    // acceleration until halfway, then deceleration
    easeInOutQuint: t => t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t
};

export abstract class TimedAnimation<T> implements Animation<T> {
    public next?: Animation<T>;

    private readonly totalTime: number;
    private readonly easeFunction: (t: number) => number;
    private readonly loop: boolean;
    private t: number;

    protected startState?: T;
    protected endState: T;

    public constructor(totalTime: number,
                          endState: T,
                          startState?: T,
                          easeFunction?: (t: number) => number,
                          loop?: boolean) {
        this.totalTime = totalTime;
        this.easeFunction = easeFunction || EasingFunctions.linear;
        this.loop = loop || false;
        this.t = 0.0;
        this.startState = startState;
        this.endState = endState;
    }

    protected abstract doStep(data: T, v: number): void;

    public init(data: T): void {
        this.t = 0.0;
        if (!this.startState) {
            this.startState = cloneDeep(data);
        }
    }
    public step(data: T, elapsedTime: number): boolean {
        if (!this.startState)
            throw new Error('Called without initialization');
        this.t += elapsedTime / this.totalTime;
        if (this.t >= 1.0) {
            if (this.loop && !this.next) {
                const temp = this.startState;
                this.startState = this.endState;
                this.endState = temp;
                this.t = 0.0;
            } else {
                this.t = 1.0;
            }
        }
        const v = this.easeFunction(this.t);
        this.doStep(data, v);
        return this.t == 1.0;
    }

}

export abstract class CycleTimedAnimation<T> {
    public next?: Animation<T>;

    public readonly cycleTime: number;

    public constructor(cycleTime: number) {
        this.cycleTime = cycleTime;
    }

    protected abstract doStep(data: T, p: number): void;

    public init(/* data: T */): void {
        // do nothing
    }
    public step(data: T, elapsedTime: number): boolean {
        this.doStep(data, elapsedTime / this.cycleTime);
        return !!this.next;
    }
}

export class PositionAnimation extends TimedAnimation<PositionData> {
    protected doStep(data: PositionData, v: number): void {
        if (!this.startState)
            throw new Error('Called without initialization');
        data.x = this.startState.x * (1 - v) + this.endState.x * v;
        data.y = this.startState.y * (1 - v) + this.endState.y * v;
    }
}

export class ScaleAnimation extends TimedAnimation<ScaleData> {
    protected doStep(data: ScaleData, v: number): void {
        if (!this.startState)
            throw new Error('Called without initialization');
        data.scale = this.startState.scale * (1 - v) + this.endState.scale * v;
    }
}

export class RotateAnimation extends TimedAnimation<RotateData> {
    protected doStep(data: RotateData, v: number): void {
        if (!this.startState)
            throw new Error('Called without initialization');
        data.rotate = this.startState.rotate * (1 - v) + this.endState.rotate * v;
    }
}

const CYCLE_ANGLE = 2 * Math.PI;

export class CycledRotateAnimation extends CycleTimedAnimation<RotateData> {
    private clockwise: boolean;
    
    public constructor(cycleTime: number, clockwise?: boolean) {
        super(cycleTime);
        this.clockwise = clockwise || false;
    }
    
    protected doStep(data: RotateData, p: number): void {
        if (this.clockwise) {
            data.rotate += CYCLE_ANGLE * p;
            if (data.rotate >= CYCLE_ANGLE)
                data.rotate -= CYCLE_ANGLE;
        } else {
            data.rotate -= CYCLE_ANGLE * p;
            if (data.rotate <= -CYCLE_ANGLE)
                data.rotate += CYCLE_ANGLE;
        }
    }
}

// from https://stackoverflow.com/questions/22607043/color-gradient-algorithm
export function inverseSRGBCompanding(color: [number, number, number]): [number, number, number] {
    let r = color[0] / 255;
    let g = color[1] / 255;
    let b = color[2] / 255;
    r = r > 0.04045 ? Math.pow((r+0.055)/1.055, 2.4) : r = r / 12.92;
    g = g > 0.04045 ? Math.pow((g+0.055)/1.055, 2.4) : g = g / 12.92;
    b = b > 0.04045 ? Math.pow((b+0.055)/1.055, 2.4) : b = b / 12.92;
    return [r * 255, g * 255, b * 255];
}

export function SRGBCompanding(color: [number, number, number]): [number, number, number] {
    let r = color[0] / 255;
    let g = color[1] / 255;
    let b = color[2] / 255;
    r = r > 0.0031308 ? 1.055*Math.pow(r, 1/2.4)-0.055 : r = r * 12.92;
    g = g > 0.0031308 ? 1.055*Math.pow(g, 1/2.4)-0.055 : g = g * 12.92;
    b = b > 0.0031308 ? 1.055*Math.pow(b, 1/2.4)-0.055 : b = b * 12.92;
    return [r * 255, g * 255, b * 255];
}

export function colorMix(c1: [number, number, number, number],
                         c2: [number, number, number, number],
                         mix: number): [number, number, number, number] {
    const srgb1 = inverseSRGBCompanding([c1[0], c1[1], c1[2]]);
    const srgb2 = inverseSRGBCompanding([c2[0], c2[1], c2[2]]);
    const mixed: [number, number, number] = [0, 0, 0];
    mixed[0] = srgb1[0]*(1-mix) + srgb2[0]*mix;
    mixed[1] = srgb1[1]*(1-mix) + srgb2[1]*mix;
    mixed[2] = srgb1[2]*(1-mix) + srgb2[2]*mix;
    const result = SRGBCompanding(mixed);
    return [result[0], result[1], result[2], c1[3]*(1-mix) + c2[3]*mix];
}

export class FillColorAnimation extends TimedAnimation<FillColorData> {
    protected doStep(data: FillColorData, v: number): void {
        if (!this.startState)
            throw new Error('Called without initialization');
        const startColor = this.startState.fillColor;
        const endColor = this.endState.fillColor;
        if (!Array.isArray(startColor) || !Array.isArray(endColor))
            throw new Error('Only rgba color is suppported');
        data.fillColor = colorMix(startColor, endColor, v);
    }
}

export class StrokeColorAnimation extends TimedAnimation<StrokeColorData> {
    protected doStep(data: StrokeColorData, v: number): void {
        if (!this.startState)
            throw new Error('Called without initialization');
        const startColor = this.startState.strokeColor;
        const endColor = this.endState.strokeColor;
        if (!Array.isArray(startColor) || !Array.isArray(endColor))
            throw new Error('Only rgba color is suppported');
        data.strokeColor = colorMix(startColor, endColor, v);
    }
}

export class DelayAnimation<T> implements Animation<T> {
    public next?: Animation<T>;

    private readonly delayTime: number;
    private time: number;

    public constructor(delayTime: number) {
        this.delayTime = delayTime;
        this.time = 0.0;
    }

    public init(/* data: T */): void {
        this.time = 0.0;
    }
    public step(data: T, elapsedTime: number): boolean {
        this.time += elapsedTime;
        return this.time >= this.delayTime;
    }
}

export class CallbackAnimation<T> implements Animation<T> {
    public next?: Animation<T>;

    private readonly callback: (data: T) => void;

    public constructor(callback: (data: T) => void) {
        this.callback = callback;
    }
    public init(data: T): void {
        this.callback(data);
    }
    public step(/* data: T, elapsedTime: number */): boolean {
        return true;
    }
}
