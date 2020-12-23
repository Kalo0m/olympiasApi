const { pool, withClient } = require("../database.js");
const { ApolloError } = require("apollo-server");
const { manageFile } = require("../file.js");
module.exports = {
  login: withClient(async (_, { login, password }, { client }) => {
    console.log("login");
    const {
      rows: response,
    } = await client.query(
      "SELECT name FROM admin WHERE password is NOT NULL AND password = crypt($1,password) AND name = $2;",
      [password, login]
    );
    if (!response || response.length === 0)
      throw new ApolloError(
        "login or password incorrect",
        "USER_DOES_NOT_EXIST"
      );
    console.log(response);
    return response[0];
  }),
  saveEvents: withClient(async (_, { events }, { client }) => {
    console.log("save");
    console.log(events);
    events.forEach((event) => console.log(new Date(parseInt(event.startDate))));
    const promises = events.map((event) => {
      return client.query(
        "update event set description = $1, name = $2, place = $3, state = $4, organizer = $5, start_date = TO_TIMESTAMP($6), end_date = TO_TIMESTAMP($7) where id = $8",
        [
          event.description,
          event.name,
          event.place,
          event.state,
          event.organizer,
          event.startDate / 1000 + 3600,
          event.endDate / 1000 + 3600,
          event.id,
        ]
      );
    });
    let res = false;
    await Promise.all(promises)
      .then(() => {
        res = true;
      })
      .catch((err) => {
        console.log({ err });
        throw new ApolloError(
          "La sauvegarde des données a échoué" + err,
          "SAVE_ERROR"
        );
      });
    return res;
  }),
  addEvent: withClient(async (_, { event }, { client }) => {
    console.log("add");
    console.log(event);
    try {
      if (event.medias) {
        const filesResolved = await event.medias;
        const filename = await manageFile(filesResolved, client);
        console.log("ok : " + filename);
        await client.query(
          "INSERT INTO EVENT (description, name, place, state, organizer, start_date, end_date, media_id) values ($1,$2,$3,$4,$5,TO_TIMESTAMP($6),TO_TIMESTAMP($7),$8)",
          [
            event.description,
            event.name,
            event.place,
            event.state,
            event.organizer,
            event.startDate,
            event.endDate,
            filename,
          ]
        );
        return filename;
      } else {
        await client.query(
          "INSERT INTO EVENT (description, name, place, state, organizer, start_date, end_date) values ($1,$2,$3,$4,$5,TO_TIMESTAMP($6),TO_TIMESTAMP($7))",
          [
            event.description,
            event.name,
            event.place,
            event.state,
            event.organizer,
            event.startDate,
            event.endDate,
          ]
        );
      }
    } catch (err) {
      console.log(err);
      throw new ApolloError("Erreur lors de l'ajout");
    }
    return true;
  }),
};
