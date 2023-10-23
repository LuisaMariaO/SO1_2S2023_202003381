CREATE DATABASE IF NOT EXISTS proyecto2;

USE proyecto2;

CREATE TABLE IF NOT EXISTS notas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carnet INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    curso VARCHAR(5) NOT NULL,
    nota INT NOT NULL,
    semestre VARCHAR(2) NOT NULL,
    year INT NOT NULL
);

SELECT * from notas;