import fs from "fs";
import path from "path";
import fastcsv from "fast-csv";

import addReportNameColumn from "./helpers/add-report-name-col.js";

const folderPath = "issue-reports/queen-ballers-test"; // Replace with your target folder

const getFiles = async (folderPath) => {
  // Takes a callback function
  let files = [];

  return await new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, filenames) => {
      const csvFiles = filenames.filter(
        (file) => path.extname(file).toLowerCase() === ".csv"
      );

      const csvFilePaths = csvFiles.map((csvFile) => {
        return path.join(folderPath, csvFile);
      });

      return resolve(csvFilePaths);
    });
  });
};

const processFiles = async (files) => {
  console.log("Processing files...");
  console.log(files);
  for (const file of files) {
    await addReportNameColumn(file);
  }
};

async function mergeCSVFilesWithHeaderHandling(inputFiles, outputFile) {
  const rows = [];
  const allHeaders = new Set();

  const processFile = async (filePath) => {
    // Wrap the stream processing in a Promise
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(fastcsv.parse({ headers: true }))
        .on("data", (row) => {
          Object.keys(row).forEach((header) => allHeaders.add(header));
          rows.push(row);
        })
        .on("error", reject)
        .on("end", resolve);
    });

    // Processing complete, continue with next steps if any
    console.log("CSV processing completed.");
    return { headers: Array.from(allHeaders), rows };
  };

  // Process all files sequentially
  for (const file of inputFiles) {
    await processFile(file);
  }

  // Write combined data with all headers
  await fastcsv.writeToPath(outputFile, rows, {
    headers: Array.from(allHeaders),
  });

  console.log("CSV files merged with headers!");
}

const buildReport = async () => {
  const allFiles = await getFiles(folderPath);

  console.log(allFiles);

  await processFiles(allFiles);

  mergeCSVFilesWithHeaderHandling(allFiles, "merged_data.csv");
};

buildReport();

// Usage Example

// getFiles(folderPath)
