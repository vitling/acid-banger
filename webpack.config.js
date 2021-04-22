//webpack.config.js
const path = require('path');

const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const htmlPlugin = new HtmlWebPackPlugin({
  template: "./static/index.html",
});
const copyPlugin = new CopyWebpackPlugin({
  patterns: [      
      { 
        from: 'static',
        globOptions: {
          ignore: ["**/*.html"],
        }
      }
    ]
});

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    main: "./src/app.ts",
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: "bundle.js"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  plugins: [    
    htmlPlugin,    
    copyPlugin
  ],
  module: {
    rules: [
      { 
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: [
            path.resolve(__dirname, "node_modules")
        ]
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  }
};