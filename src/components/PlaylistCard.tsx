import { ResponseError } from "../types";
import ButtonLink from "./ButtonLink";

interface PlaylistCardProps {
  coverImage: string;
  title: string;
  author: string;
  errorState: ResponseError | null;
}

// TODO: Update this component to respond to error props
function PlaylistCard({
  title,
  author,
  coverImage,
  errorState,
}: PlaylistCardProps) {
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
            src={coverImage}
            alt=""
            className="max-w-32 rounded-l-md object-cover"
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
