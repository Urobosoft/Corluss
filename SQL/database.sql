CREATE SCHEMA IF NOT EXISTS `corluss` DEFAULT CHARACTER SET utf8 ;
USE `corluss`;

DROP TABLE IF EXISTS `corluss`.`Usuario` ;

CREATE TABLE IF NOT EXISTS `corluss`.`Usuario` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255),
    apellido VARCHAR(255),
    nomUsuario VARCHAR(255),
    contacto VARCHAR(255),
    password VARCHAR(255),
    genero ENUM('M', 'F', 'O'),
    fecha_nacimiento DATE,
    foto VARCHAR(255)
);

SELECT * FROM `corluss`.`Usuario`;

