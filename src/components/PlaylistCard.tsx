import ButtonLink from "./ButtonLink";

interface PlaylistCardProps {
  coverImage: string;
  title: string;
  author: string;
}

function PlaylistCard({ title, author, coverImage }: PlaylistCardProps) {
  return (
    <article className="flex max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-md shadow-lg">
      <img
        src={coverImage}
        alt=""
        className="max-w-32 rounded-l-md object-cover"
      />
      <div className="flex-1 p-5 space-y-3">
        <h4 className="font-medium text-slate-100">{title}</h4>
        <a
          className="break-all hover:text-slate-100 transition-colors"
          href="#"
        >
          @{author}
        </a>
        <ul className="flex flex-wrap gap-2">
          <li>
            <ButtonLink text="CSV" href="#" colourScheme="light" />
          </li>
          <li>
            <ButtonLink text="JSON" href="#" colourScheme="light" />
          </li>
        </ul>
      </div>
    </article>
  );
}

export default PlaylistCard;
