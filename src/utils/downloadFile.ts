import { FileFormat, PlaylistData, PlaylistItem } from "../types";

/** Create and download a file from playlist response data. */
function downloadFile(
  data: PlaylistData,
  fileFormat: FileFormat,
  fileName: string
): void {
  // Process input data and attach returned blob to window
  const parsedBlob = processDataToBlob(data, fileFormat);
  const url = window.URL.createObjectURL(parsedBlob);

  // Configure temp link element
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.${fileFormat}`;

  // Trigger file download
  document.body.appendChild(link);
  link.click();

  // Cleanup when finished
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
}

/** Take playlist data, parse into desired file format, return a blob of parsed data with assigned file format type.*/
function processDataToBlob(data: PlaylistData, fileFormat: FileFormat): Blob {
  switch (fileFormat) {
    // CSV files need a header row, and each track gets flattened into a single formatted string with new line chars
    case "csv":
      const fileHeader = `Title,Artists,Album\n`;
      let fileData = "";

      for (let i = 0; i < data.length; i++) {
        fileData += `${parseTrackToCSV(data[i].track)}`;
        if (i !== data.length - 1) fileData += "\n";
      }

      return new Blob([fileHeader, fileData], { type: "text/csv" });
    // JSON files get flattened to a simpler structure
    case "json":
      const mappedData = data.map((item) => {
        return {
          name: item.track.name,
          album: item.track.album.name,
          artists: item.track.artists,
        };
      });
      return new Blob([JSON.stringify(mappedData)], {
        type: "application/json",
      });

    default:
      throw new Error("Correct file format not provided.");
  }
}

/** Parse a single track object to a combined CSV string. Handles escaping values within each column. */
function parseTrackToCSV(track: PlaylistItem): string {
  // Find any double quotes in string for escaping
  const doubleQuoteRegex: RegExp = /"/g;

  // Escape quotes in track and album name
  const trackName = track.name.replace(doubleQuoteRegex, `""`);
  const albumName = track.album.name.replace(doubleQuoteRegex, `""`);

  // Reduce artists array to a single CSV string and escape quotes in each artist value
  let artistNames = "";
  for (let x = 0; x < track.artists.length; x++) {
    const artist = track.artists[x];
    artistNames += artist.name.replace(doubleQuoteRegex, `""`);
    // Don't add a comma after the last artist
    if (x !== track.artists.length - 1) artistNames += `, `;
  }

  const csvString = `"${trackName}","${artistNames}","${albumName}"`;
  return csvString;
}

export default downloadFile;
