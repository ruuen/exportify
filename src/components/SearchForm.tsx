import { useForm } from "react-hook-form";
import { SearchFormInputs } from "../types";
import Button from "./Button";

interface SearchFormProps {
  handlePlaylistSearch: (data: SearchFormInputs) => void;
}

function SearchForm({ handlePlaylistSearch }: SearchFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormInputs>();

  return (
    <form
      action="get"
      autoComplete="off"
      onSubmit={handleSubmit(handlePlaylistSearch)}
      className="p-5 max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-md shadow-lg"
    >
      <label className="sr-only" htmlFor="playlistUrl">
        Public playlist to export
      </label>
      <div className="space-y-3">
        <input
          type="text"
          {...register("playlistUrl", {
            required:
              "Field is empty; please enter a valid Spotify playlist URL.",
          })}
          placeholder="Enter a public playlist URL..."
          className="block w-full py-2 px-3 bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-700 rounded-md"
        />

        <Button
          type="submit"
          text="Find..."
          colourScheme="light"
          isFullWidth={true}
        />
      </div>
      {errors.playlistUrl && (
        <span className="block mt-3">{errors.playlistUrl.message}</span>
      )}
    </form>
  );
}

export default SearchForm;
