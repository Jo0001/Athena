import {fetchJSON} from "./util";

/**
 * Detect how many builds a proxy is behind
 * @param platform platform name
 * @param platformString the raw platform string
 * @returns {Promise<number>} number of builds behind, -1 for unknown platform
 */
async function proxyDifferenceRaw(platform, platformString) {
    platform = platform.toLowerCase();
    let tmp = platformString.split(":");
    let currentBuild = tmp[tmp.length - 1];
    if (platform === "bungeecord") {
        return (await getBungeeBuild(platform)).id - currentBuild;
    } else if (platform === "waterfall") {
        let waterVersionJSON = await fetchJSON("https://fill.papermc.io/v3/projects/waterfall/versions/1.21/builds/latest");//get build directly
        return waterVersionJSON.id - currentBuild;
    } else if (platform === "velocity") {
        let veloVersion = platformString.split(" ");
        let veloBuild = (await fetchJSON("https://fill.papermc.io/v3/projects/velocity/versions/" + veloVersion[0] + "/builds/latest")).id;
        currentBuild = platformString.split("-b")[1].replace(")", "");//legacy format
        currentBuild = isNaN(currentBuild) ? platformString.split("-b")[2].replace(")", "") : currentBuild;
        return veloBuild - currentBuild;
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
    let bungee = await getBungeeBuild("bungeecord");
    let waterVersionJSON = (await fetchJSON("https://fill.papermc.io/v3/projects/waterfall/versions")).versions[0];
    let veloVersionJSON = (await fetchJSON("https://fill.papermc.io/v3/projects/velocity/versions")).versions;//todo
    let data = {
        "bungeecord": {"build": bungee.id},
        "waterfall": {"build": waterVersionJSON.builds.at(-1), "version": waterVersionJSON.version.id},
        "velocity": [{
            "build": veloVersionJSON[0].builds.at(-1),
            "version": veloVersionJSON[0].version.id
        }, {"build": veloVersionJSON[1].builds.at(-1), "version": veloVersionJSON[1].version.id},
            {"build": veloVersionJSON[2].builds.at(-1), "version": veloVersionJSON[2].version.id}],

    }
    return new Response(JSON.stringify(data), {
        headers: {
            'content-type': 'application/json;charset=UTF-8',
            'Access-Control-Allow-Origin': '*'
        }
    });

}

async function getBungeeBuild() {
    return await fetchJSON("https://hub.spigotmc.org/jenkins/job/BungeeCord/lastSuccessfulBuild/api/json?tree=id");
}
