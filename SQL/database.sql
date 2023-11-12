CREATE SCHEMA IF NOT EXISTS `corluss` DEFAULT CHARACTER SET utf8 ;
USE `corluss`;

DROP TABLE IF EXISTS `corluss`.`usuario` ;

CREATE TABLE IF NOT EXISTS `corluss`.`usuario` (
  `ID_usuario` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `apellido` VARCHAR(255) NOT NULL,
  `nomUsuario` VARCHAR(45) NOT NULL UNIQUE,
  `contacto` VARCHAR(45) NOT NULL UNIQUE,
  `genero` CHAR(1) NOT NULL,
  `fecha_nacimiento` DATE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `foto` VARCHAR(255) NULL,
  `rol` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`ID_usuario`)
) ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS `corluss`.`administrador` (
  `ID_administrador` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255),
  `apellido` VARCHAR(255),
  `nomUsuario` VARCHAR(255),
  `Correo_Electronico` VARCHAR(45) NOT NULL,
  `Password` VARCHAR(255) NOT NULL, -- Aumenté la longitud para una mejor seguridad
  `Rol` VARCHAR(45) NOT NULL,
   `foto` VARCHAR(255) NULL,
  PRIMARY KEY (`ID_administrador`)
) ENGINE = InnoDB;

SELECT * FROM `corluss`.`usuario`; 		
SELECT * FROM `corluss`.`administrador`; 
