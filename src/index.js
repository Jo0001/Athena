import {analyze, getDataFromUrl, sites} from "./analyze";
import {proxyDifference, proxyVersions} from "./proxy";
import {printError} from "./util";


export default {
    async fetch(request, env, ctx) {
        const {pathname, searchParams} = new URL(request.url);

        try {
            if (request.method === "POST") {
                if (pathname.startsWith("/v0/analyze/url")) {
                    let body;
                    try {
                        body = await request.json();
                    } catch (e) {
                        return printError("INVALID_JSON", "Request has not a valid json body", 422);
                    }
                    if (body.url.trim() === "") {
                        return printError("INVALID_URL", "url is empty", 422);
                    }
                    return await analyze(await getDataFromUrl(body.url));
                }
                if (pathname.startsWith("/v0/analyze/raw")) {
                    return await analyze(await request.text());
                }
            } else {
                if (pathname.startsWith("/v0/analyze/sites")) {
                    return sites();
                }
                if (pathname.startsWith("/v0/proxy/difference")) {
                    return await proxyDifference(searchParams.get('platform'), searchParams.get('platformstring'))
                }
                if (pathname.startsWith("/v0/proxy/versions")) {
                    return await proxyVersions();
                }
            }
            return printError("UNKNOWN_ENDPOINT", "This endpoint does not exist or you use the wrong request method", 400);
        } catch (e) {
            if (e.name != null && e.detail != null && e.code != null) {
                return printError(e.name, e.detail, e.code);
            }
            console.error(e);
            return printError("ERROR", "Ups", 500);
        }
    },
};
