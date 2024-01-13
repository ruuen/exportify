import { useState } from "react";
import PlaylistCard from "./PlaylistCard";

const testPlaylistData = [
  {
    name: "Test Playlist One",
    author: "maxruuen",
    image:
      "https://images.unsplash.com/photo-1704714673347-113cfe46485e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=300&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTcwNDg1NjkxNA&ixlib=rb-4.0.3&q=80&w=300",
  },
  {
    name: "Test Playlist Two",
    author: "maxruuen",
    image:
      "https://plus.unsplash.com/premium_photo-1684262423213-30b0fdc3d513?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=300&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTcwNTExODgxOQ&ixlib=rb-4.0.3&q=80&w=300",
  },
  {
    name: "Test Playlist Three",
    author: "maxruuen",
    image:
      "https://images.unsplash.com/photo-1703934810573-a24c0db7d7e8?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=300&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTcwNTExODg2MA&ixlib=rb-4.0.3&q=80&w=300",
  },
  {
    name: "Test Playlist Four",
    author: "maxruuen",
    image:
      "https://images.unsplash.com/photo-1703797967065-539818bc9770?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=300&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTcwNTEyMjcxMg&ixlib=rb-4.0.3&q=80&w=300",
  },
];

function PrivatePlaylistView() {
  const [playlists, setPlaylists] = useState(testPlaylistData);

  const playlistElements = playlists.map((playlist, index) => (
    <li key={index}>
      <PlaylistCard
        coverImage={playlist.image}
        title={playlist.name}
        author={playlist.author}
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
