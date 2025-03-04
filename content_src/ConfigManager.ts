import {getBrowserAPI} from "./getBrowserAPI.js";

type Corner = "tl" | "tr" | "bl" | "br"
class ConfigManagerClass {
    #data: {intervalMin: number, intervalMax: number, autoPause: boolean, autoReaction: boolean, scale: number, corner: Corner, horizontal: boolean, vertical: boolean} = {
        intervalMin: 30,
        intervalMax: 300,
        autoPause: false,
        autoReaction: true,
        scale: 50,
        corner: "br",
        horizontal: false,
        vertical: false
    }
    #ready = false;
    events = new EventTarget();

    get intervalMin() {return this.#data.intervalMin}
    get intervalMax() {return this.#data.intervalMax}
    get autoPause() {return this.#data.autoPause}
    get autoReaction() {return this.#data.autoReaction}
    get scale() {return this.#data.scale}
    get corner() {return this.#data.corner}
    get horizontal() {return this.#data.horizontal}
    get vertical() {return this.#data.vertical}

    set intervalMin(value: number) {this.#data.intervalMin = value; this.#saveConfig()}
    set intervalMax(value: number) {this.#data.intervalMax = value; this.#saveConfig()}
    set autoPause(value: boolean) {this.#data.autoPause = value; this.#saveConfig()}
    set autoReaction(value: boolean) {this.#data.autoReaction = value; this.#saveConfig()}
    set scale(value: number) {this.#data.scale = value; this.#saveConfig()}
    set corner(value: Corner) {this.#data.corner = value; this.#saveConfig()}
    set horizontal(value: boolean) {this.#data.horizontal = value; this.#saveConfig()}
    set vertical(value: boolean) {this.#data.vertical = value; this.#saveConfig()}

    constructor() {
        // super();
        getBrowserAPI().storage.onChanged.addListener((changes: Record<string, string>, namespace: any) => {
            console.log("Config changed:", changes, namespace)
            // @ts-expect-error
            for (let key of Object.keys(changes)) this.#data[key] = changes[key].newValue
            console.log("Config changed:", this.#data)
            this.events.dispatchEvent(new Event('change'))
        })
        void this.updateConfig()
    }

    async updateConfig() {
        this.#data = await getBrowserAPI().storage.sync.get(["intervalMin", "intervalMax", "autoPause", "autoReaction", "scale", "corner", "vertical", "horizontal"])
        if (this.#data.intervalMin === undefined) this.#data.intervalMin = 30
        if (this.#data.intervalMax === undefined) this.#data.intervalMax = 300
        if (this.#data.autoPause === undefined) this.#data.autoPause = true
        if (this.#data.autoReaction === undefined) this.#data.autoReaction = true
        if (this.#data.scale === undefined) this.#data.scale = 50
        if (this.#data.corner === undefined) this.#data.corner = "br"
        if (this.#data.horizontal === undefined) this.#data.horizontal = false
        if (this.#data.vertical === undefined) this.#data.vertical = false
        console.log("Config loaded:", this.#data)
        this.#ready = true;
        this.events.dispatchEvent(new CustomEvent('ready'))
        this.#saveConfig()
    }

    waitForReady() {
        if (this.#ready) return Promise.resolve()
        return new Promise<void>((resolve) => {
            let listener = () => {
                resolve();
                this.events.removeEventListener('ready', listener)
            }
            this.events.addEventListener('ready', listener)
        })
    }

    #saveConfig() {
        getBrowserAPI().storage.local.set(this.#data);
    }
}

export const configManager = new ConfigManagerClass();
