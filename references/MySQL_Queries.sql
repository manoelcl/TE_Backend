CREATE DATABASE travel_experiences;

USE travel_experiences;

CREATE TABLE user (
    id INT UNSIGNED AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    username VARCHAR(100)NOT NULL UNIQUE,
    role ENUM("user", "admin") DEFAULT "user" NOT NULL,
    creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);


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


INSERT INTO user (email, password, username, role)
VALUES ("pepe@pepe.com", "pepepe", "pepemola", "admin"),
	("pe2321pe@pepe.com", "pep92epe"/*HASHEADA $2b$08$4vOk86RdBn0Ncfu77Fkwv.UEtfiTsCAZdhQtSMFOc5T6FxESPNL0q*/, "pepemola2321", "user"),
    ("pep1424e@pepe.com", "pepe92pe", "pepe1232mola", "user"),
    ("peasdsape@pepe.com", "pepe28442pe", "l337", "user"),
    ("tobias@pepe.com", "tob32918i", "tobias69", "admin"); 

INSERT INTO recommendation (id_user, title, class, location, abstract, content, photo) VALUES
(1, "Viaje a Italia", "travel", "Italy", "un viaje rápido por la toscana", "lorem ipsum","direccion foto"),
(1, "Baños termales", "experience", "Italy", "un balneario perdido en la toscana", "lorem ipsum","direccion foto"),
(2, "Viaje a Rusia", "travel", "Russia", "un viaje por Moscú", "lorem ipsum","direccion foto"),
(3, "Otro Viaje genérico a Italia", "travel", "Italy", "un viaje genérico por nápoles", "lorem ipsum","direccion foto"),
(3, "Viñedos de Francia", "experience", "France", "Descubre el vino del Loira", "lorem ipsum","direccion foto"),
(4, "Viaje a Portutal", "travel", "Portugal", "un viaje rápido por el algarve", "lorem ipsum","direccion foto")
;

INSERT INTO vote (id_user, id_recommendation, rating) VALUES
(2, 1, 5),
(3,1,4),
(4,1,1),
(1,3,5),
(3,3,4),
(4,3,3),
(1,5,5),
(2,5,5),
(4,5,5)
;

SELECT r.title, r.abstract FROM recommendation r JOIN vote v WHERE location=? AND class=? ORDER BY (SELECT)

SELECT r.title, r.abstract, r.id, AVG(v.rating) AS average
FROM recommendation r JOIN vote v ON r.id=v.id_recommendation
GROUP BY r.id ORDER BY average DESC;

SELECT r.title, r.abstract, r.id, AVG(v.rating) AS average
FROM recommendation r JOIN vote v ON r.id=v.id_recommendation
WHERE r.location="Russia" AND r.class="travel"
GROUP BY r.id ORDER BY average DESC;