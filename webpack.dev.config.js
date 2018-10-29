const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { spawn } = require('child_process');

const sourcePath = path.resolve(__dirname, 'src');
const distPath = path.resolve(__dirname, 'dist');

module.exports = {
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: [{ loader: 'babel-loader' }],
                include: sourcePath
            },
            {
                test: /\.s?css$/,
                use: [
                    "style-loader", 
                    "css-loader", 
                    "sass-loader"
                ],
                include: sourcePath
            }
        ]
    },
    target: 'electron-renderer',
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        })
    ],
    devtool: 'cheap-source-map',
    devServer: {
        contentBase: distPath,
        stats: {
            colors: true,
            chunks: false,
            children: false
        },
        before() {
            spawn(
                'electron',
                ['.'],
                {
                    shell: true,
                    env: process.env,
                    stdio: 'inherit'
                }
            )
            .on('close', code => process.exit(0))
            .on('error', spawnError => console.log(spawnError))
        }
    }
}