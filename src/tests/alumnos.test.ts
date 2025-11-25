import { describe, expect, test } from 'vitest';
import { testClient } from 'hono/testing';
import { app } from '../index.js';

describe('Alumnos tests', () => {
  const client = testClient(app);

  test('should fetch all alumnos', async () => {
    const response = await client.alumnos.$get();
    expect(response.status).toBe(200);
    const alumnos = await response.json();
    expect(Array.isArray(alumnos)).toBe(true);
  });
  test('should add a new alumno', async () => {
    const newAlumno = {
      nombre: 'Juan',
      apellido: 'Perez',
      correo: 'juan.perez@example.com',
    };
    const response = await client.alumnos.$post({ json: newAlumno });
    expect(response.status).toBe(200);
    const createdAlumno = await response.json();
    expect(createdAlumno[0].nombre).toBe(newAlumno.nombre);
    expect(createdAlumno[0].apellido).toBe(newAlumno.apellido);
    expect(createdAlumno[0].correo).toBe(newAlumno.correo);
  });
});
