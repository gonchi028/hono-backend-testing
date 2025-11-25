import { describe, expect, test, beforeEach } from 'vitest';
import { createTestContext, fixtures, type TestContext } from '../setup.js';

describe('Integration Tests - Materias Routes', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await createTestContext();
  });

  describe('GET /materias', () => {
    test('should return empty array when no materias exist', async () => {
      const response = await ctx.app.request('/materias');
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual([]);
    });

    test('should return all materias', async () => {
      // Create test materia
      await ctx.app.request('/materias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.materia.valid),
      });

      const response = await ctx.app.request('/materias');
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveLength(1);
    });
  });

  describe('GET /materias/:id', () => {
    test('should return a specific materia by ID', async () => {
      // Create a materia first
      const createResponse = await ctx.app.request('/materias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.materia.valid),
      });
      const created = await createResponse.json();

      const response = await ctx.app.request(`/materias/${created[0].id}`);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.titulo).toBe(fixtures.materia.valid.titulo);
    });

    test('should return 404 for non-existent materia', async () => {
      const response = await ctx.app.request('/materias/999');
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Materia not found');
    });

    test('should return 400 for invalid ID', async () => {
      const response = await ctx.app.request('/materias/invalid');
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid ID');
    });
  });

  describe('GET /materias/:id/tareas', () => {
    test('should return tareas for a specific materia', async () => {
      // Create a materia first
      const materiaResponse = await ctx.app.request('/materias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.materia.valid),
      });
      const materia = await materiaResponse.json();

      // Create a tarea for this materia
      await ctx.app.request('/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.tarea.valid(materia[0].id)),
      });

      const response = await ctx.app.request(`/materias/${materia[0].id}/tareas`);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveLength(1);
    });

    test('should return empty array when materia has no tareas', async () => {
      // Create a materia first
      const materiaResponse = await ctx.app.request('/materias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.materia.valid),
      });
      const materia = await materiaResponse.json();

      const response = await ctx.app.request(`/materias/${materia[0].id}/tareas`);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual([]);
    });

    test('should return 404 for non-existent materia', async () => {
      const response = await ctx.app.request('/materias/999/tareas');
      expect(response.status).toBe(404);
    });
  });

  describe('POST /materias', () => {
    test('should create a new materia with valid data', async () => {
      const response = await ctx.app.request('/materias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.materia.valid),
      });
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data[0].titulo).toBe(fixtures.materia.valid.titulo);
      expect(data[0].id).toBeDefined();
    });

    test('should return 400 when missing required fields', async () => {
      const response = await ctx.app.request('/materias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.materia.missingFields),
      });
      expect(response.status).toBe(400);
    });

    test('should return 400 for invalid sigla format', async () => {
      const response = await ctx.app.request('/materias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.materia.invalidSigla),
      });
      expect(response.status).toBe(400);
    });

    test('should return 409 for duplicate sigla', async () => {
      // Create first materia
      await ctx.app.request('/materias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.materia.valid),
      });

      // Try to create another with same sigla
      const response = await ctx.app.request('/materias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.materia.valid),
      });
      expect(response.status).toBe(409);
    });
  });

  describe('PUT /materias/:id', () => {
    test('should update an existing materia', async () => {
      // Create a materia first
      const createResponse = await ctx.app.request('/materias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.materia.valid),
      });
      const created = await createResponse.json();

      const updateData = { titulo: 'Updated Title' };
      const response = await ctx.app.request(`/materias/${created[0].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.titulo).toBe('Updated Title');
      expect(data.sigla).toBe(fixtures.materia.valid.sigla); // Unchanged
    });

    test('should return 404 for non-existent materia', async () => {
      const response = await ctx.app.request('/materias/999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: 'Test' }),
      });
      expect(response.status).toBe(404);
    });

    test('should return 400 for invalid sigla format on update', async () => {
      // Create a materia first
      const createResponse = await ctx.app.request('/materias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.materia.valid),
      });
      const created = await createResponse.json();

      const response = await ctx.app.request(`/materias/${created[0].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sigla: 'X' }), // Too short
      });
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /materias/:id', () => {
    test('should delete an existing materia without tareas', async () => {
      // Create a materia first
      const createResponse = await ctx.app.request('/materias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.materia.valid),
      });
      const created = await createResponse.json();

      const response = await ctx.app.request(`/materias/${created[0].id}`, {
        method: 'DELETE',
      });
      expect(response.status).toBe(200);

      // Verify deletion
      const getResponse = await ctx.app.request(`/materias/${created[0].id}`);
      expect(getResponse.status).toBe(404);
    });

    test('should return 409 when trying to delete materia with associated tareas', async () => {
      // Create a materia first
      const materiaResponse = await ctx.app.request('/materias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.materia.valid),
      });
      const materia = await materiaResponse.json();

      // Create a tarea for this materia
      await ctx.app.request('/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.tarea.valid(materia[0].id)),
      });

      // Try to delete the materia
      const response = await ctx.app.request(`/materias/${materia[0].id}`, {
        method: 'DELETE',
      });
      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.error).toBe('Cannot delete materia with associated tareas');
    });

    test('should return 404 for non-existent materia', async () => {
      const response = await ctx.app.request('/materias/999', {
        method: 'DELETE',
      });
      expect(response.status).toBe(404);
    });
  });
});
