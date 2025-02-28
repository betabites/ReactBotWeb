import {getBrowserAPI} from "./getBrowserAPI.js";

class ConfigManagerClass {
    #data: {intervalMin: number, intervalMax: number, autoPause: boolean, autoReaction: boolean, scale: number} = {
        intervalMin: 30,
        intervalMax: 300,
        autoPause: false,
        autoReaction: true,
        scale: 50
    }
    #ready = false;
    events = new EventTarget();

    get intervalMin() {return this.#data.intervalMin}
    get intervalMax() {return this.#data.intervalMax}
    get autoPause() {return this.#data.autoPause}
    get autoReaction() {return this.#data.autoReaction}
    get scale() {return this.#data.scale}

    set intervalMin(value: number) {this.#data.intervalMin = value; this.#saveConfig()}
    set intervalMax(value: number) {this.#data.intervalMax = value; this.#saveConfig()}
    set autoPause(value: boolean) {this.#data.autoPause = value; this.#saveConfig()}
    set autoReaction(value: boolean) {this.#data.autoReaction = value; this.#saveConfig()}
    set scale(value: number) {this.#data.scale = value; this.#saveConfig()}

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
        this.#data = await getBrowserAPI().storage.sync.get(["intervalMin", "intervalMax", "autoPause", "autoReaction", "scale"])
        if (this.#data.intervalMin === undefined) this.#data.intervalMin = 30
        if (this.#data.intervalMax === undefined) this.#data.intervalMax = 300
        if (this.#data.autoPause === undefined) this.#data.autoPause = false
        if (this.#data.autoReaction === undefined) this.#data.autoReaction = true
        if (this.#data.scale === undefined) this.#data.scale = 50
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
