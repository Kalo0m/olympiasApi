const { pool, withClient } = require("../database.js");
const { ApolloError } = require("apollo-server");
const { manageFile } = require("../file.js");
const sendMail = require("../mail.js");
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
            event.startDate / 1000 + 3600,
            event.endDate / 1000 + 3600,
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
  updateEvent: withClient(async (_, { event }, { client }) => {
    try {
      client.query(
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
    } catch (err) {
      throw new ApolloError("mise à jour probleme");
    }
  }),
  updateAllo: withClient(async (_, { allo }, { client }) => {
    let filename = null;

    console.log(allo);
    if (allo.image) {
      const filesResolved = await allo.image;
      filename = await manageFile(filesResolved, client);
    }
    console.log(allo.available);
    await client.query(
      "update allo set description = $1, name = $2, available = $3, media_id = $4 where id = $5",
      [
        allo.description,
        allo.name,
        allo.available,
        filename || allo.mediaId,
        allo.id,
      ]
    );
    client.query(`Delete from option where allo_id = $1`, [allo.id]);
    const promises = allo.options.map((o) => {
      return client.query(
        `INSERT INTO option (name, allo_id) 
          VALUES ($1, $2)
          ON CONFLICT (name, allo_id) DO UPDATE 
          SET name = $1;`,
        [o, allo.id]
      );
    });
  }),
  createAllo: withClient(async (_, { allo }, { client }) => {
    let filename = null;

    console.log(allo);
    if (allo.image) {
      const filesResolved = await allo.image;
      filename = await manageFile(filesResolved, client);
    }
    console.log(allo.available);
    console.log("coucou");
    await client.query(
      "insert into allo (name, description, available, media_id) values ($1, $2, $3, $4)",
      [allo.name, allo.description, allo.available, filename]
    );
    console.log("coucou2");
    return filename;
  }),

  sendMail: withClient(async (_, { person, eventId }, { client }) => {
    console.log(person);
    const code = Math.floor(100000 + Math.random() * 900000);
    console.log(code);
    // TODO : verifier si il est pas deja inscrit à l'evenement
    const {
      rows: response2,
    } = await client.query(
      "select student.mail from student, eventuserrelation where userid = id and eventid = $1 and mail = $2",
      [eventId, person.mail]
    );

    if (response2.length !== 0) {
      throw new ApolloError(
        "Cette adresse mail est déjà inscrite à cet événement",
        "USER_ALREADY_REGISTERED"
      );
    }
    sendMail({
      email: person.mail,
      code,
    });
    const {
      rows: response,
    } = await client.query(
      "insert into student (mail, firstname, lastname, code) values ($1, $2, $3, $4) returning id",
      [person.mail, person.firstname, person.lastname, code]
    );
    console.log("id");
    console.log(response[0].id);
    return response[0].id;
  }),
  validateCode: withClient(
    async (_, { userId, codeInput, eventId }, { client }) => {
      console.log(userId);
      console.log(codeInput);
      const {
        rows: response,
      } = await client.query(
        "select code from student where id = $1 and code = $2",
        [userId, codeInput]
      );
      if (!response || response.length === 0)
        throw new ApolloError(
          "le code entré n'est pas le bon",
          "INVALIDATE_CODE"
        );

      await client.query(
        "insert into eventuserrelation (userid, eventid) values ($1, $2)",
        [userId, eventId]
      );
      client.query("update student set validate = true");
    }
  ),
  commander: withClient(async (_, { command }, { client }) => {
    console.log(command.person.option);
    if (command.person.option != null) {
      const {
        rows: response,
      } = await client.query(
        "select id from option where allo_id = $1 and name = $2",
        [command.allo.id, command.person.option]
      );
      console.log(response);
      await client.query(
        "insert into commande (firstname, lastname, place, allo_id, option_id) values($1, $2, $3, $4, $5)",
        [
          command.person.firstname,
          command.person.lastname,
          command.person.place,
          command.allo.id,
          response[0].id,
        ]
      );
    } else {
      await client.query(
        "insert into commande (firstname, lastname, place, allo_id) values($1, $2, $3, $4)",
        [
          command.person.firstname,
          command.person.lastname,
          command.person.place,
          command.allo.id,
        ]
      );
    }
  }),
  setLivre: withClient(async (_, { commandId }, { client }) => {
    console.log(commandId);
    await client.query("update commande set status = 1 where id = $1", [
      commandId,
    ]);
  }),
};
