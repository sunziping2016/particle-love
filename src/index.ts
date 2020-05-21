import './style.sass';
import MyCanvas from './MyCanvas';
import {heartShape, resizableRectShape} from './shapes';
import Drawable from './Drawable';
import {
    CallbackAnimation,
    CycledRotateAnimation, DelayAnimation,
    EasingFunctions, FillColorAnimation,
    PositionAnimation,
    RotateAnimation,
    ScaleAnimation
} from './animations';

const STEP_TIME = 20; // in millisecond

function main(): void {
    let lastTime: number = Date.now();
    const canvas = new MyCanvas('#app');
    const background = new Drawable({
        shape: resizableRectShape(() => [canvas.width, canvas.height]),
        fill: true,
    });
    const particle = new Drawable({
        x: canvas.width / 2,
        y: canvas.height / 2,
        scale: 10,
        shape: heartShape,
        offsetY: 1,
        fill: true,
        fillColor: [0, 255, 0, 1]
    });
    particle.positionAnimation.queued(
        new PositionAnimation(1000, {
            x: canvas.width,
            y: canvas.height / 2,
        }, undefined, EasingFunctions.easeInOutCubic, true)
    );
    particle.scaleAnimation.queued(
        new DelayAnimation(3000)
    ).queued(
        new CallbackAnimation(() => console.log(123))
    ).queued(
        new ScaleAnimation(200, {
            scale: 5
        }, undefined, undefined, true)
    );
    particle.rotateAnimation.queued(
        // new RotateAnimation(1000, {
        //     rotate: -Math.PI / 2
        // }, {
        //     rotate: Math.PI / 2
        // }, undefined, true)
        new CycledRotateAnimation(10000, true)
    );
    particle.fillColorAnimation.queued(
        new FillColorAnimation(3000, {fillColor: [0, 0, 255, 1]}, undefined, undefined, true)
    );
    setTimeout(() => {
        particle.rotateAnimation.queued(
            new RotateAnimation(1000, {
                rotate: -Math.PI / 2
            }, {
                rotate: Math.PI / 2
            }, undefined, true)
        );
    }, 5000);
    const step = (): void => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - lastTime;
        const ctx = canvas.canvas.getContext('2d');
        if (ctx === null)
            throw new Error('unable to get 2d canvas context');
        ctx.save();
        ctx.scale(canvas.scale, canvas.scale);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.step(elapsedTime);
        particle.step(elapsedTime);
        background.render(ctx);
        particle.render(ctx);
        ctx.restore();
        lastTime = currentTime;
    };
    setInterval(step, STEP_TIME);
    window.addEventListener('resize', step);
}

main();
