const path = require("path");
const fs = require("fs");

async function manageFile(file, client) {
  const ext = path.extname(file.filename);
  const {
    rows: [media],
  } = await client.query(
    "INSERT INTO media (filename) VALUES (concat(uuid_generate_v4(), cast($1 as text))) RETURNING filename",
    [ext]
  );

  const inStream = file.createReadStream();
  const outStream = fs.createWriteStream(`./medias/${media.filename}`);
  await new Promise((resolve, reject) => {
    inStream.pipe(outStream).on("finish", resolve).on("error", reject);
  });
  console.log(media);
  return media.filename;
}

module.exports = {
  manageFile,
};
