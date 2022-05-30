require('dotenv').config();

const { getConnection } = require('./db');

async function main() {
  let connection;

  try {
    connection = await getConnection();

    console.log('Borrando tablas existentes');

    await connection.query(`DROP TABLE IF EXISTS user`);
    await connection.query(`DROP TABLE IF EXISTS recommendation`);
    await connection.query(`DROP TABLE IF EXISTS comment`);
    await connection.query(`DROP TABLE IF EXISTS vote`);

    console.log('Creando tablas');

    await connection.query (`
    CREATE TABLE user (
        id INT UNSIGNED AUTO_INCREMENT,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        username VARCHAR(100)NOT NULL UNIQUE,
        role ENUM("user", "admin") DEFAULT "user" NOT NULL,
        creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    );
    `);

await connection.query (`
CREATE TABLE recommendation(
    id INT UNSIGNED AUTO_INCREMENT,
    id_user INT UNSIGNED NOT NULL,
    title VARCHAR(100) NOT NULL,
    class ENUM("travel", "experience") DEFAULT "travel" NOT NULL,
    location VARCHAR(100) NOT NULL,
    abstract VARCHAR(300) NOT NULL,
    content TINYTEXT NOT NULL,
    photo VARCHAR(100) NOT NULL,
    creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (id_user) REFERENCES user(id)
);
`);

await connection.query (`
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

await connection.query (`
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
} catch (error) {
    console.error(error);
  } finally {
    if (connection) connection.release();
    process.exit();
  }
}
main();
