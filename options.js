function getBrowserAPI() {
    // @ts-expect-error
    return typeof browser !== 'undefined' ? browser : chrome;
}

function load() {
    console.log("HERE!")
    const intervalMin = document.getElementById("interval-min");
    const intervalMax = document.getElementById("interval-max");
    const autoPause = document.getElementById("auto-pause");
    const autoReaction = document.getElementById("auto-reaction");
    const scale = document.getElementById("scale");
    if (!intervalMin || !intervalMax || !autoPause)
        throw new Error(
            "Could not find intervalMin, intervalMax or autoPause"
        )

    let data = {intervalMin: 30, intervalMax: 300, autoPause: false, scale: 50}
    getBrowserAPI().storage.sync.get(["intervalMin", "intervalMax", "autoPause", "autoReaction", "scale"]).then((values) => {
        intervalMin.value = values.intervalMin ?? 30;
        intervalMax.value = values.intervalMax ?? 300;
        autoPause.checked = values.autoPause ?? false;
        autoReaction.checked = values.autoReaction ?? true;
        scale.value = values.scale ?? 50;
        data = values;
    })

    function save() {
        getBrowserAPI().storage.sync.set(data)
    }

    intervalMin.onchange = () => {
        data.intervalMin = parseInt(intervalMin.value);
        save();
    }
    intervalMax.onchange = () => {
        data.intervalMax = parseInt(intervalMax.value);
        save();
    }
    autoPause.onchange = () => {
        data.autoPause = autoPause.checked;
        save();
    }
    autoReaction.onchange = () => {
        data.autoReaction = autoReaction.checked;
        save();
    }
    scale.onpointermove = () => {
        let num = parseInt(scale.value)
        if (data.scale === num) return
        data.scale = num;
        save();
    }
}

if (document.readyState === 'loading') {
    console.log('test');
    document.addEventListener('DOMContentLoaded', load);
} else {
    console.log('test');
    load();
}
