# Sign in with NUSH
![Latest version: v0.3.0](https://img.shields.io/badge/latest-v0.3.0-blue) \
A service to allow NUSH students and staff to sign in to your platform with a NUS High Microsoft account through [Hexauth](https://hexauth.coding398.dev). Verifies Hexauth's JWT with [`jose`](https://cdn.jsdelivr.net/npm/jose@6.0.11/) (npm package).

## How to use
1. On your sign in page, put the link to Hexauth with your own callback response page as the callback parameter:
```plain
https://auth.coding398.dev/go/microsoft?callback=[CALLBACK_URL]
```
2. On your callback page, include the following in a JavaScript **module** (`<script type="module">`):
```js
import signin from "https://cdn.jsdelivr.net/gh/gohjy/signin-with-nush@0.3.0/signin-with-nush.min.js";
try {
    const userData = signin();
    // your data handling code goes here
} catch(e) {
    // your error handling code goes here
}
```

## Returned data
Sign in with NUSH will return a JSON object, which will always contain a `type` property. Scenarios are detailed below. (All properties are strings unless otherwise stated.)
### `type: unauth`
When the sign in failed, and the account is not a NUSH student or staff email. Also returned if JWT verification fails. Additional properties:
- `"type"`: "unauth"
- `"email"`: If the JWT is valid and the account isn't a NUSH email, this property contains the email signed in with. No processing is done.

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

### `type: staff`
A staff member (email nhs...@ or anhs...@) has signed in. Additional properties include:
- `"type"`: "staff"
- `"name"`: Microsoft account name
- `"email"`: The email, normalised to a @nus email (instead of @nushigh)
- `"staffId"`: Everything in the email before the `@`

## License
[MIT License](./LICENSE) ([view on choosealicense.com](https://choosealicense.com/licenses/mit/)). Note that I don't own any rights to Hexauth.