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
    return response;
  }),
  getAllos: withClient(async (_, __, { client }) => {
    const { rows: allos } = await client.query(
      'SELECT *, media_id as "mediaId" from allo where available = true'
    );
    const promises = allos.map(async (a) => {
      const {
        rows: allos,
      } = await client.query("SELECT * from option where allo_id = $1", [a.id]);
      console.log(a);
      return {
        ...a,
        options: allos,
      };
    });
    console.log(allos);
    const allosRes = await Promise.all(promises);
    console.log(allosRes);
    return allosRes;
  }),
  getAllAllos: withClient(async (_, __, { client }) => {
    const { rows: allos } = await client.query(
      'SELECT *, media_id as "mediaId" from allo'
    );
    const promises = allos.map(async (a) => {
      const {
        rows: allos,
      } = await client.query("SELECT * from option where allo_id = $1", [a.id]);
      console.log(a);
      return {
        ...a,
        options: allos,
      };
    });
    console.log(allos);
    const allosRes = await Promise.all(promises);
    console.log(allosRes);
    return allosRes;
  }),
  getCommandes: withClient(async (_, __, { client }) => {
    const { rows: commandes } = await client.query(
      'SELECT *, allo_id as "alloId", created_at as "createdAt" from commande'
    );
    const promises = commandes.map(async (c) => {
      const {
        rows: allos,
      } = await client.query(
        'SELECT *, media_id as "mediaId" from allo where id = $1',
        [c.alloId]
      );
      console.log(c);
      const {
        rows: option,
      } = await client.query("SELECT * from option where id = $1", [
        c.option_id,
      ]);
      console.log(option);
      return {
        ...c,
        option: option.length !== 0 ? option[0].name : null,
        allo: allos[0],
      };
    });
    const commandesRes = await Promise.all(promises);
    console.log(commandesRes);
    return commandesRes;
  }),
};
