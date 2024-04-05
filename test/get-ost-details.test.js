const { getHostDetails } = require('../lib/express-reqid');
const hostname = require('os').hostname();
const pid = process.pid;

describe('getHostDetails helper function.', () => {
    it('Hostname and PID should match', () => {
        const hostDetails = getHostDetails();

        expect.assertions(2);

        expect(hostDetails.hostname).toBe(hostname);
        expect(hostDetails.pid).toBe(pid.toString());
    });
});
