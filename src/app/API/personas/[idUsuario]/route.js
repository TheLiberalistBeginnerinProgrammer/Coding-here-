import { cmsConexion, informacionPais as venezuela } from "@/db/database.js";
import { NextResponse } from "next/server";
import axios from "axios";

export const GET = async (request, { params: { idUsuario } }) => {
  try {
    const datosUsuario = `
    SELECT cedula, correo_electronico, clave from personas where id_persona = ?;
    `;

    const consultarPais = `
    SELECT DISTINCT est.estado, cd.capital, cd.ciudad, muni.municipio, parr.parroquia
    FROM ciudades as cd, estados as est, municipios as muni, parroquias as parr
    WHERE est.id_estado = cd.id_estado
    AND muni.id_municipio = parr.id_municipio
    ORDER BY RAND()
    LIMIT 23;
    `;

    const [respuestaPersona, respuestaPais] = await Promise.all([
      cmsConexion.query(datosUsuario, [Number(idUsuario)]),
      venezuela.query(consultarPais),
    ]);

    console.log(respuestaPersona);
    console.log(respuestaPais);

    return NextResponse.json({
      personas: respuestaPersona,
      paises: respuestaPais,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      error: "Ocurrió un error al procesar la solicitud.",
    });
  }
};

export const POST = async (request, { params: { idUsuario } }) => {
  try {
    const {
      nombres,
      apellido,
      cedula,
      sexo,
      nacionalidad,
      nacimiento,
      direccion,
      pais,
      estado,
      ciudad,
      municipio,
      parroquia,
      codigo,
      facebook,
      instagram,
      x,
      tiktok,
      sitio_web,
      correo,
      clave,
      repetirClave,
    } = await request.json();

    console.log("País:", pais);

    const consultaGrabarPais = `INSERT INTO paises (nombre_pais) VALUES (?);`;
    const grabador = await cmsConexion.query(consultaGrabarPais, [pais]);

    const idPais = grabador.insertId;
    console.log("ID del País:", idPais);

    const consultaGrabarEstado = `INSERT INTO estados (id_pais, nombre_estado) VALUES (?, ?);`;
    const grabadorEstado = await cmsConexion.query(consultaGrabarEstado, [
      idPais,
      estado,
    ]);

    const idEstado = grabadorEstado.insertId;
    console.log("ID del Estado:", idEstado);

    const consultaGrabarMunicipio = `INSERT INTO municipios (id_estado, nombre_municipio) VALUES (?, ?);`;
    const grabadorMunicipio = await cmsConexion.query(consultaGrabarMunicipio, [
      idEstado,
      municipio,
    ]);

    const idMunicipio = grabadorMunicipio.insertId;
    console.log("ID del Municipio:", idMunicipio);

    const consultaGrabarParroquia = `INSERT INTO parroquias (id_municipio, nombre_parroquia) VALUES (?, ?);`;
    const grabadorParroquia = await cmsConexion.query(consultaGrabarParroquia, [
      idMunicipio,
      parroquia,
    ]);

    const idParroquia = grabadorParroquia.insertId;
    console.log("ID de la Parroquia:", idParroquia);

    const consultaGrabarCodigoPostal = `INSERT INTO codigos_postales (id_parroquia, numero_codigo_postal) VALUES (?, ?);`;
    const grabadorCodigoPostal = await cmsConexion.query(
      consultaGrabarCodigoPostal,
      [idParroquia, codigo]
    );

    const idCodigoPostal = grabadorCodigoPostal.insertId;
    console.log("ID de la Codigo Postal:", idCodigoPostal);

    const consultaGrabarDireccion = `INSERT INTO direcciones (id_codigo_postal, direccion_completa) VALUES (?, ?);`;
    const grabadorDireccion = await cmsConexion.query(consultaGrabarDireccion, [
      idCodigoPostal,
      direccion,
    ]);

    const idDireccion = grabadorDireccion.insertId;
    console.log("ID de la Direccion:", idDireccion);

    const idGenero = sexo === "Masculino" ? 1 : 2;

    console.log(idGenero);

    const idNacionalidad = nacionalidad === "V" ? 1 : 2;

    const idRol = 2;

    const urlPagina = "A";

    const imgPagina = "A";

    console.log(
      nombres,
      apellido,
      cedula,
      sexo,
      nacionalidad,
      nacimiento,
      direccion,
      pais,
      estado,
      ciudad,
      municipio,
      parroquia,
      codigo,
      facebook,
      instagram,
      x,
      tiktok,
      sitio_web,
      correo,
      clave,
      repetirClave
    );

    const consultaGrabarPersonas = `
    INSERT INTO personas (
      id_persona, 
      id_genero, 
      id_rol, 
      id_nacionalidad, 
      id_direccion, 
      nombre, 
      apellido, 
      cedula,
      fecha_nacimiento,
      correo_electronico, 
      clave, 
      facebook, 
      instagram, 
      x, 
      tiktok,
      sitio_web,
      url_pagina, 
      img_pagina
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);
  `;

    try {
      const grabadorPersonas = await cmsConexion.query(consultaGrabarPersonas, [
        null,
        idGenero,
        idRol,
        idNacionalidad,
        idDireccion,
        nombres,
        apellido,
        cedula /* La Cedula es Unique en la base de datos, por algo no te lo registrara a todos */,
        nacimiento,
        correo,
        clave,
        facebook,
        instagram,
        x,
        tiktok,
        sitio_web,
        urlPagina,
        imgPagina,
      ]);

      console.log("Persona registrada exitosamente:", grabadorPersonas);
    } catch (error) {
      console.error("Error al registrar la persona:", error);
    }

    return NextResponse.json(
      { Exitoso: "Datos Insertados Correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al grabar los datos:", error);
    return NextResponse.json(
      { mensaje: "Ocurrió un error al grabar los datos", error: error.message },
      { status: 500 }
    );
  }
};