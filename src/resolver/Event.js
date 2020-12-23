const { withClient } = require("../database");

module.exports = {
  // medias: [String]!
  medias: withClient(async ({ id }, _, { client }) => {
    console.log("media");
    const {
      rows: medias,
    } = await client.query(
      "SELECT media_id AS filename FROM product_media WHERE product_id=$1",
      [id]
    );
    return medias[0].filename;
  }),
};
