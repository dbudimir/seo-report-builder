import fs from "fs";
import fastcsv from "fast-csv";

const toCapitalCase = (str) => {
  const words = str.split("_");
  const capitalizedWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1)
  );
  return capitalizedWords.join(" ");
};

async function addReportNameColumn(filePath, outputPath = filePath) {
  try {
    const rows = [];
    const filename = filePath.split("/").pop().split(".")[0];
    const reportName = toCapitalCase(filename);

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(fastcsv.parse({ headers: true }))
        .on("data", (row) => {
          row["report name"] = reportName;
          rows.push(row);
        })
        .on("end", () => resolve())
        .on("error", (error) => reject(error));
    });

    await fastcsv.writeToPath(outputPath, rows, {
      headers: true,
    });

    console.log('Column "report name" added!');
  } catch (error) {
    console.error("Error adding column:", error);
  }
}

export default addReportNameColumn;
