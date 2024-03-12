/* eslint-disable max-len */
const { randomUUID } = require('node:crypto');
const expressContext = require('@niveus/express-context');
const hostname = require('os').hostname();
const pid = process.pid;

const getHostDetails = () => {
    return {
        pid: pid.toString(),
        hostname: hostname,
    };
};

const expressReqid = ({
    setHeader = true,
    headerName = 'request-id',
    useIdFromRequest = false,
    attribute = 'reqid',
    setInContext = false,
    idPrefix = null,
    prefixSeperator = ':',
    // idType = 'uuid4', // uuid4, uuid7, snowflake
} = {}) => {

    if (idPrefix === null) throw new Error('express-reqid: idPrefix config value is required');

    const generateReqId = () => {
        // Generates the id prefix is idPrefix is a funcion. Else uses the string value.
        const rootPrefix = typeof idPrefix === 'function' ? idPrefix() : idPrefix;

        return `${rootPrefix}${prefixSeperator}${randomUUID()}`;
    };

    return (req, res, next) => {
        // Use the reqid from request if useIdFromRequest is enabled (if available). Else generate new reqid.
        req[attribute] = useIdFromRequest ? req.headers[headerName.toLocaleLowerCase()] || generateReqId() : generateReqId();
        if (setInContext) expressContext.set(attribute, req[attribute]);
        if (setHeader) res.setHeader(headerName, req[attribute]);

        next();
    };
};


module.exports = {
    expressReqid,
    getHostDetails,
};
