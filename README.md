# Express Reqid

An Express.js middleware to generate unique id for incoming requests. The ids are generated using UUIDV4. 


## Installation
`npm install --save @niveus/express-reqid`

## Request ID format
Request ID looks similar to this `id-prefix:159132dd-1cd0-4a75-9227-4fef68765938`
<br>

The request ID is composed of two parts. Prefix and UUIDV4.
* id-prefix
    * String or a function that returns a string
* prefix seperator (string character to separate the prefix and unique part)
* unique part (generated)

> ⚠️ The prefix is mandatory field, and if not provided, the middleware will throw error at runtime. 

## Using Express Context
Follow the below example to use `@niveus/express-reqid` in your project.

``` js
const express = require('express');
const { expressReqid } = require('@niveus/express-reqid');

const app = express();

const reqidOptions = {
    idPrefix: process.env.REQUEST_ID_PREFIX,
};

app.use(expressReqid(reqidOptions));

// ...
```

Or if the id-prefix has to be generated (once or for every request), a function that outputs a strig can be used.

``` js
const express = require('express');
const { expressReqid } = require('@niveus/express-reqid');

const app = express();

const reqidOptions = {
    idPrefix: () => {return `${process.env.PREFIX}@${process.env.SERVICE_NAME}`},
};

app.use(expressReqid(reqidOPtions));

// ...
```

## Configuring Express Reqid
Almost everything is configurable in this library using the `ReqidOptions` object passed into the middleware. Some options like `idPrefix` are a required for the middleware to work whereas for the other options, the default values will be used.

### ReqidOptions

``` js
// Example reqidOptions
const ReqidOptions = {
    setHeader: true,
    headerName: 'request-id',
    useIdFromRequest: false,
    attribute: 'reqid',
    setInContext: false,
    idPrefix: null,
    prefixSeperator: ':',
};
```
> NOTE: Only `idPrefix` is mandatory. Rest are optional.

<br>

### ReqidOptions Configuration

| Config Name      | Type               | Default      | Description                                                                                                            |
|------------------|--------------------|--------------|------------------------------------------------------------------------------------------------------------------------|
| idPrefix         | string \| function | null         | ⚠️This is a required field. The value should be a string or a function that returns a string.                           |
| prefixSeperator  | string             | `:`          | Seperator character between `prefixSeperator` and request id.                                                          |
| setHeader        | boolean            | true         | If true, adds the `reqid` to the response header. Header name will be the value of `headerName`.                       |
| headerName       | string             | `request-id` | Header name to be set in the response.                                                                                 |
| attribute        | string             | `reqid`      | Attribute name where the request id will be stored in the `req` object and context.                                    |
| useIdFromRequest | boolean            | false        | Uses the request id from the request headers if a header with the value of `attribute` exist.                          |
| setInContext     | boolean            | false        | Sets the request id in context using `@niveus/express-context` library. The key used in context will be of `attribute` |

#### idPrefix
This is a required field. It can either be a string or a function that returns a string. Function args are not supported.

> ⚠️ If a valid value is not given, the middleware will throw an error at runtime. 

#### prefixSeperator
Seperator character between `idPrefix` and request id part of the reqid. Default is `:`.

#### setHeader
Boolean field to enable/disable request id headers in the response. The header name will be the value of `headerName`.

#### headerName
The header name for the request id in the response. Default is `request-id`. Can be configured as needed.

#### attribute
`attribute` is used to set the request id in the `req` object and context. Default is `reqid`, but is configurable. 

> ⚠️ Do not use key names already present in the req object (eg: `data`) as this middleware will overwrite the existing data with the request id. Use a unique attribute name or stick with the default value.

#### useIdFromRequest
It is disabled by default for security reasons. If enabled, then the middleware checks the incoming request for headers matching the value of `headerName` and if found, use the value of that header insteaded of generating a new request id. This is useful to inter-service requests happenieng as part of the main request. 

> ☢️ If `useIdFromRequest` is enabled, make sure the header (of `headerName`) is removed at the API gateway for incoming requests. This is to prevent request id injection from the frontend.

#### setInContext
Express Reqid uses `@niveus/express-reqid` to set the request id in the context. By default, it does not uses context. If the value needs to be set in the context, then the context should be created in the Express app. Follow [@niveus/express-context tutorial](https://www.npmjs.com/package/@niveus/express-context?activeTab=readme) on how to enable it.

The value of `attribute` will be used to set the request id in the context.

> ⚠️ `@niveus/express-reqid` should be run before this middleware. If not, the context namespace won't be created and the request id cannot be 

Example:

``` js
// app.js file

const expressContext = require('@niveus/express-context');
const express = require('express');
const { expressReqid } = require('@niveus/express-reqid');

const app = express();

// Use any third-party middleware here.

// Express Context middleware
app.use(expressContext.expressContextMiddleware());

// Express Reqid options
const reqidOptions = {
    idPrefix: 'request-prefix',
    setInContext: true,  // Enable context.
};

// Express Reqid Middleware.
app.use(expressReqid(reqidOPtions));

// ...



//  ---- Somewhere in the code where `req` object is not available. ----

const expressContext = require('@niveus/express-context');



function invalidateToken() {
    const token = expressContext.get('reqid');

    await userService.invalidateToken(token);

    // ...
}
```

## getHostDetails
`getHostDetails` function is used to get the host properties like hostname and process id. This can be used to create container specific request id if required, but is not advised to do so. Follow security best practices while doing so.

`getHostDetails` return value:
``` js
{
    pid: '1234',
    hostname: 'hostname-xyz',
}
```

Example use-case:
``` js
const express = require('express');
const { expressReqid, getHostDetails } = require('@niveus/express-reqid');

const app = express();

// Get host details
const hostDetails = getHostDetails();

// Use the host details to create the request id prefix
const reqidOptions = {
    idPrefix: `user-service@${hostDetails.hostname}`,
};

app.use(expressReqid(reqidOPtions));

// ...

```

## Credits
Code derived from [express-ruid](https://github.com/itross/express-ruid)

License: MIT (https://github.com/itross/express-ruid/blob/65d8cdbb3f9563bcb3e93c07a8b103dec5048cbc/LICENSE)
