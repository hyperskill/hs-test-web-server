const path = require('path');

const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

function runServer(host, port, src) {
    const webpackConfig = {
        mode: 'development',
        entry: './' + src + 'index.js',
        module: {
            rules: [
                {
                    test: new RegExp(src + '.*\.js$'),
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                        configFile: false,
                        presets: ["@babel/preset-react"],
                        cacheDirectory: true,
                        cacheCompression: false,
                        compact: false,
                    },
                },
                {
                    test: new RegExp(src + '.*\.css$'),
                    use: ['style-loader', 'css-loader']
                },
                {
                    test: new RegExp(src + '.*\.(png|svg|jpg|gif)$'),
                    use: 'file-loader'
                },
                {
                    test: new RegExp(src + '.*\.(woff|woff2|eot|ttf|otf)$'),
                    use: 'file-loader'
                },
            ]
        },
        devtool: 'cheap-module-eval-source-map',
        devServer: {
            contentBase: path.join(process.cwd(), 'public')
        }
    };

    const compiler = Webpack(webpackConfig);
    const server = new WebpackDevServer(compiler, webpackConfig.devServer);

    server.listen(port, host, () => {
        console.log(`Starting server on http://${host}:${port}`);
    });

    return server;
}

async function startServerAndTest(host, port, stage, test) {
    const src = stage.substring(process.cwd().length + 1) + '/src/';
    const server = runServer(host, port, src);

    try {
        return await test();
    } finally {
        server.close();
    }
}

exports.startServerAndTest = startServerAndTest;
