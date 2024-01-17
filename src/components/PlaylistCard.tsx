import { PlaylistImage, ResponseError } from "../types";
import ButtonLink from "./ButtonLink";
import imgPlaceholderCover from "../assets/placeholder-cover.jpg";

interface PlaylistCardProps {
  coverImages: Array<PlaylistImage>;
  title: string;
  author: string;
  errorState: ResponseError | null;
}

const placeholderCoverImage = {
  width: 300,
  height: 300,
  url: imgPlaceholderCover,
};

// Images info returned for playlist from API will have varying items inside
// https://developer.spotify.com/documentation/web-api/concepts/playlists#using-playlist-images
// If playlist has 0 songs, no images are returned
// If playlist has a custom image applied, one image will be returned with null width/height props
// If playlist has 1 to 3 tracks or has tracks from less than 4 different albums, one 640x640 image will be returned
// If playlist has tracks from 4 or more albums, up to 4 images will be returned, varying from 640x640; 300x300; 60x60.
// Largest image returned at first index in response array
function PlaylistCard({
  title,
  author,
  coverImages,
  errorState,
}: PlaylistCardProps) {
  const activeCoverImage =
    coverImages.length > 0 ? coverImages[0] : placeholderCoverImage;

  return (
    <article className="flex max-w-md h-full min-h-32 md:max-w-none mx-auto bg-slate-800 border border-slate-700 rounded-md shadow-lg">
      {errorState && (
        <div className="p-5 m-auto text-center text-xl">
          <p>{errorState.error.message}</p>
        </div>
      )}
      {!errorState && (
        <>
          <img
            src={activeCoverImage.url}
            alt=""
            className="max-w-32  h-auto rounded-l-md object-cover"
            width={300}
            height={300}
          />
          <div className="flex flex-1 p-5 flex-col gap-3">
            <div>
              <h4 className="font-medium text-slate-100">{title}</h4>
              <a
                className="break-all hover:text-slate-100 transition-colors"
                href="#"
              >
                @{author}
              </a>
            </div>
            <ul className="flex flex-wrap gap-2 mt-auto">
              <li>
                <ButtonLink text="CSV" href="#" colourScheme="light" />
              </li>
              <li>
                <ButtonLink text="JSON" href="#" colourScheme="light" />
              </li>
            </ul>
          </div>
        </>
      )}
    </article>
  );
}

export default PlaylistCard;
