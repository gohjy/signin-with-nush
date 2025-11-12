# Sign in with NUSH
![Latest version badge](https://img.shields.io/github/v/release/gohjy/signin-with-nush?label=latest%20release&labelColor=grey&color=blue) 

A service to allow NUSH students and staff to sign in to your platform with a NUS High Microsoft account through [Hexauth](https://hexauth.coding398.dev). Verifies Hexauth's JWT with [`jose`](https://cdn.jsdelivr.net/npm/jose@6.1.1/) (npm package).

Check out the [demo](./docs/demo/)!

## How to use
1. On your sign in page, put the link to Hexauth with your own callback response page as the callback parameter:
```plain
https://auth.coding398.dev/go/microsoft?callback=[CALLBACK_URL]
```
2. On your callback page, include the following in a JavaScript **module** (`<script type="module">`):
```js
import signin from "https://cdn.jsdelivr.net/gh/gohjy/signin-with-nush@0.4.0/signin-with-nush.min.js";
try {
    const userData = signin();
    // your data handling code goes here
} catch(err) {
    // your error handling code goes here
    // note: signin-with-nush won't throw errors itself
}
```

## Returned data
Sign in with NUSH will return a JSON object, which will always contain a `type` property. Scenarios are detailed below. (All properties are strings unless otherwise stated.)

### `type: unauth`
When the sign in failed, and the account is not a NUSH student or staff email. Also returned if JWT verification fails. Additional properties:
- `"type"`: "unauth"
- `"email"`: If the JWT is valid and the account isn't a NUSH email, this property contains the email signed in with. No processing is done.
- `"rawJWT"`: If `email` is present, this property contains the raw JWT (see ["the `rawJWT` property"](#the-rawjwt-property) below).

### `type: student`
A student (email hxxxxxxx@) has signed in. Additional properties include:
- `"type"`: "student"
- `"name"`: Microsoft account name
- `"email"`: The email
- `"entryShortYear"`: Last 2 digits of entry year, for example a h25xxxxx email returns "25"
- `"entryFullYear"`: Entry year, for example a h25xxxxx email returns 2025 (as a number)
- `"entryYear"`: Effectively an alias for `entryFullYear`
- `"entryLevel"`: Level of entry, for example a h251xxxx email returns 1 (as a number)
- `"levelId"`: The `id`, stripped of the leading `entryYear` and `entryLevel`
- `"id"`: The student ID (hxxxxxxx)
- `"rawJWT"`: See ["the `rawJWT` property"](#the-rawjwt-property) below

### `type: staff`
A staff member (email nhs...@ or anhs...@) has signed in. Additional properties include:
- `"type"`: "staff"
- `"name"`: Microsoft account name
- `"email"`: The email, normalised to a @nus email (instead of @nushigh)
- `"staffId"`: Everything in the email before the `@`
- `"rawJWT"`: See ["the `rawJWT` property"](#the-rawjwt-property) below

### The `rawJWT` property
The `rawJWT` property contains the decoded JWT payload, if applicable. Typically this looks something like:
```jsonc
{
    // Unique Hexauth ID
    "id": "mcs.017efa...",

    // MS account name
    // On student/staff responses, equivalent to `name` property
    "n": "JOHN DOE",

    // Email
    // Equivalent to `email` property
    "em": "h0530001@nushigh.edu.sg",

    // Callback URL
    "cb": "https://example.com/callback",

    // Issued at (seconds since epoch)
    "iat": 1761955200,
    // Expires at (seconds since epoch)
    "exp": 1762560000
    // With Hexauth, `exp` is typically 1 week after `iat`
}
```

## License
[MIT License](./LICENSE) ([view on choosealicense.com](https://choosealicense.com/licenses/mit/)). Note that I don't own any rights to Hexauth.
