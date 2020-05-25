const path = require('path');
const { spawn } = require('child_process');
const hs = require('hs-test-web');

async function startServerAndTest(host, port, stage, test) {
    const src = stage.substring(process.cwd().length + 1) + '/src/';

    const server = spawn(process.argv[0], [
        __dirname + '/start.js',
        'host:' + host,
        'port:' + port,
        'src:' + src
    ]);

    let out = '';
    let err = '';

    server.stdout.on('data', (data) => {
        console.log(data.toString());
        out += data;
    });

    server.stderr.on('data', (data) => {
        console.error(data.toString());
        err += data;
    });

    const sleep = (ms) => new Promise(res => setTimeout(res, ms));

    try {
        while (true) {
            await sleep(10);
            if (err.length > 0) {
                return hs.wrong(err);
            }
            if (out.includes("Compiled successfully.")) {
                break;
            }
        }

        return await test();
    } finally {
        server.kill();
    }
}

exports.startServerAndTest = startServerAndTest;
