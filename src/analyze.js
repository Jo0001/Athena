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
        }, missing_viabackwards: {
            message: "ViaBackwards is missing. Please install it, too. Check https://viaversion.com/setup for more information",
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
        limbo_warn: {
            message: "Limbo is not supported, move Via* to the backend servers instead.",
            type: types.other_plugin
        },
        invalid_entity: {
            message: "You have a plugin sending invalid entity metadata/metadata for an entity or text display.",
            type: types.other_plugin
        },
        outdated_proxy: {message: "Make sure your proxy is up to date", type: types.platform},
        missing_public_key: {
            message: "Missing profile public key see https://gist.github.com/Jo0001/4d14eb4d3ae51b11eb90ba3296c8095b for details ",
            type: types.platform
        },
        outdated_api: {
            message: "A (very old) plugin is using the outdated ViaVersion API, the plugin author has to adopt to the new one",
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
            message: "Please only install Via* plugins on either Velocity/Bungee OR backend servers (e.g. Spigot / Paper). We recommend backend servers because it will give ViaVersion more information and a better experience",
            type: types.viaversion
        },
        mixed_via: {
            message: "Make sure ViaVersion (and ViaBackwards/ViaRewind) are on the same up-to-date release",
            type: types.viaversion
        },
        error_unsupported: {
            message: "We strongly advise against using software to mess with message signing. We will not provide support in case you encounter issues possibly related to this software!",
            type: types.other
        },
        interactivechat: {message: "Update or remove the InteractiveChat plugin", type: types.other_plugin},
        modelengine_warn: {message: "ModelEngine does not work properly with ViaVersion", type: types.other_plugin},
        mythic_warn: {message: "MythicLib (MMOLib) does not work properly with ViaVersion", type: types.other_plugin},
        dump_reupload: {message: "Do not reupload the dump", type: types.other},
        tab_update: {message: "Update Tab", type: types.other_plugin},
        bad_packetevents: {
            message: "The library 'packetevents' in one of your plugins is doing something dumb, this is not ViaVersions fault! See https://gist.github.com/Jo0001/8b02e2734ef4ae36fba23fb89320a50d for help",
            type: types.other_plugin
        },
        old_java: {
            message: "You need at least java 17 or special java 8 ViaVersion builds (not recommend), see https://github.com/ViaVersion/ViaVersion/wiki/Java-Requirements",
            type: types.viaversion
        },
        via_bungee_waterfall: {
            message: "For Bungee/Waterfall you either need to move Via* to all backend servers or just use Velocity",
            type: types.viaversion
        },
        viaversion_outdated: {
            message: "Please update the ViaVersion plugin to its latest version",
            type: types.viaversion
        },
        flamecord_warn: {
            message: "Flamecord is not supported. Either use Velocity or install Via on all backend servers",
            type: types.platform
        },
        unsupported_spigotversion: {
            message: "Use Spigot 1.8.8+ (versions below are not supported)",
            type: types.platform
        },
        librelogin_warn: {message: "LibreLogin is unsupported", type: types.other_plugin},
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
        string: "org.bukkit.plugin.UnknownDependencyException: ViaVersion",
        solution: "missing_viaversion"
    }, {
        string: "org.bukkit.plugin.UnknownDependencyException: Unknown/missing dependency plugins: [ViaVersion]",
        solution: "missing_viaversion"
    }, {
        string: "org.bukkit.plugin.UnknownDependencyException: ViaBackwards",
        solution: "missing_viabackwards"
    }, {
        string: "org.bukkit.plugin.UnknownDependencyException: Unknown/missing dependency plugins: [ViaBackwards]",
        solution: "missing_viabackwards"
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
        string: "io.lumine.mythic.lib",
        solution: "mythic_warn"
    }, {
        string: "at org.magmaf",
        solution: "unsupported_platform_magma"
    }, {
        string: "implementationVersion",
        solution: "dump_reupload"
    }, {
        string: "ViaVersion returned unknown protocol version",
        solution: "tab_update"
    }, {
        string: "Unable to grab ViaVersion client version for player!",
        solution: "bad_packetevents"
    }, {
        string: "com/viaversion/viaversion/ViaVersionPlugin has been compiled by a more recent version of the Java Runtime",
        solution: "old_java"
    }, {
        string: "Error loading plugin ViaVersion\n" +
            "java.lang.NoClassDefFoundError: org/bukkit/plugin/java/JavaPlugin",
        solution: "via_bungee_waterfall"
    }, {
        string: "java.lang.NoClassDefFoundError: com/viaversion/viaversion/api/platform/ViaServerProxyPlatform",
        solution: "via_bungee_waterfall"
    }, {
        string: "[WARNING] Error loading plugin ViaBackwards\n" +
            "java.lang.NoClassDefFoundError: org/bukkit/plugin/java/JavaPlugin",
        solution: "via_bungee_waterfall"
    }, {
        string: "[WARNING] Error loading plugin ViaRewind\n" +
            "java.lang.NoClassDefFoundError: org/bukkit/plugin/java/JavaPlugin",
        solution: "via_bungee_waterfall"
    }, {
        string: "protocols.base.BaseProtocol",
        solution: "viaversion_outdated"
    }, {
        string: "[main/INFO]: Enabled FlameCord version",
        solution: "flamecord_warn"
    }, {
        string: "[ViaVersion] ViaVersion failed to get the server protocol!\n" +
            "java.lang.ClassNotFoundException: net.minecraft.network.protocol.status.ServerPing$ServerData",
        solution: "unsupported_spigotversion"
    }, {
        string: "net.md_5.bungee.util.QuietException: Unexpected packet received during ",
        solution: "bungee_bug"
    }, {
        string: " [Netty epoll Worker #1/INFO] [limboapi]:",
        solution: "limbo_warn"
    }, {
        string: "[main/INFO] [limboapi]:",
        solution: "limbo_warn"
    }, {
        string: "[viaversion]: ERROR IN ClientboundBaseProtocol1_7 IN REMAP OF LOGIN_FINISHED (0x02)",
        solution: "limbo_warn"
    }, {
        string: "Packet Type: LOGIN_FINISHED, Index: 1, Type: UUIDType, Data: [], Packet ID: 2, Source 0: com.viaversion",
        solution: "limbo_warn"
    }, {
        string: "java.lang.NullPointerException: null\n" +
            "        at com.viaversion.viaversion.bukkit.providers.BukkitViaMovementTransmitter.sendPlayer",
        solution: "viaversion_outdated"
    }, {
        string: "for ViaVersion v5.2.0 generated an exception",
        solution: "viaversion_outdated"
    }, {
        string: "for ViaVersion v5.3.0 generated an exception",
        solution: "viaversion_outdated"
    }, {
        string: "for ViaVersion v5.3.2 generated an exception",
        solution: "viaversion_outdated"
    }, {
        string: "java.lang.NoSuchFieldError: Class com.viaversion.viaversion.api.",
        solution: "viaversion_outdated"
    }, {
        string: "[ViaVersion] Error initializing plugin",
        solution: "viaversion_outdated"
    }, {
        string: "com.viaversion.viaversion.rewriter.EntityRewriter.handleEntityData",
        solution: "invalid_entity"
    }, {
        string: "An error occurred in entity data handler EntityPacketRewriter",
        solution: "invalid_entity"
    }, {
        string: "[viaversion]: ERROR IN ClientboundBaseProtocol1_7 IN REMAP OF LOGIN_FINISHED (0x02)",
        solution: "librelogin_warn"
    }, {
        string: "INFO] [librelogin]: Loading libraries...",
        solution: "librelogin_warn"
    }];


    let detections = [];
    let tags = [];
    for (const error of errors) {
        if (data.indexOf(error.string) !== -1) {
            if (tags.indexOf(error.solution) !== -1) {//avoid duplicates
                continue;
            }
            tags.push(error.solution);
            solutions[error.solution].tag = error.solution;
            detections.push(solutions[error.solution]);
        }
    }

    const bungee = ["net.md_5.bungee.", "[INFORMATION] Enabled BungeeCord version git:", "<-> InitialHandler has connected"];
    const velocity = ["com.velocitypowered.proxy.", "INFO]: Booting up Velocity", "INFO]: [connected player]"];
    const paper_spigot = ["io.papermc.paper.", "org.bukkit.plugin.", "This server is running Paper version", ".jar:git-Spigot"];
    const fabric_forge = ["net.fabricmc.", " net.minecraftforge.", "Forge Mod Loader version"];
    const viaproxy = ["net.raphimc.viaproxy.", "(ViaProxy) Initializing ViaProxy"];
    const client = ["---- Minecraft Network Protocol Error Report ----", "A detailed walkthrough of the error, its code path and all known details is as follows:"];
    let platformType = "unknown";
    let isProxy = false;
    let isBungee = bungee.some(platformHint => data.includes(platformHint));

    if (paper_spigot.some(platformHint => data.includes(platformHint)) && !isBungee) {
        platformType = "Paper/Spigot";
    } else if (velocity.some(platformHint => data.includes(platformHint))) {
        platformType = "Velocity";
        isProxy = true;
    } else if (isBungee) {
        platformType = "Bungeecord";
        isProxy = true;
    } else if (client.some(platformHint => data.includes(platformHint))) {
        platformType = "Client (vanilla or modded)";
    } else if (fabric_forge.some(platformHint => data.includes(platformHint))) {
        platformType = "Fabric/Forge";
    } else if (viaproxy.some(platformHint => data.includes(platformHint))) {
        platformType = "ViaProxy";
        isProxy = true;
    }

    let containsVia = data.includes("com.viaversion.") || data.includes("com/viaversion/viaversion/") || data.includes("[ViaVersion]") || data.includes("[ViaBackwards]") || data.includes("[ViaRewind]");
    return new Response(JSON.stringify({
        containsVia: containsVia,
        platform: {type: platformType, isProxy: isProxy},
        detections: detections,
        tags: tags
    }), {
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
        //Handle already raw api Urls
        if (url.pathname !== "/" && Object.values(mappings).some(function (key) {
            const u = new URL(key);
            return u.origin === host
        })) {
            return raw;
        }
    } catch (e) {
        throw {name: "INVALID_URL", detail: raw + " is invalid", code: 422};
    }
    throw {name: "UNKNOWN_PASTE-SITE", detail: "Don't know how to handle " + host, code: 422};
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