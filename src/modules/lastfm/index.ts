import { RESTDataSource } from '@apollo/datasource-rest';

interface LastFmApiOptions {
  lastFmUser: string
}

class LastFMApi extends RESTDataSource {
  baseURL = 'http://ws.audioscrobbler.com/2.0/';
  lastFmUser = process.env.LASTFM_USER;

  willSendRequest(_path, request) {
    request.headers['User-Agent'] = `Me-Api/5.0.0 (${process.env.DOMAIN})`;
    request.params.set('api_key', process.env.LASTFM_API_KEY);
    request.params.set('username', this.lastFmUser);
    request.params.set('format', 'json');
  }

  async getArtistInfo(artist: string) {
    try {
      const artistInfo = await this.get(`?method=artist.getinfo&artist=${artist}`);

      if (artistInfo.error) {
        return {
          url: '',
          name: artist,
          image: '',
          playedCount: 0
        }
      }
  
      return {
        url: artistInfo.artist.url,
        name: artistInfo.artist.name,
        image: artistInfo.artist.image[3]['#text'],
        playedCount: (artistInfo.artist.stats.userplaycount) ? artistInfo.artist.stats.userplaycount : 0,
      }
    } catch (error) {
      console.log({error});
      return {
        url: '',
        name: artist,
        image: '',
        playedCount: 0
      }
    }
  }

  async getAlbumInfo(album: string, artist: string) {
    try {
      const albumInfo = await this.get(`?method=album.getinfo&artist=${artist}&album=${album}`);
  
      if (albumInfo.error) {
        return {
          url: '',
          name: 'Unknown',
          image: '',
          playedCount: 0
        }
      }
  
      return {
        url: albumInfo.album.url,
        name: albumInfo.album.name,
        image: albumInfo.album.image[3]['#text'],
        playedCount: (albumInfo.album.userplaycount) ? albumInfo.album.userplaycount : 0,
      }
    } catch (error) {
      console.log({error});
      return {
        url: '',
        name: 'Unknown',
        image: '',
        playedCount: 0
      }
    }
  }

  async getTrackInfo(track: string, artist: string) {
    try {
      const trackInfo = await this.get(`?method=track.getinfo&artist=${artist}&track=${track}`);
  
      if (trackInfo.error) {
        return {
          url: '',
          name: track,
          image: '',
          playedCount: 0
        }
      }
  
      return {
        url: trackInfo.track.url,
        name: trackInfo.track.name,
        image: '',
        playedCount: (trackInfo.track.userplaycount) ? trackInfo.track.userplaycount : 0,
      }
    } catch (error) {
      console.log({error});
      return {
        url: '',
        name: track,
        image: '',
        playedCount: 0
      }
    }
  }

  async getRecentTracks() {
    const data = await this.get(`?method=user.getrecenttracks&user=${this.lastFmUser}`);

    const recentTracks = data.recenttracks.track;

    if (recentTracks.length <= 0) {
      return { error: true };
    }

    const latestTrack = data.recenttracks.track[0];
    return {
      artist: latestTrack.artist['#text'],
      album: latestTrack.album['#text'],
      track: latestTrack.name,
      isLive: latestTrack['@attr']?.nowplaying
    };
  }

  async formatLatestTrack() {
    const recentTrack = await this.getRecentTracks();

    if (recentTrack.error) {
      return {
        album: {url: '', name: '', image: '', playedCount: 0},
        artist: {url: '', name: '', image: '', playedCount: 0},
        track: {url: '', name: '', image: '', playedCount: 0},
        isLive: false
      }
    }

    const album = await this.getAlbumInfo(recentTrack.album, recentTrack.artist);
    const artist = await this.getArtistInfo(recentTrack.artist);
    const track = await this.getTrackInfo(recentTrack.track, recentTrack.artist);

    const formattedTrack = {
      album,
      artist,
      track,
      isLive: recentTrack.isLive
    };

    return formattedTrack;
  }
};

export default LastFMApi;