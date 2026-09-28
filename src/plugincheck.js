const warning = [{
    name: "TAB",
    message: "Make sure to have the latest TAB version",
    detections: ["me.neznamy.tab."]
}, {
    name: "packetevents",
    message: "packetevents is known to cause issues. Make sure you run the latest version",
    detections: ["io.github.retrooper.packetevents.", "com.github.retrooper.packetevents."]
}];
const unsupported = [{
    name: "LimboAPI",
    message: "LimboAPI is not supported",
    detections: ["net.elytrium.limboapi.", "[main/INFO] [limboapi]"]
}, {
    name: "ModelEngine",
    message: "ModelEngine is not supported",
    detections: ["com.ticxo.modelengine."]
}, {
    name: "ItemsAdder",
    message: "ItemsAdder is not supported",
    detections: ["dev.lone.itemsadder."]
}, {
    name: "MythicLib",
    message: "MythicLib (MMOLib) is not supported",
    detections: ["io.lumine.mythic."]
}, {
    name: "Nexo",
    message: "Nexo is not supported",
    detections: ["com.nexomc.nexo."]
}, {
    name: "Oraxen",
    message: "Oraxen is not supported",
    detections: ["io.th0rgal.oraxen."]
}, {
    name: "LibreLogin",
    message: "LibreLogin is not supported. Move ViaVersion to the backend servers or remove LibreLogin.",
    detections: ["xyz.kyngs.librelogin.", "INFO] [librelogin]:", "Loaded plugin librelogin"]
}];

export function _check(data) {
    const detectedWarnings = warning.filter(plugin =>
        plugin.detections.some(detection => data.includes(detection))
    ).map(({name, message}) => ({name, message}));
    const detectedUnsupported = unsupported.filter(plugin =>
        plugin.detections.some(detection => data.includes(detection))
    ).map(({name, message}) => ({name, message}));

    return {detectedWarnings: detectedWarnings, detectedUnsupported: detectedUnsupported}
}

export function check(data, env) {
    return new Response(JSON.stringify(_check(data)), {
        headers: {
            'content-type': 'application/json;charset=UTF-8',
            'Access-Control-Allow-Origin': '*'
        }
    })
}
