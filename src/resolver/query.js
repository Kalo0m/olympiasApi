const { pool, withClient } = require("../database.js");

/*
    event state : 
        0 --> idea
        1 --> incoming
        2 --> finish
*/
module.exports = {
  getDisplayedEvent: withClient(async (_, __, { client }) => {
    console.log("ok");
    const { rows: response } = await client.query(
      'SELECT *,media_id as "medias", end_date as "endDate" ,start_date as "startDate"  FROM event'
    );
    console.log(response);
    console.log({ ok: response[0].startDate });
    return response;
  }),
};
