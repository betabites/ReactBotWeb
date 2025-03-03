import {videosOriginal} from "./videosOriginal.js";
import {configManager} from "./ConfigManager.js";
import {getBrowserAPI} from "./getBrowserAPI.js";

async function adjustVolume(
    element: HTMLMediaElement,
    newVolume: number,
    {
        duration = 1000,
        easing = swing,
        interval = 13,
    }: {
        duration?: number,
        easing?: typeof swing,
        interval?: number,
    } = {},
): Promise<void> {
    const originalVolume = element.volume;
    const delta = newVolume - originalVolume;

    if (!delta || !duration || !easing || !interval) {
        element.volume = newVolume;
        return Promise.resolve();
    }

    const ticks = Math.floor(duration / interval);
    let tick = 1;

    return new Promise(resolve => {
        const timer = setInterval(() => {
            element.volume = originalVolume + (
                easing(tick / ticks) * delta
            );

            if (++tick === ticks + 1) {
                clearInterval(timer);
                resolve();
            }
        }, interval);
    });
}

function swing(p: number) {
    return 0.5 - Math.cos(p * Math.PI) / 2;
}

type YouTubeVideoElement = {element: HTMLVideoElement, originalVolume: number}

function getYouTubeVideoElements() {
    let elements: YouTubeVideoElement[] = []
    for (let element of document.querySelectorAll(".video-stream.html5-main-video")) {
        let _element = element as HTMLVideoElement
        if (_element.paused) continue
        console.log(_element)
        elements.push({
            originalVolume: _element.volume,
            element: _element
        })
        // _element.volume = .1
    }
    return elements
}

function lowerYouTubeVolume(elements: YouTubeVideoElement[]) {
    return Promise.all(elements.map(async (element) => {
        await adjustVolume(element.element, .1, {duration: 1000})
    }))
}

function resetYouTubeVolume(elements: YouTubeVideoElement[]) {
    return Promise.all(elements.map(async (element) => {
        await adjustVolume(element.element, element.originalVolume, {duration: 1000})
    }))
}

function pauseYouTubeVideos(elements: YouTubeVideoElement[]) {
    elements.forEach((element) => {
        element.element.pause()
    })
}

function playYouTubeVideos(elements: YouTubeVideoElement[]) {
    elements.forEach((element) => {
        element.element.play()
    })
}

export class ReactBot {
    wrapper = document.createElement("div")
    currentVideo = document.createElement("video")
    idleVideo = document.createElement("video")
    currentSource = document.createElement("source")

    #videos = shuffleArray(videosOriginal)
    #nextReactionTimeout: NodeJS.Timeout | null = null
    isReacting: boolean = false;

