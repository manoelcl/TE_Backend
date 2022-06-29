require("dotenv").config();

const { getConnection } = require("./db");

async function main() {
  let connection;

  try {
    connection = await getConnection();

    console.log("Dropping existing tables...");

    await connection.query(`DROP TABLE IF EXISTS vote`);
    await connection.query(`DROP TABLE IF EXISTS comment`);
    await connection.query(`DROP TABLE IF EXISTS recommendation`);
    await connection.query(`DROP TABLE IF EXISTS user`);

    console.log("Creating new ones...");

    await connection.query(`
CREATE TABLE user (
        id INT UNSIGNED AUTO_INCREMENT,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        username VARCHAR(100)NOT NULL UNIQUE,
        profile_pic VARCHAR(100),
        miniature_pic VARCHAR(100),
        description VARCHAR(300),
        role ENUM("user", "admin") DEFAULT "user" NOT NULL,
        creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    );
    `);
    console.log("user created...");
    await connection.query(`
CREATE TABLE recommendation(
    id INT UNSIGNED AUTO_INCREMENT,
    id_user INT UNSIGNED NOT NULL,
    title VARCHAR(100) NOT NULL,
    class ENUM("travel", "experience") DEFAULT "travel" NOT NULL,
    lat FLOAT NOT NULL,
    lon FLOAT NOT NULL,
    abstract VARCHAR(300) NOT NULL,
    content TINYTEXT NOT NULL,
    photo VARCHAR(100) NOT NULL,
    creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (id_user) REFERENCES user(id)
);
`);
    console.log("recommendation created...");
    await connection.query(`
CREATE TABLE comment(
    id INT UNSIGNED AUTO_INCREMENT,
    id_user INT UNSIGNED NOT NULL,
    id_recommendation INT UNSIGNED NOT NULL,
    content VARCHAR(300) NOT NULL,
    creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (id_user) REFERENCES user(id),
    FOREIGN KEY (id_recommendation) REFERENCES recommendation(id)
);
`);
    console.log("comment created...");
    await connection.query(`
CREATE TABLE vote(
    id_user INT UNSIGNED NOT NULL,
    id_recommendation INT UNSIGNED NOT NULL,
    rating INT UNSIGNED NOT NULL,
    CHECK (rating <= 5),
    creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES user(id),
    FOREIGN KEY (id_recommendation) REFERENCES recommendation(id),
    PRIMARY KEY (id_user,id_recommendation)
);
`);
    console.log("vote created...");
    await connection.query(`
CREATE TABLE staff_picks(
    id INT UNSIGNED NOT NULL,
    id_user INT UNSIGNED NOT NULL,
    creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES recommendation(id),
    PRIMARY KEY (id)
);
`);
    console.log("staff_picks created...");
    await connection.query(`
    INSERT INTO user (email, password, username, role)
    VALUES ('admin@admin.com', '$2b$08$EJN5N37hQlW7ueri.N5pdu5VLJXipfsTGCXlyS19JMI13ZHXkY09u', 'elAdmin', 'admin');
`);
    //USE "useruser" AS PASSWORD
    console.log("admin created: email:admin@admin.com password: useruser");
  } catch (error) {
    console.error(error);
  } finally {
    if (connection) connection.release();
    process.exit();
  }
}
main();
