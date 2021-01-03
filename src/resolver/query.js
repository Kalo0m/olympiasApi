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
    let { rows: response } = await client.query(
      'SELECT *, media_id as "medias", end_date as "endDate",start_date as "startDate"  FROM event'
    );
    response = response.map(async (event) => {
      const users = await client.query(
        "select firstname, lastname from student, eventuserrelation where student.id = userid and eventid = $1",
        [event.id]
      );
      return { ...event, participants: users.rows };
    });
    response = await Promise.all(response);
    console.log(response);
    console.log({ ok: response[0].startDate });
    return response;
  }),
  getAllos: withClient(async (_, __, { client }) => {
    const { rows: allos } = await client.query(
      'SELECT *, media_id as "mediaId" from allo where available = true'
    );
    console.log(allos);
    return allos;
  }),
  getAllAllos: withClient(async (_, __, { client }) => {
    const { rows: allos } = await client.query(
      'SELECT *, media_id as "mediaId" from allo'
    );

    console.log(allos);
    return allos;
  }),
};
