const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');


const sourcePath = path.resolve(__dirname, 'src');

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
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ],
    stats: {
        colors: true,
        children: false,
        chunks: false,
        modules: false
    }
}