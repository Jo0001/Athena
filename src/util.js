const UA = "Athena v0.0.0 by Jo0001";

/**
 * Function to provide error messages as nice JSON
 * @param type category e.g. UNKNOWN_ENDPOINT
 * @param message more details about the error
 * @param code https status code
 * @returns {Response}
 */
export function printError(type, message, code) {
    return new Response(JSON.stringify({type: type, message: message, code: code}), {
        headers: {
            'content-type': 'application/json;charset=UTF-8',
            'Access-Control-Allow-Origin': '*'
        }, status: code
    })
}

export async function fetchRaw(url) {
    let req = await fetch(url, {headers: {"User-Agent": UA}});
    if (req.ok) {
        return await req.text();
    } else {
        throw {name: "UPSTREAM_SERVER_ERROR", detail: url + " returned " + req.status, code: 502}
    }
}

export async function fetchJSON(url) {
    let req = await fetch(url, {headers: {"User-Agent": UA}});
    if (req.ok) {
        return await req.json();
    } else {
        throw {name: "UPSTREAM_SERVER_ERROR", detail: url + " returned " + req.status, code: 502}
    }
}