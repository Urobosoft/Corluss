CREATE SCHEMA IF NOT EXISTS `corluss` DEFAULT CHARACTER SET utf8 ;
USE `corluss`;

DROP TABLE IF EXISTS `corluss`.`usuario` ;

CREATE TABLE IF NOT EXISTS `corluss`.`usuario` (
  `ID_usuario` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `apellido` VARCHAR(255) NOT NULL,
  `nomUsuario` VARCHAR(45) NOT NULL UNIQUE,
  `contacto` VARCHAR(255) NOT NULL UNIQUE,
  `genero` CHAR(1) NOT NULL,
  `fecha_nacimiento` DATE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `foto` VARCHAR(255) NULL,
  `rol` VARCHAR(45) NOT NULL,
  `estado_conexion` VARCHAR(50) DEFAULT 'desconectado',
  PRIMARY KEY (`ID_usuario`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `corluss`.`publicaciones` (
  `ID_publicacion` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` INT NOT NULL,
  `contenido` TEXT NOT NULL,
  `imagen` VARCHAR(255) NULL,
  `video` VARCHAR(255) NULL,
  `fecha_publicacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_publicacion`),
  FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`ID_usuario`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `corluss`.`comentarios` (
  `ID_comentario` INT NOT NULL AUTO_INCREMENT,
  `publicacion_id` INT NOT NULL,
  `usuario_id` INT NOT NULL,
  `texto` TEXT NOT NULL,
  `fecha_comentario` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_comentario`),
  FOREIGN KEY (`publicacion_id`) REFERENCES `publicaciones` (`ID_publicacion`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`ID_usuario`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `SolicitudesAmistad` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `solicitante_id` INT NOT NULL,
  `receptor_id` INT NOT NULL,
  `estado` ENUM('pendiente', 'aceptada', 'rechazada') DEFAULT 'pendiente',
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`solicitante_id`) REFERENCES `usuario`(`ID_usuario`),
  FOREIGN KEY (`receptor_id`) REFERENCES `usuario`(`ID_usuario`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `Amigos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_id1` INT NOT NULL,
  `usuario_id2` INT NOT NULL,
  `fecha_amistad` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`usuario_id1`) REFERENCES `usuario`(`ID_usuario`),
  FOREIGN KEY (`usuario_id2`) REFERENCES `usuario`(`ID_usuario`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `corluss`.`mensajes` (
  `ID_mensaje` INT NOT NULL AUTO_INCREMENT,
  `ID_remitente` INT NOT NULL,
  `ID_destinatario` INT NOT NULL,
  `contenido` TEXT NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_mensaje`),
  INDEX `fk_remitente_idx` (`ID_remitente` ASC) VISIBLE,
  INDEX `fk_destinatario_idx` (`ID_destinatario` ASC) VISIBLE,
  CONSTRAINT `fk_remitente`
    FOREIGN KEY (`ID_remitente`)
    REFERENCES `corluss`.`usuario` (`ID_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_destinatario`
    FOREIGN KEY (`ID_destinatario`)
    REFERENCES `corluss`.`usuario` (`ID_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `ListaAlumnos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_registrador_id` INT NOT NULL,
  `alumno_id` INT NOT NULL,
  `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`usuario_registrador_id`) REFERENCES `usuario`(`ID_usuario`),
  FOREIGN KEY (`alumno_id`) REFERENCES `usuario`(`ID_usuario`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `ListaTutores` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_registrador_id` INT NOT NULL,
  `tutor_id` INT NOT NULL,
  `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`usuario_registrador_id`) REFERENCES `usuario`(`ID_usuario`),
  FOREIGN KEY (`tutor_id`) REFERENCES `usuario`(`ID_usuario`)
) ENGINE = InnoDB;


SELECT * FROM `corluss`.`ListaAlumnos`;
SELECT * FROM `corluss`.`ListaTutores`;
SELECT * FROM `corluss`.`mensajes`;
SELECT * FROM `corluss`.`Amigos`;
SELECT * FROM `corluss`.`SolicitudesAmistad`;	
SELECT * FROM `corluss`.`comentarios`; 	
SELECT * FROM `corluss`.`publicaciones`; 	
SELECT * FROM `corluss`.`usuario`; 		 	

drop  table `corluss`.`publicaciones`;