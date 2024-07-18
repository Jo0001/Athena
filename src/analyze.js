import {fetchJSON, fetchRaw} from "./util";

let mappings = {
    "https://mclo.gs": "https://api.mclo.gs/1/raw/$id",
    "https://pastebin.com": "https://pastebin.com/raw/$id",
    // "https://hastebin.com": "https://hastebin.com/raw/$id", they now require tokens
    "https://paste.md-5.net": "https://paste.md-5.net/raw/$id",
    "https://paste.gg": "https://api.paste.gg/v1/pastes/$id?full=true",
    "https://gist.github.com": "https://gist.githubusercontent.com$id/raw/",
    "https://pastes.dev": "https://api.pastes.dev/$id",
    //"https://cdn.discordapp.com": "https://cdn.discordapp.com$id" Discord doesn't allow traffic from cf workers :/
};

export function sites() {
    return new Response(JSON.stringify(Object.keys(mappings)), {
        headers: {
            'content-type': 'application/json;charset=UTF-8',
            'Access-Control-Allow-Origin': '*'
        }
    });
}

export async function analyze(data) {
    const types = {viaversion: "viaversion", other_plugin: "other_plugin", platform: "platform", other: "other"}
    let solutions = {
        missing_addon: {
            message: "ViaBackwards/ViaRewind is missing. Check https://viaversion.com/setup for more information",
            type: types.viaversion
        },
        broken_config: {
            message: "Broken config. Please delete the config.yml and restart the server",
            type: types.viaversion
        },
        proxy_limbo: {
            message: "This error is most likely caused by your proxy software being out of date, or incompatibility with another plugin like limbo, or custom client.",
            type: types.platform
        },
        invalid_entity: {
            message: "You have a plugin sending invalid entity metadata/metadata for an untracked entity.",
            type: types.other_plugin
        },
        outdated_proxy: {message: "Make sure your proxy is up to date", type: types.platform},
        missing_public_key: {
            message: "Missing profile public key see https://gist.github.com/Jo0001/4d14eb4d3ae51b11eb90ba3296c8095b for details ",
            type: types.platform
        },
        outdated_api: {
            message: "A (old) plugin is using the outdated ViaVersion API, the plugin author has to adopt to the new one",
            type: types.other_plugin
        },
        missing_viaversion: {message: "Please install ViaVersion, too", type: types.viaversion},
        corrupt_jar: {message: "You have corrupt a ViaVersion jar. Please redownload it", type: types.viaversion},
        unsupported_platform_magma: {
            message: "Magma is not supported. Use Spigot/Paper/Fabric instead",
            type: types.platform
        },
        invalid_chunkdata: {message: "A plugin e.g. Orebfuscator sends bad chunk data", type: types.other_plugin},
        port_scan: {
            message: "Some automatic 'port' scanner is scanning your server. Not ViaVersion related",
            type: types.other
        },
        broken_jar: {message: "You have a broken jar. Redownload it", type: types.viaversion},
        recipe_error: {
            message: "[1.13.1 -> 1.13] Recipe Packet remap error, see for https://github.com/ViaVersion/ViaVersion/issues/2383 details ",
            type: types.viaversion
        },
        viarewind_outdated: {message: "Make sure to use the latest ViaRewind Version", type: types.viaversion},
        bungee_bug: {message: "Bungee issue, make sure you have the latest version of it", type: types.platform},
        json_warn: {
            message: "Some plugin is sending invalid JSON. Please check your scoreboard/tablist/bossbar/custom entity name plugins and update/remove them",
            type: types.other_plugin
        },
        stack: {
            message: "Please only install Via* plugins on either Bungee OR backend servers (e.g. Spigot / Paper). We recommend backend servers because it will give ViaVersion more information and a better experience",
            type: types.viaversion
        },
        mixed_via: {
            message: "Make sure ViaVersion and its addons are on the same release, dont mix -dev builds with normal ones",
            type: types.viaversion
        },
        error_unsupported: {
            message: "We strongly advise against using software to mess with message signing. We will not provide support in case you encounter issues possibly related to this software!",
            type: types.other
        },
        interactivechat: {message: "Update or remove the InteractiveChat plugin", type: types.other_plugin},
        modelengine_warn: {message: "ModelEngine does not work properly with ViaVersion", type: types.other_plugin},
        dump_reupload: {message: "Do not reupload the dump", type: types.other},
        placeholder: {message: "placeholder", type: types.other}
    };
    let errors = [{
        string: "[ViaVersion] ViaVersion does not have any compatible versions for this server version",
        solution: "missing_addon"
    }, {
        string: "com.viaversion.viaversion.util.Config.",
        solution: "broken_config"
    }, {
        string: "Outdated server! I'm still on 1.",
        solution: "outdated_proxy"
    }, {
        string: "Source 0: com.viaversion.viaversion.protocols.base.BaseProtocol1_7$$Lambda$",
        solution: "proxy_limbo"
    }, {
        string: "[ViaVersion] An error occurred in metadata handler EntityPackets for untracked entity type",
        solution: "invalid_entity"
    }, {
        string: "Missing profile public key",
        solution: "missing_public_key"
    }, {
        string: "multiplayer.disconnect.missing_public_key",
        solution: "missing_public_key"
    }, {
        string: "java.lang.ClassNotFoundException: us.myles.ViaVersion.api.ViaVersion",
        solution: "outdated_api"
    }, {
        string: "Unknown/missing dependency plugins: [ViaVersion]",
        solution: "missing_viaversion"
    }, {
        string: "java.util.NoSuchElementException: com.viaversion.viaversion.protocols.",
        solution: "corrupt_jar"
    }, {
        string: "com.viaversion.viaversion.rewriter.commandrewriter$$Lambda$6973.0x00000008020cfa00",
        solution: "corrupt_jar"
    }, {
        string: "Packet Type: CHUNK_DATA, Type: Chunk, Index: 1, Data: [], Source 0: com.viaversion.viabackwards.protocol.protocol1_18_2to1_19.packets.BlockItemPackets1_19$$Lambda",
        solution: "invalid_chunkdata"
    }, {
        string: "Packet Type: null, Type: UUID, Index: 3, Data: [{String: cuute}, {ProfileKey: null}], Source 0: com.viaversion.viaversion.protocols.protocol",
        solution: "port_scan"
    }, {
        string: "Caused by: java.lang.IllegalStateException: zip file closed",//note this is detected for all jars not only Via* ones
        solution: "broken_jar"
    }, {
        string: "Caused by: java.util.zip.ZipException: zip END header not found",//note this is detected for all jars not only Via* ones
        solution: "broken_jar"
    }, {
        string: "java.lang.NoClassDefFoundError: com/viaversion/viaversion/api/configuration/Config",
        solution: "broken_jar"
    }, {
        string: "com.viaversion.viaversion.protocols.protocol_1_13_1to1_13.packets.InventoryPackets$$Lambda",
        solution: "recipe_error"
    }, {
        string: "de.gerrygames.viarewind.",
        solution: "viarewind_outdated"
    }, {
        string: "Non [a-z0-9_.-] character in namespace of location:",
        solution: "bungee_bug"
    }, {
        string: "com.google.gson.stream.MalformedJsonException: Use JsonReader.setLenient(true)",
        solution: "json_warn"
    }, {
        string: "Cannot get ID for packet class net.md_5.bungee.protocol.packet.LoginSuccess in phase GAME with direction TO_CLIENT",
        solution: "stack"
    }, {
        string: "java.lang.ClassNotFoundException: com.viaversion.viaversion",
        solution: "mixed_via"
    }, {
        string: "java.lang.NoSuchMethodError: 'com.viaversion",
        solution: "mixed_via"
    }, {
        string: "java.lang.NoSuchMethodError: 'void com.viaversion",
        solution: "mixed_via"
    }, {
        string: "[ViaVersion] You are using unsupported software and may encounter unforeseeable issues",
        solution: "error_unsupported"
    }, {
        string: "te: Loading NBT data",
        solution: "interactivechat"
    }, {
        string: "was larger than I expected, found",
        solution: "stack"
    }, {
        string: "was larger than I expected, found",
        solution: "outdated_proxy"
    }, {
        string: "com.ticxo.modelengine.",
        solution: "modelengine_warn"
    }, {
        string: "at org.magmaf",
        solution: "unsupported_platform_magma"
    }, {
        string: "implementationVersion",
        solution: "dump_reupload"
    }];


    let detections = [];
    let tags = [];
    for (const error of errors) {
        if (data.indexOf(error.string) !== -1) {
            tags.push(error.solution);
            solutions[error.solution].tag = error.solution;
            detections.push(solutions[error.solution]);
        }
    }
    let containsVia = data.includes("com.viaversion.") || data.includes("[ViaVersion]") || data.includes("[ViaBackwards]") || data.includes("[ViaRewind]");
    return new Response(JSON.stringify({containsVia: containsVia, detections: detections, tags: tags}), {
        headers: {
            'content-type': 'application/json;charset=UTF-8',
            'Access-Control-Allow-Origin': '*'
        }
    })
}

function getAPIUrl(raw) {

    raw = raw.trim().replaceAll(")", "").replaceAll("(", "").replaceAll(",", "")
    let host
    try {
        let url = new URL(raw);

        host = url.origin;
        if (url.pathname !== "/" && mappings.hasOwnProperty(host)) {
            if (host.includes("github") || host.includes("discordapp")) {
                return mappings[host].replace("$id", url.pathname);
            }
            return mappings[host].replace("$id", url.pathname.substring(url.pathname.lastIndexOf('/') + 1));
        }
    } catch (e) {
        throw {name: "INVALID_URL", detail: raw + " is invalid", code: 422};
    }
    throw {name: "UNKNOWN_PASTE-SITE", detail: "Don't know how to handle " + host, code: 422}; //todo handle already raw urls
}

export async function getDataFromUrl(url) {
    url = getAPIUrl(url);
    let data;
    //handle paste.gg
    if (url.startsWith("https://api.paste.gg/")) {
        data = await fetchJSON(url);
        data = data.result.files[0].content.value
    } else {
        data = await fetchRaw(url)
    }
    return data
}