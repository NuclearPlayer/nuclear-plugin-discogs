export type LastfmArtist = {
  artist: {
    name: string;
    bio?: { content: string };
    tags?: { tag: { name: string }[] };
  };
};

export type LastfmAlbum = {
  album: {
    tracks?: {
      track:
        | { name: string; duration: string }[]
        | { name: string; duration: string };
    };
  };
};

const LASTFM_API_KEY = atob('MmI3NWRjYjI5MWUyYjBjOWEyYzk5NGFjYTUyMmFjMTQ=');
const LASTFM_API = 'https://ws.audioscrobbler.com/2.0';

const lastfmFetch = <T>(
  method: string,
  params: Record<string, string>,
): Promise<T> =>
  fetch(
    `${LASTFM_API}?${new URLSearchParams({ method, api_key: LASTFM_API_KEY, format: 'json', ...params })}`,
  ).then((r) => r.json());

export const getArtistInfo = (artist: string): Promise<LastfmArtist> =>
  lastfmFetch('artist.getInfo', { artist });

export const getAlbumInfo = (
  artist: string,
  album: string,
): Promise<LastfmAlbum> => lastfmFetch('album.getInfo', { artist, album });
