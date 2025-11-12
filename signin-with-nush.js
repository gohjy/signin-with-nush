import { importSPKI, jwtVerify } from "https://cdn.jsdelivr.net/npm/jose@6.1.1/+esm";

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
const publicKey = await importSPKI(spki, alg);

const matchStudentEmail = (em) => {
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

const matchStaffEmail = (em) => {
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

async function main() {
    const query = new URL(location.href).searchParams;
    if (!query.has("jwt")) return { "type": "unauth" };

    let userJWT;
    try {
        let jwt = query.get("jwt");
        userJWT = (await jwtVerify(jwt, publicKey)).payload;
    } catch(err) {
        console.error("[signin-with-nush] Error occurred while decoding JWT payload:", err);
        return {"type": "unauth"};
    }

    const userData = matchStudentEmail(userJWT.em) ?? matchStaffEmail(userJWT.em) ?? null;

    if (!userData) {
        return {
            "type": "unauth",
            "email": userJWT.em,
            "rawJWT": userJWT
        };
    }

    userData.name = userJWT.n;
    userData.rawJWT = userJWT;
    return userData;
}

export default main;
