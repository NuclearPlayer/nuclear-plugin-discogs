export type DiscogsSearchItem = {
  id: number;
  title: string;
  thumb: string;
};

export type DiscogsSearchResult = {
  results: DiscogsSearchItem[];
};

export type DiscogsArtist = {
  id: number;
  name: string;
  profile: string;
  images?: { uri: string }[];
};

export type DiscogsMaster = {
  id: number;
  title: string;
  year: number;
  artists: { id: number; name: string }[];
  genres: string[];
  styles: string[];
  images?: { uri: string }[];
  tracklist: { position: string; title: string; duration: string }[];
};

export type DiscogsRelease = DiscogsMaster;

export type DiscogsArtistRelease = {
  id: number;
  type: 'master' | 'release';
  title: string;
  thumb: string;
  year: number;
};

export type DiscogsArtistReleases = {
  releases: DiscogsArtistRelease[];
};

const DISCOGS_TOKEN = atob(
  'UURVZUZPWk53SXdPZVBseHBWemlFSHphbWhiSUhVZGZFTkFKVG5MUg==',
);
const DISCOGS_API = 'https://api.discogs.com';

const discogsFetch = <T>(endpoint: string): Promise<T> =>
  fetch(`${DISCOGS_API}${endpoint}`, {
    headers: { Authorization: `Discogs token=${DISCOGS_TOKEN}` },
  }).then((r) => r.json());

export const searchArtists = (
  query: string,
  limit: number,
): Promise<DiscogsSearchResult> =>
  discogsFetch(
    `/database/search?type=artist&q=${encodeURIComponent(query)}&per_page=${limit}`,
  );

export const searchMasters = (
  query: string,
  limit: number,
): Promise<DiscogsSearchResult> =>
  discogsFetch(
    `/database/search?type=master&q=${encodeURIComponent(query)}&per_page=${limit}`,
  );

export const getArtist = (id: string): Promise<DiscogsArtist> =>
  discogsFetch(`/artists/${id}`);

export const getMaster = (id: string): Promise<DiscogsMaster> =>
  discogsFetch(`/masters/${id}`);

export const getRelease = (id: string): Promise<DiscogsRelease> =>
  discogsFetch(`/releases/${id}`);

export const getArtistReleases = (id: string): Promise<DiscogsArtistReleases> =>
  discogsFetch(`/artists/${id}/releases?sort=year&sort_order=desc`);
