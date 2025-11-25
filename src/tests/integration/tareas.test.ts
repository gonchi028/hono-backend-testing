import { describe, expect, test, beforeEach } from 'vitest';
import { createTestContext, fixtures, type TestContext } from '../setup.js';

describe('Integration Tests - Tareas Routes', () => {
  let ctx: TestContext;
  let testMateriaId: number;

  beforeEach(async () => {
    ctx = await createTestContext();
    
    // Create a materia for tarea tests
    const materiaResponse = await ctx.app.request('/materias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fixtures.materia.valid),
    });
    const materia = await materiaResponse.json();
    testMateriaId = materia[0].id;
  });

  describe('GET /tareas', () => {
    test('should return empty array when no tareas exist', async () => {
      const response = await ctx.app.request('/tareas');
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual([]);
    });

    test('should return all tareas', async () => {
      // Create test tarea
      await ctx.app.request('/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.tarea.valid(testMateriaId)),
      });

      const response = await ctx.app.request('/tareas');
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveLength(1);
    });
  });

  describe('GET /tareas/:id', () => {
    test('should return a specific tarea by ID', async () => {
      // Create a tarea first
      const createResponse = await ctx.app.request('/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.tarea.valid(testMateriaId)),
      });
      const created = await createResponse.json();

      const response = await ctx.app.request(`/tareas/${created[0].id}`);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.descripcion).toBe(fixtures.tarea.valid(testMateriaId).descripcion);
    });

    test('should return 404 for non-existent tarea', async () => {
      const response = await ctx.app.request('/tareas/999');
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Tarea not found');
    });

    test('should return 400 for invalid ID', async () => {
      const response = await ctx.app.request('/tareas/invalid');
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid ID');
    });
  });

  describe('POST /tareas', () => {
    test('should create a new tarea with valid data', async () => {
      const response = await ctx.app.request('/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.tarea.valid(testMateriaId)),
      });
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data[0].descripcion).toBe(fixtures.tarea.valid(testMateriaId).descripcion);
      expect(data[0].id).toBeDefined();
    });

    test('should return 400 when missing required fields', async () => {
      const response = await ctx.app.request('/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.tarea.missingFields),
      });
      expect(response.status).toBe(400);
    });

    test('should return 400 for invalid calificacion (greater than 100)', async () => {
      const response = await ctx.app.request('/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.tarea.invalidCalificacion(testMateriaId)),
      });
      expect(response.status).toBe(400);
    });

    test('should return 400 for negative calificacion', async () => {
      const response = await ctx.app.request('/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion: 'Test',
          calificacion: -5,
          materiaId: testMateriaId,
        }),
      });
      expect(response.status).toBe(400);
    });

    test('should return 404 when referencing non-existent materia', async () => {
      const response = await ctx.app.request('/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion: 'Test',
          calificacion: 80,
          materiaId: 9999,
        }),
      });
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Materia not found');
    });

    test('should accept boundary values for calificacion', async () => {
      // Test with 0
      const response0 = await ctx.app.request('/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion: 'Test Zero',
          calificacion: 0,
          materiaId: testMateriaId,
        }),
      });
      expect(response0.status).toBe(201);

      // Test with 100
      const response100 = await ctx.app.request('/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion: 'Test Hundred',
          calificacion: 100,
          materiaId: testMateriaId,
        }),
      });
      expect(response100.status).toBe(201);
    });
  });

  describe('PUT /tareas/:id', () => {
    test('should update an existing tarea', async () => {
      // Create a tarea first
      const createResponse = await ctx.app.request('/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.tarea.valid(testMateriaId)),
      });
      const created = await createResponse.json();

      const updateData = { descripcion: 'Updated Description' };
      const response = await ctx.app.request(`/tareas/${created[0].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.descripcion).toBe('Updated Description');
      expect(data.calificacion).toBe(fixtures.tarea.valid(testMateriaId).calificacion); // Unchanged
    });

    test('should update calificacion', async () => {
      // Create a tarea first
      const createResponse = await ctx.app.request('/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.tarea.valid(testMateriaId)),
      });
      const created = await createResponse.json();

      const response = await ctx.app.request(`/tareas/${created[0].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calificacion: 95 }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.calificacion).toBe(95);
    });

    test('should return 404 for non-existent tarea', async () => {
      const response = await ctx.app.request('/tareas/999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion: 'Test' }),
      });
      expect(response.status).toBe(404);
    });

    test('should return 400 for invalid calificacion on update', async () => {
      // Create a tarea first
      const createResponse = await ctx.app.request('/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.tarea.valid(testMateriaId)),
      });
      const created = await createResponse.json();

      const response = await ctx.app.request(`/tareas/${created[0].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calificacion: 150 }),
      });
      expect(response.status).toBe(400);
    });

    test('should return 404 when updating materiaId to non-existent materia', async () => {
      // Create a tarea first
      const createResponse = await ctx.app.request('/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.tarea.valid(testMateriaId)),
      });
      const created = await createResponse.json();

      const response = await ctx.app.request(`/tareas/${created[0].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materiaId: 9999 }),
      });
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /tareas/:id', () => {
    test('should delete an existing tarea', async () => {
      // Create a tarea first
      const createResponse = await ctx.app.request('/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtures.tarea.valid(testMateriaId)),
      });
      const created = await createResponse.json();

      const response = await ctx.app.request(`/tareas/${created[0].id}`, {
        method: 'DELETE',
      });
      expect(response.status).toBe(200);

      // Verify deletion
      const getResponse = await ctx.app.request(`/tareas/${created[0].id}`);
      expect(getResponse.status).toBe(404);
    });

    test('should return 404 for non-existent tarea', async () => {
      const response = await ctx.app.request('/tareas/999', {
        method: 'DELETE',
      });
      expect(response.status).toBe(404);
    });

    test('should return 400 for invalid ID', async () => {
      const response = await ctx.app.request('/tareas/invalid', {
        method: 'DELETE',
      });
      expect(response.status).toBe(400);
    });
  });
});
