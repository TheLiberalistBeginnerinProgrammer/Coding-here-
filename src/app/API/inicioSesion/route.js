import { cmsConexion, informacionPais as venezuela } from "@/db/database.js";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import axios from "axios";
import { NormalizeError } from "next/dist/shared/lib/utils";

export const GET = async () => {
  try {
    const datosUsuario = `
    SELECT id_persona, cedula, correo_electronico, clave from personas;
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
      cmsConexion.query(datosUsuario),
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

export const POST = async (request, res) => {
  try {
    const { correo, clave } = await request.json();
    console.log(correo, clave);

    const datosUsuario = `
      SELECT id_persona, nombre, correo_electronico, clave 
      FROM personas
      WHERE correo_electronico = ? AND clave = ?;
    `;

    const respuestaUsuario = await cmsConexion.query(datosUsuario, [
      correo,
      clave,
    ]);

    console.log(respuestaUsuario);

    const resultadoFiltrado = respuestaUsuario.filter((itemsUsuarioBd) => {
      return (
        itemsUsuarioBd.correo_electronico === correo &&
        itemsUsuarioBd.clave === clave
      );
    });

    console.log(resultadoFiltrado);

    if (respuestaUsuario.length === 0) {
      return NextResponse.json({ respuestaUsuario });
    }

    // Assuming nombreUsuario and correo are defined somewhere above this code
    console.log(respuestaUsuario)
    const nombreUsuario = resultadoFiltrado[0].nombre;
    const correoElectronico = resultadoFiltrado[0].correo_electronico;


    console.log(nombreUsuario, correoElectronico)

    const token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 31,
        nombreDeUsuario: nombreUsuario,
        correoElectronicoDeUsuario: correoElectronico,
      },
      "secret"
    );

    const serialized = serialize('cookieInformacion', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 24 * 30,
      path: '/'
    })

    // Create a NextResponse instance with the cookie and JSON body
    const response = new NextResponse(JSON.stringify({ respuestaUsuario }), {
      headers: new Headers({
        "Set-Cookie": serialized,
        "Content-Type": "application/json",
      }),
    });

    return response;
    console.log(correo, clave);
    console.log(respuestaUsuario);
  } catch (error) {
    console.error("Error al registrar la persona:", error);
    return NextResponse.status(500).json({
      error: "Error interno del servidor",
    });
  }
};