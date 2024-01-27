import { PlaylistImage, ResponseError } from "../types";
import imgPlaceholderCover from "../assets/placeholder-cover.webp";
import Button from "./Button";
import useExporter from "../hooks/useExporter";

interface PlaylistCardProps {
  /** Playlist ID passed as prop and used in API queries during export process when either button is clicked. */
  playlistId: string;
  /**
   * Images array returned for playlist from API will have varying items inside them.
   * (https://developer.spotify.com/documentation/web-api/concepts/playlists#using-playlist-images)
   * If playlist has 0 songs, no images are returned.
   * If playlist has a custom image applied, one image will be returned with null width/height props.
   * If playlist has 1 to 3 tracks or has tracks from less than 4 different albums, one 640x640 image will be returned.
   * If playlist has tracks from 4 or more albums, up to 4 images will be returned, varying from 640x640; 300x300; 60x60.
   * Largest image returned at first index in response array.
   */
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

function PlaylistCard({
  playlistId,
  title,
  author,
  coverImages,
  errorState,
}: PlaylistCardProps) {
  const {
    getFullPlaylist,
    isLoading,
    errorState: dataErrorState,
  } = useExporter(playlistId);

  const activeCoverImage =
    coverImages.length > 0 ? coverImages[0] : placeholderCoverImage;

  return (
    <article className="flex max-w-md h-full min-h-36 md:max-w-none mx-auto bg-slate-800 border border-slate-700 rounded-md shadow-lg">
      {errorState && <CardError message={errorState.message} />}
      {!errorState && (
        <CardDisplay
          coverImage={activeCoverImage}
          title={title}
          author={author}
          handleClick={getFullPlaylist}
          isLoading={isLoading}
          btnError={dataErrorState}
        />
      )}
    </article>
  );
}

interface CardDisplayProps {
  coverImage: PlaylistImage;
  title: string;
  author: string;
  handleClick: () => void;
  isLoading: boolean;
  btnError: ResponseError | null;
}

function CardDisplay({
  coverImage,
  title,
  author,
  handleClick,
  isLoading,
  btnError,
}: CardDisplayProps) {
  return (
    <>
      <img
        src={coverImage.url}
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

        {!btnError && (
          <ul className="flex flex-wrap gap-2 mt-auto">
            <li>
              <Button
                text="CSV"
                isLoading={isLoading}
                colourScheme="light"
                onClick={handleClick}
              />
            </li>
            <li>
              <Button
                text="JSON"
                isLoading={isLoading}
                colourScheme="light"
                onClick={handleClick}
              />
            </li>
          </ul>
        )}
        {btnError && (
          <div className="flex flex-wrap gap-2 mt-auto justify-between items-center">
            <p>{btnError.message}</p>
            <Button text="Reset" colourScheme="light" />
          </div>
        )}
      </div>
    </>
  );
}

interface CardErrorProps {
  message: string;
}

function CardError({ message }: CardErrorProps) {
  return (
    <div className="flex flex-1 gap-3 items-center">
      <img
        src={placeholderCoverImage.url}
        alt=""
        className="max-w-32 h-full rounded-l-md object-cover"
        width={300}
        height={300}
      />
      <div className="space-y-2 px-2">
        <p className="text-lg text-slate-100">{message}</p>
        <p>Please try again...</p>
      </div>
    </div>
  );
}

export default PlaylistCard;
