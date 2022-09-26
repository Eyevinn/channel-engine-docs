const ChannelEngine = require('eyevinn-channel-engine');

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
            ],
            "mysecondchannel": [
                {
                    id: 1,
                    title: "Tears of Steel",
                    uri: "https://maitv-vod.lab.eyevinn.technology/tearsofsteel_4k.mov/master.m3u8"        
                }
            ]
        }
    }

    async getNextVod(vodRequest) {
        const assets = this.assets[vodRequest.playlistId] || this.assets["myfirstchannel"];        
        const idx = Math.floor(Math.random() * assets.length);
        return assets[idx];
    } 
}

class MyChannelManager {
    getChannels() {
        return [
            { id: "myfirstchannel" },
            { id: "mysecondchannel" }
        ];
    }
}

const myAssetManager = new MyAssetManager();
const myChannelManager = new MyChannelManager();

const engine = new ChannelEngine(myAssetManager, { channelManager: myChannelManager });
engine.start();
engine.listen(process.env.PORT || 8080);