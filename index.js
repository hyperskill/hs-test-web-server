const execa = require('execa');
const waitOn = require('wait-on');

async function startServerAndTest(host, port, path, test) {
    let node = `"${process.argv[0]}" "${__dirname}/start.js"`;
    let params = `host:${host} port:${port} "path:${path}"`;
    const server = execa(`${node} ${params}`);

    try {
        await waitOn({resources: [`http://${host}:${port}`], window: 1000});
        return await test();
    } finally {
        server.kill();
    }
}

exports.startServerAndTest = startServerAndTest;
