import {fetchJSON} from "./util";

/**
 * EXPERIMENTAL- Uses CF Caching, Detect how many builds a proxy is behind
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
        let waterVersionJSON = await fetchJSON("https://api.papermc.io/v2/projects/waterfall/version_group/1.20/builds");//get build directly
        let waterVersion = waterVersionJSON.builds.at(-1).build;
        let latestMC = waterVersionJSON.builds.at(-1).version;
        console.info(latestMC)
        if (!platformString.includes(latestMC)) {
            return 999;
        }
        return waterVersion - currentBuild;
    } else if (platform === "velocity") {
        let veloVersionJSON = await fetchJSON("https://api.papermc.io/v2/projects/velocity/version_group/3.0.0/builds");//get build directly
        let veloVersion = veloVersionJSON.builds.at(-1).build;
        currentBuild = platformString.split("-b")[1].replace(")", "");//legacy format
        currentBuild = isNaN(currentBuild) ? platformString.split("-b")[2].replace(")", "") : currentBuild;
        return veloVersion - currentBuild;
    }
    return -1;
}

export async function proxyDifference_exp(platform, platformString) {
    return new Response(await proxyDifferenceRaw(platform, platformString), {
        status: 200,
        headers: {'Access-Control-Allow-Origin': '*'}
    });

}

async function getProxyBuild(proxy, version) {
    if (proxy === "bungeecord") {
        return await fetchJSON("https://ci.md-5.net/job/BungeeCord/lastSuccessfulBuild/api/json?tree=id");
    } else {
        return await fetchJSON("https://api.papermc.io/v2/projects/" + proxy + "/versions/" + version);
    }
}