    constructor() {
        this.wrapper.classList.add("reactBotWrapper")
        document.body.appendChild(this.wrapper)
        this.loadNextVideo(false)
        configManager.waitForReady().then(() => {
            if (configManager.autoReaction) this.configureNextAutoReaction()
            this.updateStyles()
        })
        configManager.events.addEventListener("change", () => {
            if (!configManager.autoReaction && this.#nextReactionTimeout) {
                clearTimeout(this.#nextReactionTimeout)
                this.#nextReactionTimeout = null
            }
            else if (configManager.autoReaction && !this.#nextReactionTimeout) this.configureNextAutoReaction()
            this.updateStyles()
        })

        document.addEventListener("keydown", (event) => {
            if (event.shiftKey && event.key === "F6") {
                event.preventDefault()
                this.loadNextVideo()
            }
        })

        // Configure the idle animation
        this.idleVideo.src = getBrowserAPI().runtime.getURL(`GrabBag/Idle.webm`)
        this.idleVideo.loop = true
        this.idleVideo.autoplay = true
        this.idleVideo.muted = true
        this.idleVideo.playsInline = true
        this.idleVideo.classList.add("reactBotIdleVideo")
        this.wrapper.appendChild(this.idleVideo)
        this.currentVideo.style.display = "none";
    }

    updateStyles() {
        let size = (configManager.scale / 50) * 300
        this.wrapper.style.width = `${size}px`
        this.wrapper.style.height = `${size}px`

        // Position ReactBot
        if (configManager.corner[0] === "t") {
            this.wrapper.classList.remove("bottom")
            this.wrapper.classList.add("top")
        }
        if (configManager.corner[0] === "b") {
            this.wrapper.classList.remove("top")
            this.wrapper.classList.add("bottom")
        }
        if (configManager.corner[1] === "l") {
            this.wrapper.classList.remove("right")
            this.wrapper.classList.add("left")
        }
        if (configManager.corner[1] === "r") {
            this.wrapper.classList.remove("left")
            this.wrapper.classList.add("right")
        }

        // Transformations
        if (configManager.horizontal) this.wrapper.classList.add("flipHorizontal")
        else this.wrapper.classList.remove("flipHorizontal")
        if (configManager.vertical) this.wrapper.classList.add("flipVertical")
        else this.wrapper.classList.remove("flipVertical")
    }

    configureNextAutoReaction() {
        this.isReacting = false
        if (!configManager.autoReaction) {
            console.log("config configureNextAutoReaction", configManager.autoReaction)
            return
        }
        let ms = getRandomTimeout()
        console.log(`next reaction in ${ms / 1000} seconds`)
        if (this.#nextReactionTimeout) clearTimeout(this.#nextReactionTimeout)
        this.#nextReactionTimeout = setTimeout(() => this.loadNextVideo(), ms);

        // Return to idle animation
        this.currentVideo.style.display = "none";
        this.idleVideo.style.display = "";
    }

    loadNextVideo(play = true) {
        if (this.isReacting) return
        this.isReacting = true
        console.log("config loadNextVideo", play)

        if (this.#nextReactionTimeout !== null) {
            clearTimeout(this.#nextReactionTimeout)
            this.#nextReactionTimeout = null
        }

        let newSource = document.createElement("source")
        newSource.src = getBrowserAPI().runtime.getURL(`GrabBag/${this.getRandomVideo()}`)
        newSource.type = "video/webm"
        newSource.onerror = () => this.loadNextVideo(play)
        newSource.oncanplay = () => {
            this.currentSource.remove()
            this.currentSource = newSource
        }

        let newVideo = document.createElement("video")
        newVideo.appendChild(newSource)
        newVideo.classList.add("reactBotVideo")
        newVideo.autoplay = false
        newVideo.oncanplay = () => {
            this.currentVideo.remove()
            this.currentVideo = newVideo
            if (!play) {
                // Only play the first frame so that the video is at least visible
                // newVideo.currentTime += 10
                this.currentVideo.style.display = "none"
                this.wrapper.appendChild(this.currentVideo)
                return
            }

            let videoElements = getYouTubeVideoElements()
            // if (videoElements.length === 0) {
            //     // There are no valid video elements loaded, so do nothing
            //     this.configureNextAutoReaction()
            //     return
            // }

            console.log("AUTOPAUSE", configManager.autoPause)
            this.idleVideo.style.display = "none";
            if (configManager.autoPause) {
                pauseYouTubeVideos(videoElements)
                newVideo.onended = async () => {
                    playYouTubeVideos(videoElements)
                    this.configureNextAutoReaction()
                };
                newVideo.play().catch(e => {console.error(e); this.configureNextAutoReaction()});
            }
            else {
                let lower = lowerYouTubeVolume(videoElements)
                newVideo.onended = async () => {
                    await lower;
                    await resetYouTubeVolume(videoElements)
                    this.configureNextAutoReaction()
                };
                void newVideo.play().catch(e => {console.error(e); this.configureNextAutoReaction()});;
            }

            this.wrapper.appendChild(this.currentVideo)
            this.currentVideo.play().catch(e => {console.error(e); this.configureNextAutoReaction()});
        }

        this.currentSource.remove()

        newVideo.appendChild(this.currentSource)
        this.currentSource.src = this.getRandomVideo()
    }

    getRandomVideo() {
        let video = this.#videos.pop()
        // console.log(video, videos, videosOriginal)
        if (video === undefined) {
            this.#videos = shuffleArray(videosOriginal)
            video = this.#videos.pop()
        }
        return video
    }
}

function shuffleArray(array: any[]) {
    return [...array].sort(() => Math.random() - 0.5);
}

function getRandomTimeout() {
    let min = (configManager.intervalMin * 1000)
    let max = (configManager.intervalMax * 1000)
    return Math.floor(Math.random() * (max - min) + min)
}
