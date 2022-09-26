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

We will now update the adapter to randomly return a VOD from a list of available VODs. To do this we need to modify the `AssetManager` adapter a bit. Let's create a list with the following already transcoded HLS short videos from Eyevinn's [Streaming Tech Sweden](https://streamingtech.se) conference:

```
https://lab.cdn.eyevinn.technology/stswe19-three-roads-to-jerusalem.mp4/manifest.m3u8
https://lab.cdn.eyevinn.technology/stswe22-talks-teaser-Z4-ehLIMe8.mp4/manifest.m3u8
https://lab.cdn.eyevinn.technology/stswe22-webrtc-flt5fm7bR3.mp4/manifest.m3u8
```

In the asset manager we store this list for our channel we called `myfirstchannel`.

```javascript
class MyAssetManager {
    constructor() {
        this.assets = {
            "myfirstchannel": [
                {
                    id: "e62ae11e-eee0-4372-812d-90730241831b",
                    title: "stswe19-three-roads-to-jerusalem",
                    uri: "https://lab.cdn.eyevinn.technology/stswe19-three-roads-to-jerusalem.mp4/manifest.m3u8"
                },
                {
                    id: "3a65e827-8c75-4e7b-90d5-15f797ed1646",
                    title: "stswe22-talks-teaser",
                    uri: "https://lab.cdn.eyevinn.technology/stswe22-talks-teaser-Z4-ehLIMe8.mp4/manifest.m3u8"
                },
                {
                    id: "dd21b69f-8096-4ee5-a899-9cdabb9371b4",
                    title: "stswe22-webrtc",
                    uri: "https://lab.cdn.eyevinn.technology/stswe22-webrtc-flt5fm7bR3.mp4/manifest.m3u8"
                }
            ]
        }
    }
    //...
}
```

We then modify the `getNextVod()` function to return a randomly chosen item from this array.

```javascript
    async getNextVod(vodRequest) {
        const assets = this.assets["myfirstchannel"];
        const idx = Math.floor(Math.random() * assets.length);
        return assets[idx];
    } 
```

As you see we will actually not care about what channel is specified in the request and always choose the `myfirstchannel`. If you want to get the channel Id from the request it is available as `vodRequest.playlistId`. So let us modify this function a little bit just as an example:

```javascript
    async getNextVod(vodRequest) {
        const assets = this.assets[vodRequest.playlistId] || this.assets["myfirstchannel"];        
        const idx = Math.floor(Math.random() * assets.length);
        return assets[idx];
    } 
```

To handle a second channel you could just update the `ChannelManager` to return two channels:

```javascript
class MyChannelManager {
    getChannels() {
        return [
            { id: "myfirstchannel" },
            { id: "mysecondchannel" }
        ];
    }
}
```
And then we add the Tears of Steel short movie to the assets list:

```javascript
        this.assets = {
            "myfirstchannel": [...],
            "mysecondchannel": [
                {
                    id: 1,
                    title: "Tears of Steel",
                    uri: "https://maitv-vod.lab.eyevinn.technology/tearsofsteel_4k.mov/master.m3u8"        
                }
            ]
        }
```

To try this out you can now point your HLS video to player to any of these streaming URLs:

 - [http://localhost:8080/channels/myfirstchannel/master.m3u8](http://web.player.eyevinn.technology/?manifest=http%3A%2F%2Flocalhost%3A8080%2Fchannels%2Fmyfirstchannel%2Fmaster.m3u8)
 - [http://localhost:8080/channels/mysecondchannel/master.m3u8](http://web.player.eyevinn.technology/?manifest=http%3A%2F%2Flocalhost%3A8080%2Fchannels%2Fmysecondchannel%2Fmaster.m3u8)

## Getting help

Join our [community on Slack](http://slack.streamingtech.se) where you can post any questions regarding any of our open source projects. Eyevinn's consulting business can also offer you:

 - Further development of this component
 - Customization and integration of this component into your platform
 - Support and maintenance agreement

Contact [sales@eyevinn.se](mailto:sales@eyevinn.se) if you are interested.