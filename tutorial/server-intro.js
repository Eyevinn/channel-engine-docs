const ChannelEngine = require('eyevinn-channel-engine');

class MyAssetManager {
    async getNextVod(vodRequest) {
        return {
            id: 1,
            title: "Tears of Steel",
            uri: "https://maitv-vod.lab.eyevinn.technology/tearsofsteel_4k.mov/master.m3u8"
        };
    } 
}

class MyChannelManager {
    getChannels() {
        return [
            { id: "myfirstchannel" }
        ];
    }
}

const myAssetManager = new MyAssetManager();
const myChannelManager = new MyChannelManager();

const engine = new ChannelEngine(myAssetManager, { channelManager: myChannelManager });
engine.start();
engine.listen(process.env.PORT || 8080);