# Electron React OSC Playground 

This is a Place to play around with React and OSC in Electron

## Installing

Clone the Repository on local Device:
```sh
git clone https://github.com/ehrdi/electron-react-osc-playground.git 
```
Install Node Packages:
```sh
npm install
```
Run rebuild to compile Node Modules (mainly osc.js) against Electrons Node Version
```sh
npm run rebuild
```

## Usage

Run App in development-Mode:
```sh
npm run dev
``` 

Run App in production-Mode:
```sh
npm run prod
```

Build App into /dist Folder:
```sh
npm run build
``` 

Package App and store the builds for all Platforms in /builds Folder:
```sh
npm run package
```

### Simple Tool for Sending quick OSC Messages from CommandLine:

[`oscurl`](https://github.com/russellmcc/oscurl)
