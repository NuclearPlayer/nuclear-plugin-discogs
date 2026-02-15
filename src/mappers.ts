import type {
  Album,
  AlbumRef,
  ArtistBio,
  ArtistRef,
} from '@nuclearplayer/plugin-sdk';

import type {
  DiscogsArtist,
  DiscogsArtistRelease,
  DiscogsMaster,
  DiscogsSearchItem,
} from './discogs';
import type { LastfmAlbum, LastfmArtist } from './lastfm';

const PROVIDER_ID = 'discogs';

export const mapDiscogsArtistToRef = (item: DiscogsSearchItem): ArtistRef => ({
  name: item.title,
  artwork: item.thumb ? { items: [{ url: item.thumb }] } : undefined,
  source: { provider: PROVIDER_ID, id: String(item.id) },
});

export const mapDiscogsMasterToAlbumRef = (
  item: DiscogsSearchItem,
): AlbumRef => {
  const [artist, ...titleParts] = item.title.split(' - ');
  return {
    title: titleParts.join(' - '),
    artists: [{ name: artist, source: { provider: PROVIDER_ID, id: '' } }],
    artwork: item.thumb ? { items: [{ url: item.thumb }] } : undefined,
    source: { provider: PROVIDER_ID, id: `master:${item.id}` },
  };
};

export const mapArtistDetails = (
  discogs: DiscogsArtist,
  lastfm: LastfmArtist,
): ArtistBio => ({
  name: discogs.name,
  bio: lastfm.artist.bio?.content,
  artwork: discogs.images?.[0]
    ? { items: [{ url: discogs.images[0].uri }] }
    : undefined,
  tags: lastfm.artist.tags?.tag.map((t) => t.name),
  source: { provider: PROVIDER_ID, id: String(discogs.id) },
});

const parseDiscogsDuration = (duration: string): number | undefined => {
  const [mins, secs] = duration.split(':').map(Number);
  return mins && secs !== undefined ? (mins * 60 + secs) * 1000 : undefined;
};

export const mapAlbumDetails = (
  discogs: DiscogsMaster,
  lastfm: LastfmAlbum,
  idPrefix: string,
): Album => {
  const lastfmTracks = Array.isArray(lastfm.album.tracks?.track)
    ? lastfm.album.tracks.track
    : lastfm.album.tracks?.track
      ? [lastfm.album.tracks.track]
      : [];

  return {
    title: discogs.title,
    artists: discogs.artists.map((a) => ({
      name: a.name,
      roles: [],
      source: { provider: PROVIDER_ID, id: String(a.id) },
    })),
    releaseDate: discogs.year
      ? { precision: 'year', dateIso: String(discogs.year) }
      : undefined,
    genres: [...discogs.genres, ...discogs.styles],
    artwork: discogs.images?.[0]
      ? { items: [{ url: discogs.images[0].uri }] }
      : undefined,
    tracks: discogs.tracklist.map((t, i) => {
      const lastfmTrack = lastfmTracks.find(
        (lt) => lt.name.toLowerCase() === t.title.toLowerCase(),
      );
      const durationMs =
        parseDiscogsDuration(t.duration) ||
        (lastfmTrack ? Number(lastfmTrack.duration) * 1000 : undefined);
      return {
        title: t.title,
        artists: discogs.artists.map((a) => ({
          name: a.name,
          source: { provider: PROVIDER_ID, id: String(a.id) },
        })),
        source: { provider: PROVIDER_ID, id: `${idPrefix}:${discogs.id}:${i}` },
        durationMs,
      };
    }),
    source: { provider: PROVIDER_ID, id: `${idPrefix}:${discogs.id}` },
  };
};

export const mapArtistReleaseToAlbumRef = (
  release: DiscogsArtistRelease,
): AlbumRef => ({
  title: release.title,
  artwork: release.thumb ? { items: [{ url: release.thumb }] } : undefined,
  source: { provider: PROVIDER_ID, id: `${release.type}:${release.id}` },
});
