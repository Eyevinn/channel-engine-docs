# Getting started

An introduction to Eyevinn Channel Engine!

--- 

This tutorial gives you an introduction to the Eyevinn Channel Engine by describing how you can setup a simple linear channel where the order of the programs are fully random.

## Installation

Setup a new Node project:

```bash
mkdir my-channel-engine
cd my-channel-engine
npm init
```

Then install the `eyevinn-channel-engine` NPM module in the project.

```bash
npm install --save eyevinn-channel-engine
```

## Create server script

Create a file called `server-intro.js` that contains the following Javascript snippet:

```javascript
const ChannelEngine = require('eyevinn-channel-engine');

class MyAssetManager {
    async getNextVod(vodRequest) {
        return {};
    } 
}

class MyChannelManager {
    getChannels() {
        return [];
    }
}

const myAssetManager = new MyAssetManager();
const myChannelManager = new MyChannelManager();
const engine = new ChannelEngine(myAssetManager, { channelManager: myChannelManager });
engine.start();
engine.listen(process.env.PORT || 8080);
```

## Develop adapters for the business logic

All business logic is defined in code outside of the Channel Engine. The engine's main task is to produce live HLS streams and has no knowledge or logic on what to actually play next and what channels it is supposed to serve.

This logic is placed in two adapters `AssetManager` and `ChannelManager`. The engine requests from the `AssetManager` on what to play up next and the `ChannelManager` to get a list of channels are available.

So the first thing we will do is to adjust our `ChannelManager` adapter in the example above by having the `getChannels()` function to return one channel we call `myfirstchannel`. It is hard-coded in this example but normally this is fetching the channel list from an external API listing the available channels.

```javascript
class MyChannelManager {
    getChannels() {
        return [
            { id: "myfirstchannel" }
        ];
    }
}
```

Next step is to modify the `getNextVod()` call in the `AssetManager` adapter. For now it will always return the same program, the Tears of Steel short-movie. It returns a unique Id, Title and URI to the HLS VOD.

```javascript
class MyAssetManager {
    async getNextVod(vodRequest) {
        return {
            id: 1,
            title: "Tears of Steel",
            uri: "https://maitv-vod.lab.eyevinn.technology/tearsofsteel_4k.mov/master.m3u8"
        };
    } 
}
```

Now you have everything to try it out. Start the engine!

```bash
node server-intro.js
```

Then you can play the live HLS with this URI: `http://localhost:8080/channels/myfirstchannel/master.m3u8` in your favourite HLS video player, for example: [http://web.player.eyevinn.technology/?manifest=http%3A%2F%2Flocalhost%3A8080%2Fchannels%2Fmyfirstchannel%2Fmaster.m3u8](http://web.player.eyevinn.technology/?manifest=http%3A%2F%2Flocalhost%3A8080%2Fchannels%2Fmyfirstchannel%2Fmaster.m3u8)

## Update adapter

We will now update the adapter to randomly return a VOD from a list of available VODs. To do this we need to modify the `AssetManager` adapter a bit.