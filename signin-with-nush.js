import {sha512 as SHA512} from "https://cdn.jsdelivr.net/npm/js-sha512@0.9.0/+esm";

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

const studentEmail = (em) => {
    const matches = em.match(/^(h(\d{2})(\d)(\d{4}))\@nushigh\.edu\.sg$/);
    if (matches) {
        let returnValue = {
            "type": "student",
            "name": null,
            "email": matches[0],
            "entryShortYear": +matches[2],
            "entryYear": 0, // set below
            "entryFullYear": +(new Date().getFullYear().toString().slice(0, 2) + matches[2]),
            "entryLevel": +matches[3],
            "levelId": matches[4],
            "id": matches[1],
            "gradYear": 0 // set below
        };
        returnValue.entryYear = returnValue.entryFullYear;
        returnValue.gradYear = returnValue.entryFullYear - returnValue.entryLevel + 6;

        return returnValue;
    } else {
        return null;
    }
}

const staffEmail = (em) => {
    const matches = em.match(/^(a?nhs[a-z]+)\@(nus(high)?)\.edu\.sg$/);
    if (matches) {
        return {
            "type": "staff",
            "name": null,
            "email": `${matches[1]}@nus.edu.sg`, // Normalise to @nus.edu.sg email
            "staffId": matches[1]
        };
    } else {
        return null;
    }
}

const query = new URL(location.href).searchParams;

const isCallback = new URL(import.meta.url).searchParams.has("callback"); // if script imported through ?callback

const goCallback = data => {
    const callbackUrl = new URL(query.get("callback"));
    callbackUrl.searchParams.set("user", JSON.stringify(data));
    location.replace(callbackUrl.href);
    return;
}


function main() {
    let jwt = query.get("jwt");
    let userJWT = parseJwt(jwt);

    const userData = studentEmail(userJWT.em) ?? staffEmail(userJWT.em) ?? null;

    if (!userData) {
        if (isCallback) return goCallback({"type": "unauth", "email": userJWT.em});
        else return {"type": "unauth", "email": userJWT.em};
    }

    userData.name = userJWT.n;
    
    if (isCallback) return goCallback(userData);
    else return userData;
}

if (isCallback) {
    try {
        main();
    } catch (e){
        console.error(e);
        document.body.prepend("An error occured. Check the developer console for more details.")
    }
}

export {main as default};