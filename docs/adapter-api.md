# Adapater APIs

All business logic is defined in code outside of the Channel Engine. The engine's main task is to produce live HLS streams and has no knowledge or logic on what to actually play next and what channels it is supposed to serve.

This logic is placed in two adapters `AssetManager` and `ChannelManager`. The engine requests from the `AssetManager` on what to play up next and the `ChannelManager` to get a list of channels are available.

## Channel Manager API

```javascript
interface IChannelManager {
  // Get a list of channels available
  getChannels: () => Channel[];
  // Called when engine is having the autoCreateSession option enabled
  autoCreateChannel?: (channelId: string) => void;
}
```

### Channel

```javascript
interface Channel {
  id: string; // Unique Id of a channel
  profile: ChannelProfile[]; // Channel profile
  audioTracks?: AudioTracks[]; // Audio tracks available
  subtitleTracks?: SubtitleTracks[]; // Subtitle tracks available
  closedCaptions?: ClosedCaptions[]; // Closed captions available
}
```

### ChannelProfile

```javascript
interface ChannelProfile {
  bw: number; // Bandwidth of the ladder
  codecs: string; // Codecs string
  resolution: number[]; // Resolution, e.g. [ 1920, 1080 ]
  channels?: string; // Channel layout string (2 for stereo)
}
```

### AudioTracks

```javascript
interface AudioTracks {
  language: string; // Audio language
  name: string; // Display name of audio track
  default?: boolean; // When true this is the default track to use
  enforceAudioGroupId?: string; // Enforce to use this audio group Id
}
```

### SubtitleTracks

```javascript
interface SubtitleTracks {
  language: string; // Subtitle language
  name: string; // Display name of subtitle track
  default?: boolean; // When true this is the default track to use
}
```

### ClosedCaptions

```javascript
interface ClosedCaptions {
  id: string;
  lang: string;
  name: string;
  default?: boolean;
  auto?: boolean;
}
```

## AssetManager API

```javascript
interface IAssetManager {
  // Called when a next VOD is about to be queued up
  getNextVod: (vodRequest: VodRequest) => Promise<VodResponse>;
  // Called when a VOD could not be played out
  handleError?: (err: string, vodResponse: VodResponse) => void;
}
```

### VodRequest

```javascript
interface VodRequest {
  sessionId: string; // Viewer session Id
  category?: string; // Extra query param from playback url, e.g. /master.m3u8?category=foo
  playlistId: string; // Channel Id from playback url e.g. /channels/<playlistId>/master.m3u8
}
```

### VodResponse

```javascript
interface VodResponse {
  title: string; // Title of VOD
  id: string; // Id of VOD
  uri: string: // URL to HLS manifest for the VOD
  offset?: number: // Scheduled offset of VOD
  diffMs?: number: // Diff in ms from schedule
  desiredDuration?: number; // Desired duration in sec when trimming a VOD
  startOffset?: number; // Desired start offset in sec when trimming a VOD
  type?: string; // Set to 'gap' when there is a gap in the schedule that should be filled
  currentMetadata?: VodResponseMetadata; // VOD metadata inserted as DATERANGE tag
  timedMetadata?: VodTimedMetadata; // Timed metadata as DATERANGE tags
  unixTs?: number; // Wall-clock start time of the VOD as unix TS. 
                   // If set a PDT is added to each segment
}
```

### VodResponseMetadata

```javascript
interface VodResponseMetadata {
  id: string; // Asset Id
  title: string; // Title
}
```

### VodTimedMetadata

```javascript
interface {
  'start-date': string;
  'x-scheduled-end': string;
  'x-title'?: string;
  'x-channelid'?: string;
  'class': string;
}
```
