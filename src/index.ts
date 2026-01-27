import type {
  Album,
  AlbumRef,
  Artist,
  ArtistRef,
  MetadataProvider,
  NuclearPlugin,
  NuclearPluginAPI,
  SearchParams,
} from '@nuclearplayer/plugin-sdk';

import * as discogs from './discogs';
import * as lastfm from './lastfm';
import {
  mapAlbumDetails,
  mapArtistDetails,
  mapArtistReleaseToAlbumRef,
  mapDiscogsArtistToRef,
  mapDiscogsMasterToAlbumRef,
} from './mappers';

const PROVIDER_ID = 'discogs';

const createProvider = (): MetadataProvider =>
  ({
    id: PROVIDER_ID,
    kind: 'metadata',
    name: 'Discogs',
    searchCapabilities: ['artists', 'albums'],
    artistMetadataCapabilities: ['artistDetails', 'artistAlbums'],
    albumMetadataCapabilities: ['albumDetails'],
    searchArtists: async (
      params: Omit<SearchParams, 'types'>,
    ): Promise<ArtistRef[]> => {
      const data = await discogs.searchArtists(
        params.query,
        params.limit ?? 15,
      );
      return data.results.map(mapDiscogsArtistToRef);
    },
    searchAlbums: async (
      params: Omit<SearchParams, 'types'>,
    ): Promise<AlbumRef[]> => {
      const data = await discogs.searchMasters(
        params.query,
        params.limit ?? 15,
      );
      return data.results.map(mapDiscogsMasterToAlbumRef);
    },
    fetchArtistDetails: async (id: string): Promise<Artist> => {
      const discogsArtist = await discogs.getArtist(id);
      const lastfmArtist = await lastfm.getArtistInfo(discogsArtist.name);
      return mapArtistDetails(discogsArtist, lastfmArtist);
    },
    fetchAlbumDetails: async (id: string): Promise<Album> => {
      const [type, discogsId] = id.split(':');
      const discogsAlbum =
        type === 'master'
          ? await discogs.getMaster(discogsId)
          : await discogs.getRelease(discogsId);
      const artistName = discogsAlbum.artists[0]?.name ?? '';
      const lastfmAlbum = await lastfm.getAlbumInfo(
        artistName,
        discogsAlbum.title,
      );
      return mapAlbumDetails(discogsAlbum, lastfmAlbum, type);
    },
    fetchArtistAlbums: async (id: string): Promise<AlbumRef[]> => {
      const data = await discogs.getArtistReleases(id);
      return data.releases
        .filter((r) => r.type === 'master')
        .map(mapArtistReleaseToAlbumRef);
    },
  }) as MetadataProvider;

const plugin: NuclearPlugin = {
  onLoad() {},

  onEnable(api: NuclearPluginAPI) {
    api.Providers.register(createProvider());
  },

  onDisable() {},

  onUnload() {},
};

export default plugin;
