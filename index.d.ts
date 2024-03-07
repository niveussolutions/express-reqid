import { Request, Response, NextFunction } from "express";

declare type HostDetails = {
    pid: string,
    hostname: string,
}

declare type ReqidOptions = {
    setHeader?: Boolean,

    headerName?: string,

    useIdFromRequest?: Boolean,

    attribute?: string,

    setInContext?: Boolean,

    idPrefix: string | (() => string),

    prefixSeperator?: string,

    // idType = 'uuid4', // uuid4 or snowflake
}

declare function getHostDetails(): HostDetails;

declare function expressReqid({
    setHeader = true,
    headerName = 'request-id',
    useIdFromRequest = true,
    attribute = 'reqid',
    setInContext = false,
    idPrefix = null,
    prefixSeperator = '/',
    // idType = 'uuid4', // uuid4 or snowflake
}: ReqidOptions): (req: Request, res: Response, next: NextFunction) => void;

export = {
    getHostDetails,
    expressReqid,
}

export {
    HostDetails,
    ReqidOptions,
};