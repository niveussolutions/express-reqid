const { expressReqid } = require('../lib/express-reqid');
const express = require('express');
const supertest = require('supertest');

describe('Default config', () => {
    it('Shoud throw an error if id prefix is not provided.', () => {
        const app = express();

        try {
            app.use(expressReqid());
        } catch (err) {
            expect(err.message).toBe('express-reqid: idPrefix config value is required');
        }
    });
});

describe('Basic request id', () => {
    it('Should create request id when id prefix is provided.', async () => {
        const app = express();

        const idPrefix = 'test';

        app.use(expressReqid({ idPrefix: idPrefix }));

        app.get('/test', (req, res) => {
            expect(req).exists;
            expect(req).toHaveProperty('reqid');

            res.status(200).json({});
        });

        await supertest(app).get('/test')
            .expect(200);
    });

    it('Should have a prefix with custom prefix', async () => {
        const app = express();

        const idPrefix = 'test';

        app.use(expressReqid({ idPrefix: idPrefix }));

        app.get('/test', (req, res) => {
            expect(req).exists;
            expect(req.reqid).toMatch(new RegExp(idPrefix, 'gi'));

            res.status(200).json({});
        });

        await supertest(app).get('/test')
            .expect(200);
    });
});

describe('Prefix seperator', () => {
    it('Should use default prefix seperator character ":"', async () => {
        const app = express();

        const idPrefix = 'test';

        app.use(expressReqid({ idPrefix: idPrefix }));

        app.get('/test', (req, res) => {
            expect(req).exists;
            expect(req.reqid).toMatch(new RegExp(/test:.*/, 'gi'));

            res.status(200).json({});
        });

        await supertest(app).get('/test')
            .expect(200);
    });

    it('Should use custom prefix seperator character "|"', async () => {
        const app = express();

        const idPrefix = 'test';

        app.use(expressReqid({ idPrefix: idPrefix, prefixSeperator: '|' }));

        app.get('/test', (req, res) => {
            expect(req).exists;
            expect(req.reqid).toMatch(new RegExp(/test\|./, 'gi'));

            res.status(200).json({});
        });

        await supertest(app).get('/test')
            .expect(200);
    })
})


describe('Request id in headers', () => {
    it('should have default reqid header', (done) => {
        const app = express();

        const idPrefix = 'test';

        app.use(expressReqid({ idPrefix: idPrefix }));

        app.get('/test', (req, res) => {

            res.status(200).json({});
        });

        const sut = supertest(app);

        sut.get('/test').end((err, res) => {
            // Assert
            expect(res.header).toHaveProperty('request-id');

            done();
        });
    });

    it('Should not have request id in headers if setHeader is false', (done) => {
        const app = express();

        const idPrefix = 'test';

        app.use(expressReqid({ idPrefix: idPrefix, setHeader: false }));

        app.get('/test', (req, res) => {

            res.status(200).json({});
        });

        const sut = supertest(app);

        sut.get('/test').end((err, res) => {
            // Assert
            expect(res.header).not.toHaveProperty('request-id');

            done();
        });
    });

    it('Should return request id in custom header name in the response', (done) => {
        const app = express();

        const idPrefix = 'test';

        app.use(expressReqid({ idPrefix: idPrefix, headerName: 'custom-header' }));

        app.get('/test', (req, res) => {

            res.status(200).json({});
        });

        const sut = supertest(app);

        sut.get('/test').end((err, res) => {
            // Assert
            expect(res.header).toHaveProperty('custom-header');

            done();
        });
    });
});

describe('Request id from request headers', () => {
    it('Should not use request id from request id by default', (done) => {
        const app = express();

        const idPrefix = 'test';

        app.use(expressReqid({ idPrefix: idPrefix }));

        app.get('/test', (req, res) => {

            res.status(200).json({});
        });

        const sut = supertest(app);

        const requestIdInRequest = 'request:123456789';

        sut.get('/test').set('request-id', requestIdInRequest).end((err, res) => {
            // Assert
            expect(res.header['request-id']).not.toBe(requestIdInRequest);

            done();
        });
    })

    it('Should use request id from request if useIdFromRequest is set to true', (done) => {
        const app = express();

        const idPrefix = 'test';

        app.use(expressReqid({ idPrefix: idPrefix, useIdFromRequest: true }));

        app.get('/test', (req, res) => {

            res.status(200).json({});
        });

        const sut = supertest(app);

        const requestIdInRequest = 'request:123456789';

        sut.get('/test').set('request-id', requestIdInRequest).end((err, res) => {
            // Assert
            expect(res.header['request-id']).toBe(requestIdInRequest);

            done();
        });
    })

    it('Should generate new reqid if useIdFromRequest is true, but no request id is present in the request headers ', (done) => {
        const app = express();

        const idPrefix = () => { return 'generated-id' };

        app.use(expressReqid({ idPrefix: idPrefix, useIdFromRequest: true }));

        app.get('/test', (req, res) => {

            res.status(200).json({});
        });

        const sut = supertest(app);


        sut.get('/test').end((err, res) => {
            // Assert
            // Matching the prefix since id is randomly generated every time.
            expect(res.header['request-id']).toMatch(new RegExp(/generated-id/, 'gi'));
            done();
        });
    })
})

describe('Custom function in root prefix', () => {
    it('Should use custom function to generate prefix if a function is provided', async () => {
        const app = express();

        const idPrefix = () => { return 'function-generated-prefix' }; // Function to generate prefix

        app.use(expressReqid({ idPrefix: idPrefix }));

        app.get('/test', (req, res) => {
            expect(req).exists;
            expect(req.reqid).toMatch(new RegExp(/function-generated-prefix/, 'gi'));

            res.status(200).json({});
        });

        await supertest(app).get('/test')
            .expect(200);
    });
});

describe('Request id in expressContext', () => {
    it('Should not have reqid in expressContext by default', async () => {
        const expressContext = require('@niveus/express-context');

        const app = express();

        const idPrefix = 'test';

        app.use(expressContext.expressContextMiddleware());
        app.use(expressReqid({ idPrefix: idPrefix }));

        app.get('/test', (req, res) => {

            expect(expressContext).not.exists;

            res.status(200).json({});
        });

        await supertest(app).get('/test')
            .expect(200);
    });


    it('Should have reqid in expressContext', async () => {
        const expressContext = require('@niveus/express-context');

        const app = express();

        const idPrefix = 'test';

        app.use(expressContext.expressContextMiddleware());
        app.use(expressReqid({ idPrefix: idPrefix, setInContext: true }));

        app.get('/test', (req, res) => {

            expect(expressContext).exists;
            expect(expressContext.get('reqid')).toBe(req.reqid);

            res.status(200).json({});
        });

        await supertest(app).get('/test')
            .expect(200);
    });

    it('Should have reqid in expressContext and req object with custom attribute name "requestId"', async () => {
        const expressContext = require('@niveus/express-context');

        const app = express();

        const idPrefix = 'test';

        app.use(expressContext.expressContextMiddleware());
        app.use(expressReqid({ idPrefix: idPrefix, attribute: 'requestId', setInContext: true }));

        app.get('/test', (req, res) => {

            expect(expressContext).exists;
            expect(req).toHaveProperty('requestId');
            expect(expressContext.get('requestId')).toBe(req.requestId);

            res.status(200).json({});
        });

        await supertest(app).get('/test')
            .expect(200);
    });
});