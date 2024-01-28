import { useState } from "react";
import PlaylistCard from "./PlaylistCard";
import { Playlist } from "../types";

// TODO: Remove this when build out of PrivatePlaylistView starts/
// was using this for some UI testing
const testPlaylistData: Array<Playlist> = [
  {
    id: "test",
    name: "Test Playlist One",
    external_urls: {
      spotify: "https://spotify.com",
    },
    owner: {
      display_name: "maxruuen",
      external_urls: {
        spotify: "https://spotify.com",
      },
    },
    tracks: {
      total: 999,
    },
    images: [
      {
        width: 300,
        height: 300,
        url: "https://images.unsplash.com/photo-1704714673347-113cfe46485e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=300&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTcwNDg1NjkxNA&ixlib=rb-4.0.3&q=80&w=300",
      },
    ],
  },
];

// TODO: Build private playlist view out
function PrivatePlaylistView() {
  const [playlists] = useState(testPlaylistData);

  const playlistElements = playlists.map((playlist, index) => (
    <li key={index}>
      <PlaylistCard
        playlistId={playlist.id}
        coverImages={playlist.images}
        title={playlist.name}
        author={playlist.owner.display_name}
        errorState={null}
      />
    </li>
  ));

  return (
    <>
      {playlistElements.length > 0 ? (
        <ul className="space-y-5 md:space-y-0 md:grid md:grid-cols-2 md:grid-flow-row md:auto-rows-min md:gap-5 lg:grid-cols-3">
          {playlistElements}
        </ul>
      ) : (
        <p className="md:w-fit mx-auto py-14 px-12 bg-slate-800 border border-slate-700 rounded-md shadow-lg text-2xl text-center">
          No playlists found...
        </p>
      )}
    </>
  );
}

export default PrivatePlaylistView;
