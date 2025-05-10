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
    const corner = document.getElementById("corner");
    const horizontal = document.getElementById("horizontal");
    const vertical = document.getElementById("vertical");
    if (!intervalMin || !intervalMax || !autoPause)
        throw new Error(
            "Could not find intervalMin, intervalMax or autoPause"
        )

    let data = {intervalMin: 30, intervalMax: 300, autoPause: false, scale: 50, horizontal: false, vertical: false, corner: "tl"};
    getBrowserAPI().storage.sync.get(["intervalMin", "intervalMax", "autoPause", "autoReaction", "scale", "corner", "horizontal", "vertical"]).then((values) => {
        intervalMin.value = values.intervalMin ?? 30;
        intervalMax.value = values.intervalMax ?? 300;
        autoPause.checked = values.autoPause ?? true;
        autoReaction.checked = values.autoReaction ?? true;
        scale.value = values.scale ?? 50;
        corner.value = values.corner ?? "tl";
        horizontal.checked = values.horizontal ?? false;
        vertical.checked = values.vertical ?? false;
        console.log("LOADED", values)
        data = values;
    })

    function save() {
        console.log("SAVING", data)
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
    corner.onchange = () => {
        data.corner = corner.value;
        save();
    }
    horizontal.onchange = () => {
        console.log("HORIZONTAL CHANGED")
        data.horizontal = horizontal.checked;
        save();
    }
    vertical.onchange = () => {
        data.vertical = vertical.checked;
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
