import {importSPKI, jwtVerify} from "https://cdn.jsdelivr.net/npm/jose@6.0.11/+esm";

const alg = 'RS256';
const spki = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjEsRmaLt0GyimmeZpsKf
Pm88VPm/kTMu2/aGGxnSXhcyM/FXZfI4LPB2AJsSxTauS43rKiq+Owvh4yWIUs1f
vFzJ1NUrResuizAF1W2akKPsAloxTgxshBhVApNX55erAHo40OY1w4o+dfLd3jnG
7KrbkcaHQTlhXP4+USm5lIQmn95+v1l4zny8JCqE1S8wqhLWewmFsBy1QdDMYhDC
hA96KwXIxfOqtPfsj9+W5isFMMt232JYxuebgjnXSKrRecumDyFEmZbSO4B0Kjsk
8nIyP4GDC+RT7uszCcnL6CfqjPCK+/ppDZdCRjcdSSFzrbRPLTwxv2ZCRTRRY8/6
aQIDAQAB
-----END PUBLIC KEY-----`;

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


async function main() {
    let userJWT;
    try {
        let jwt = query.get("jwt");
        const publicKey = await importSPKI(spki, alg);
        userJWT = (await jwtVerify(jwt, publicKey)).payload;
    } catch(e) {
        if (isCallback) return goCallback({"type": "unauth"});
        else return {"type": "unauth"};
    }

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
        await main();
    } catch (e){
        console.error(e);
        document.body.prepend("An error occured. Check the developer console for more details.")
    }
}

export {main as default};