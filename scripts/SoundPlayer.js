export class SoundPlayer {
    static LID_CLICK = new Audio('./resources/audio/lid-click.mp3');
    static LID_SLIDE = new Audio('./resources/audio/lid-slide.mp3');
    static lastSlidePlay = 0;

    static playLidClick() {
        this.LID_CLICK.cloneNode().play().catch(console.error);
    }

    static playLidSlide() {
        this.LID_SLIDE.play().catch(console.error);
    }
}