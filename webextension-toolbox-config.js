// This file is not going through babel transformation.
// So, we write it in vanilla JS
// (But you could use ES2015 features supported by your Node.js version)
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");

// const ChromeExtensionReloader = require("webpack-chrome-extension-reloader");

const VueLoaderPlugin = require("vue-loader/lib/plugin");

module.exports = {
  webpack: (config, { dev, vendor }) => {
    // config.plugins.push(
    //   new ChromeExtensionReloader({
    //     entries: {
    //       // The entries used for the content/background scripts
    //       contentScript: "contentscript", // Use the entry names, not the file name or the path
    //       background: "background" // *REQUIRED
    //     }
    //   })
    // );
    // Perform customizations to webpack config
    // plugins: [];

    config.plugins.push(new Dotenv());

    // config.node["fs"] = "empty";

    config.module.rules.push(
      ...[
        {
          test: /\.vue$/,
          loader: "vue-loader"
          // ,
          // options: {
          //   loaders: {
          //   }
          //   // other vue-loader options go here
        },
        {
          test: /\.css$/,
          use: ["vue-style-loader", "css-loader"]
        }
      ]
    );

    config.plugins.push(new VueLoaderPlugin());

    // Important: return the modified config
    return config;
  }
};
