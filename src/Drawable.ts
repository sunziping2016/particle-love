import {
    AnimationManager, FillColorData, FillStrokeData, OffsetData,
    PositionData, RotateData,
    ScaleData,
    ShapeData, StrokeColorData
} from './animations';
import {drawShape, noneShape} from './shapes';

export type ParticleStateType = ShapeData & PositionData & ScaleData &
    OffsetData & RotateData & FillStrokeData & FillColorData & StrokeColorData;

export default class Drawable {
    public state: ParticleStateType;
    public positionAnimation: AnimationManager<PositionData>;
    public scaleAnimation: AnimationManager<ScaleData>;
    public rotateAnimation: AnimationManager<RotateData>;
    public fillColorAnimation: AnimationManager<FillColorData>;
    public strokeColorAnimation: AnimationManager<StrokeColorData>;

    public constructor(state: {
        shape?: (ctx: CanvasRenderingContext2D) => void;
        x?: number;
        y?: number;
        scale?: number;
        offsetX?: number;
        offsetY?: number;
        rotate?: number;
        fill?: boolean;
        stroke?: boolean;
        fillColor?: [number, number, number, number] | CanvasGradient | CanvasPattern;
        strokeColor?: [number, number, number, number] | CanvasGradient | CanvasPattern;
    }) {
        this.state = Object.assign({
            shape: noneShape,
            x: 0,
            y: 0,
            scale: 1,
            offsetX: 0,
            offsetY: 0,
            rotate: 0,
            fill: false,
            stroke: false,
            fillColor: [0, 0, 0, 1],
            strokeColor: [0, 0, 0, 1],
        }, state);
        this.positionAnimation = new AnimationManager<PositionData>();
        this.scaleAnimation = new AnimationManager<ScaleData>();
        this.rotateAnimation = new AnimationManager<RotateData>();
        this.fillColorAnimation = new AnimationManager<FillColorData>();
        this.strokeColorAnimation = new AnimationManager<StrokeColorData>();
    }

    public step(elapsedTime: number): void {
        this.positionAnimation.step(this.state, elapsedTime);
        this.scaleAnimation.step(this.state, elapsedTime);
        this.rotateAnimation.step(this.state, elapsedTime);
        this.fillColorAnimation.step(this.state, elapsedTime);
        this.strokeColorAnimation.step(this.state, elapsedTime);
    }

    public render(ctx: CanvasRenderingContext2D): void {
        drawShape(ctx, this.state);
    }
}