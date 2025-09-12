import { supabase } from "../supabase.js";

export async function getUsers(req, res) {
  const { data, error } = await supabase.from("space-invaders").select("*");

  if (error) {
    return res.status(500).json({ error: "Error obteniendo usuarios" });
  }

  if (!data || !data.length) {
    return res.status(404).json({ error: "No hay usuarios" });
  }

  console.log(data);

  res.status(200).json({ ok: true, data: data });
}
export async function postUsers(req, res) {
  const { username, points } = req.body;

  if (!username || points === undefined) {
    return res.status(422).json({ error: "Datos faltantes" });
  }

  const { data, error } = await supabase.from("space-invaders").upsert(
    [
      {
        username: username,
        points: points,
      },
    ],
    {
      onConflict: ["username"], // username debe ser UNIQUE en la tabla
      returning: "representation", // devuelve el registro insertado o actualizado
    }
  );

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Error guardando datos" });
  }

  console.log(data);

  res.status(200).json({ ok: true, msg: "Guardado correctamente", data: data });
}
