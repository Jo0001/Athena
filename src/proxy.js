import {fetchJSON} from "./util";

/**
 * Detect how many builds a proxy is behind
 * @param platform platform name
 * @param platformString the raw platform string
 * @returns {Promise<number>} number of builds behind, -1 for unknown platform, 999 for whole mc version behind
 */
async function proxyDifferenceRaw(platform, platformString) {
    platform = platform.toLowerCase();
    let tmp = platformString.split(":");
    let currentBuild = tmp[tmp.length - 1];
    if (platform === "bungeecord") {
        return (await getProxyBuild(platform)).id - currentBuild;
    } else if (platform === "waterfall") {
        let waterVersionJSON = await fetchJSON("https://api.papermc.io/v2/projects/waterfall");
        let latestMC = waterVersionJSON.versions.at(-1);
        if (!platformString.includes(latestMC)) {
            return 999;
        }
        let response = await getProxyBuild(platform, latestMC);
        return response.builds[response.builds.length - 1] - currentBuild;
    } else if (platform === "velocity") {
        let veloVersionJSON = await fetchJSON("https://api.papermc.io/v2/projects/velocity");
        let veloVersion = veloVersionJSON.versions.at(-1);
        let response = await getProxyBuild(platform, veloVersion);
        currentBuild = platformString.split("-b")[1].replace(")", "");
        return response.builds[response.builds.length - 1] - currentBuild;
    }
    return -1;
}

export async function proxyDifference(platform, platformString) {
    return new Response(await proxyDifferenceRaw(platform, platformString), {
        status: 200,
        headers: {'Access-Control-Allow-Origin': '*'}
    });

}

export async function proxyVersions() {
    let bungee = await getProxyBuild("bungeecord");
    let waterVersionJSON = (await fetchJSON("https://api.papermc.io/v2/projects/waterfall")).versions.at(-1);
    let waterfall = await getProxyBuild("waterfall", waterVersionJSON);
    let veloVersionJSON = (await fetchJSON("https://api.papermc.io/v2/projects/velocity")).versions.at(-1);
    let velocity = await getProxyBuild("velocity", veloVersionJSON);
    let data = {
        "bungeecord": {"build": bungee.id},
        "waterfall": {"build": waterfall.builds.at(-1), "version": waterfall.version},
        "velocity": {"build": velocity.builds.at(-1), "version": velocity.version},

    }
    return new Response(JSON.stringify(data), {
        headers: {
            'content-type': 'application/json;charset=UTF-8',
            'Access-Control-Allow-Origin': '*'
        }
    });

}

async function getProxyBuild(proxy, version) {
    if (proxy === "bungeecord") {
        return await fetchJSON("https://ci.md-5.net/job/BungeeCord/lastSuccessfulBuild/api/json?tree=id");
    } else {
        return await fetchJSON("https://api.papermc.io/v2/projects/" + proxy + "/versions/" + version);
    }
}
