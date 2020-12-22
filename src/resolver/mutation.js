const { pool, withClient } = require("../database.js");
const { ApolloError } = require("apollo-server");
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
    const promises = events.map((event) => {
      return client.query(
        "update event set description = $1, name = $2, place = $3, state = $4, organizer = $5, start_date = TO_TIMESTAMP($6), end_date = TO_TIMESTAMP($7) where id = $8",
        [
          event.description,
          event.name,
          event.place,
          event.state,
          event.organizer,
          event.startDate / 1000,
          event.endDate / 1000,
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
};
