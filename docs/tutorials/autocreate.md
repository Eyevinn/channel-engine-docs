# Automatically create new channels

This tutorial describes how to build an engine implementation that dynamically create new channels that does not exist. One use case is to have a unique and fully personalized channel for each viewer.

---

We will first start of with a standard Channel Manager adapter implementation:

```
class MyChannelManager implements IChannelManager {
  private channels: Channel[] = [];

  constructor() {
    this.channels.push({ id: "1", profile: this._getProfile() });
  }

  getChannels(): Channel[] {
¨    return this.channels;
  }

  _getProfile(): ChannelProfile[] {
    return [
      { bw: 6134000, codecs: "avc1.4d001f,mp4a.40.2", resolution: [1024, 458] },
      { bw: 2323000, codecs: "avc1.4d001f,mp4a.40.2", resolution: [640, 286] },
      { bw: 1313000, codecs: "avc1.4d001f,mp4a.40.2", resolution: [480, 214] },
    ];
  }
}
```

A channel manager that has one channel with Id `1` initially and available at the playback URL `/channels/1/master.m3u8`. What we now want to achieve is that if a player would use the playback URL `/channels/foo/master.m3u8` it should create a new channel with Id `foo`. To achieve this we will extend the channel manager with a function `autoCreateChannel` that is called by the engine when a new channel is requested. That is, a channel that the engine has not found in the current list of channels from the channel manager. 

```
  autoCreateChannel(channelId: string) {
    if (!this.channels.find((ch) => ch.id === channelId)) {      
      this.channels.push({ id: channelId, profile: this._getProfile() });
    }
  }
```

This implementation above will just create a new channel with a default profile if is not already in the list. Note that this implementation does not persist anything and on a restart of the server the channel list will be back to default. The channel manager implementation will now look like this.

```
class MyChannelManager implements IChannelManager {
  private channels: Channel[] = [];

  constructor() {
    this.channels.push({ id: "1", profile: this._getProfile() });
  }

  getChannels(): Channel[] {
¨    return this.channels;
  }

  autoCreateChannel(channelId: string) {
    if (!this.channels.find((ch) => ch.id === channelId)) {      
      this.channels.push({ id: channelId, profile: this._getProfile() });
    }
  }

  _getProfile(): ChannelProfile[] {
    return [
      { bw: 6134000, codecs: "avc1.4d001f,mp4a.40.2", resolution: [1024, 458] },
      { bw: 2323000, codecs: "avc1.4d001f,mp4a.40.2", resolution: [640, 286] },
      { bw: 1313000, codecs: "avc1.4d001f,mp4a.40.2", resolution: [480, 214] },
    ];
  }
}
```

However, to enable this feature you also need to set the engine option `autoCreateSession` to true, for example:

```
const engineOptions: ChannelEngineOpts = {
  heartbeat: "/",
  averageSegmentDuration: 2000,
  channelManager: myChannelManager,
  autoCreateSession: true,
  defaultSlateUri:
    "https://maitv-vod.lab.eyevinn.technology/slate-consuo.mp4/master.m3u8",
  slateRepetitions: 10,
};

const engine = new ChannelEngine(myAssetManager, engineOptions);
engine.start();
engine.listen(process.env.PORT || 8000);
```

In the asset manager you will get the channel Id in the Vod Request payload as usual (`VodRequest.playlistId`) and from there you place the logic what VOD to be served to the engine in this case. If you are creating a channel based on each viewer you would probably ask a recommendation engine for that particular viewer on what to play next.