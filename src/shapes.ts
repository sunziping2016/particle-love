export function heartShape(ctx: CanvasRenderingContext2D): void {
    const sqrt2 = Math.sqrt(2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-1, -1);
    ctx.arc(-0.5, -1.5, 0.5 * sqrt2, 0.75 * Math.PI, -0.25 * Math.PI);
    ctx.arc(0.5, -1.5, 0.5 * sqrt2, -0.75 * Math.PI, 0.25 * Math.PI);
    ctx.closePath();
}

export function circleShape(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.moveTo(1, 0);
    ctx.arc(0, 0, 1, 2 * Math.PI, 0);
    ctx.closePath();
}

export function noneShape(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
}

export function resizableRectShape(shape: () => [number, number]):
    (ctx: CanvasRenderingContext2D) => void {
    return (ctx: CanvasRenderingContext2D): void => {
      ctx.beginPath();
      const [width, height] = shape();
      ctx.rect(0, 0, width, height);
    };
}

export interface DrawShapeParameters {
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
}

export function drawShape(ctx: CanvasRenderingContext2D,
                          parameters?: DrawShapeParameters): void {
    parameters = parameters || {};
    if (!parameters.shape)
        return;
    ctx.save();
    ctx.translate(parameters.x || 0, parameters.y || 0);
    ctx.save();
    ctx.scale(parameters.scale || 1, parameters.scale || 1);
    ctx.rotate(parameters.rotate || 0);
    ctx.translate(parameters.offsetX || 0, parameters.offsetY || 0);
    parameters.shape(ctx);
    ctx.restore();
    ctx.restore();
    if (parameters.fill) {
        ctx.fillStyle = Array.isArray(parameters.fillColor)
            ? `rgba(${parameters.fillColor.join(',')})`
            : parameters.fillColor || 'black';
        ctx.fill();
    }
    if (parameters.stroke)
        ctx.strokeStyle = Array.isArray(parameters.strokeColor)
            ? `rgba(${parameters.strokeColor.join(',')})`
            : parameters.strokeColor || 'black';
        ctx.stroke();
}