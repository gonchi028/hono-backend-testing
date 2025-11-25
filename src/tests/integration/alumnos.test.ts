import { describe, expect, test, beforeEach } from 'vitest';
import { createTestContext, clearDatabase, fixtures, type TestContext } from '../setup.js';

describe('Integration Tests - Alumnos Routes', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await createTestContext();
  });

  describe('GET /alumnos', () => {
    test('should return empty array when no alumnos exist', async () => {
      const response = await ctx.app.request('/alumnos');
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual([]);
    });

    test('should return all alumnos', async () => {
      // Create test alumnos
      await ctx.app.request('/alumnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.alumno.valid),
      });

      const response = await ctx.app.request('/alumnos');
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveLength(1);
    });
  });

  describe('GET /alumnos/:id', () => {
    test('should return a specific alumno by ID', async () => {
      // Create an alumno first
      const createResponse = await ctx.app.request('/alumnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.alumno.valid),
      });
      const created = await createResponse.json();

      const response = await ctx.app.request(`/alumnos/${created[0].id}`);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.nombre).toBe(fixtures.alumno.valid.nombre);
    });

    test('should return 404 for non-existent alumno', async () => {
      const response = await ctx.app.request('/alumnos/999');
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Alumno not found');
    });

    test('should return 400 for invalid ID', async () => {
      const response = await ctx.app.request('/alumnos/invalid');
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid ID');
    });
  });

  describe('POST /alumnos', () => {
    test('should create a new alumno with valid data', async () => {
      const response = await ctx.app.request('/alumnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.alumno.valid),
      });
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data[0].nombre).toBe(fixtures.alumno.valid.nombre);
      expect(data[0].id).toBeDefined();
    });

    test('should return 400 when missing required fields', async () => {
      const response = await ctx.app.request('/alumnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.alumno.missingFields),
      });
      expect(response.status).toBe(400);
    });

    test('should return 400 for invalid email format', async () => {
      const response = await ctx.app.request('/alumnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.alumno.invalidEmail),
      });
      expect(response.status).toBe(400);
    });

    test('should return 409 for duplicate email', async () => {
      // Create first alumno
      await ctx.app.request('/alumnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.alumno.valid),
      });

      // Try to create another with same email
      const response = await ctx.app.request('/alumnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.alumno.valid),
      });
      expect(response.status).toBe(409);
    });
  });

  describe('PUT /alumnos/:id', () => {
    test('should update an existing alumno', async () => {
      // Create an alumno first
      const createResponse = await ctx.app.request('/alumnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.alumno.valid),
      });
      const created = await createResponse.json();

      const updateData = { nombre: 'Updated Name' };
      const response = await ctx.app.request(`/alumnos/${created[0].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.nombre).toBe('Updated Name');
      expect(data.apellido).toBe(fixtures.alumno.valid.apellido); // Unchanged
    });

    test('should return 404 for non-existent alumno', async () => {
      const response = await ctx.app.request('/alumnos/999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: 'Test' }),
      });
      expect(response.status).toBe(404);
    });

    test('should return 400 for invalid email format on update', async () => {
      // Create an alumno first
      const createResponse = await ctx.app.request('/alumnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.alumno.valid),
      });
      const created = await createResponse.json();

      const response = await ctx.app.request(`/alumnos/${created[0].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: 'invalid-email' }),
      });
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /alumnos/:id', () => {
    test('should delete an existing alumno', async () => {
      // Create an alumno first
      const createResponse = await ctx.app.request('/alumnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.alumno.valid),
      });
      const created = await createResponse.json();

      const response = await ctx.app.request(`/alumnos/${created[0].id}`, {
        method: 'DELETE',
      });
      expect(response.status).toBe(200);

      // Verify deletion
      const getResponse = await ctx.app.request(`/alumnos/${created[0].id}`);
      expect(getResponse.status).toBe(404);
    });

    test('should return 404 for non-existent alumno', async () => {
      const response = await ctx.app.request('/alumnos/999', {
        method: 'DELETE',
      });
      expect(response.status).toBe(404);
    });

    test('should return 400 for invalid ID', async () => {
      const response = await ctx.app.request('/alumnos/invalid', {
        method: 'DELETE',
      });
      expect(response.status).toBe(400);
    });
  });
});
