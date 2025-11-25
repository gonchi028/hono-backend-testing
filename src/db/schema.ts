import { sqliteTable as table } from 'drizzle-orm/sqlite-core';
import * as t from 'drizzle-orm/sqlite-core';

export const alumnosTable = table('alumnos', {
  id: t.int('id').primaryKey({ autoIncrement: true }),
  nombre: t.text('nombre').notNull(),
  apellido: t.text('apellido').notNull(),
  correo: t.text('correo').notNull().unique(),
});

export const materiasTable = table('materias', {
  id: t.int('id').primaryKey({ autoIncrement: true }),
  titulo: t.text('titulo').notNull(),
  sigla: t.text('sigla').notNull().unique(),
});

export const tareasTable = table('tareas', {
  id: t.int('id').primaryKey({ autoIncrement: true }),
  descripcion: t.text('descripcion').notNull(),
  calificacion: t.int('calificacion').notNull(),
  materiaId: t.int('materia_id')
    .references(() => materiasTable.id)
    .notNull(),
});

// export const tareasTable = table('tareas', {
//   id: t.int('id').primaryKey({ autoIncrement: true }),
//   descripcion: t.text('descripcion').notNull(),
//   calificacion: t.int('calificacion').notNull(),
//   alumnoId: t.int('alumno_id')
//     .references(() => alumnosTable.id)
//     .notNull(),
//   materiaId: t.int('materia_id')
//     .references(() => materiasTable.id)
//     .notNull(),
// });
