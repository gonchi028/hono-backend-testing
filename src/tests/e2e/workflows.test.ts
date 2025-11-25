import { describe, expect, test, beforeEach } from 'vitest';
import { createTestContext, type TestContext } from '../setup.js';

describe('E2E Tests - Complete Workflows', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await createTestContext();
  });

  describe('Student-Subject-Task Workflow', () => {
    test('should create a complete academic flow: materia -> tareas -> query', async () => {
      // Step 1: Create a materia
      const materiaResponse = await ctx.app.request('/materias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: 'Programación Avanzada',
          sigla: 'PRG301',
        }),
      });
      expect(materiaResponse.status).toBe(201);
      const materia = await materiaResponse.json();
      expect(materia[0].id).toBeDefined();

      // Step 2: Create multiple tareas for the materia
      const tarea1Response = await ctx.app.request('/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion: 'Proyecto Final - Parte 1',
          calificacion: 85,
          materiaId: materia[0].id,
        }),
      });
      expect(tarea1Response.status).toBe(201);

      const tarea2Response = await ctx.app.request('/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion: 'Proyecto Final - Parte 2',
          calificacion: 90,
          materiaId: materia[0].id,
        }),
      });
      expect(tarea2Response.status).toBe(201);

      // Step 3: Query all tareas for the materia
      const materiaTareasResponse = await ctx.app.request(`/materias/${materia[0].id}/tareas`);
      expect(materiaTareasResponse.status).toBe(200);
      const tareas = await materiaTareasResponse.json();
      expect(tareas).toHaveLength(2);

      // Step 4: Update one tarea's calificacion
      const tarea = tareas[0];
      const updateResponse = await ctx.app.request(`/tareas/${tarea.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calificacion: 95 }),
      });
      expect(updateResponse.status).toBe(200);
      const updatedTarea = await updateResponse.json();
      expect(updatedTarea.calificacion).toBe(95);

      // Step 5: Delete one tarea
      const deleteResponse = await ctx.app.request(`/tareas/${tareas[1].id}`, {
        method: 'DELETE',
      });
      expect(deleteResponse.status).toBe(200);

      // Step 6: Verify tarea deletion
      const remainingTareasResponse = await ctx.app.request(`/materias/${materia[0].id}/tareas`);
      const remainingTareas = await remainingTareasResponse.json();
      expect(remainingTareas).toHaveLength(1);

      // Step 7: Now we can delete the materia (after deleting remaining tarea)
      await ctx.app.request(`/tareas/${tareas[0].id}`, { method: 'DELETE' });
      
      const deleteMateriaResponse = await ctx.app.request(`/materias/${materia[0].id}`, {
        method: 'DELETE',
      });
      expect(deleteMateriaResponse.status).toBe(200);
    });

    test('should handle full CRUD cycle for alumnos', async () => {
      // Create multiple alumnos
      const alumno1 = await ctx.app.request('/alumnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: 'Ana',
          apellido: 'Martínez',
          correo: 'ana.martinez@university.edu',
        }),
      });
      expect(alumno1.status).toBe(201);

      const alumno2 = await ctx.app.request('/alumnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: 'Pedro',
          apellido: 'Gómez',
          correo: 'pedro.gomez@university.edu',
        }),
      });
      expect(alumno2.status).toBe(201);

      // List all alumnos
      const listResponse = await ctx.app.request('/alumnos');
      const alumnos = await listResponse.json();
      expect(alumnos).toHaveLength(2);

      // Update one alumno
      const alumnoData = await alumno1.json();
      const updateResponse = await ctx.app.request(`/alumnos/${alumnoData[0].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: 'Ana María',
          correo: 'ana.maria@university.edu',
        }),
      });
      expect(updateResponse.status).toBe(200);
      const updatedAlumno = await updateResponse.json();
      expect(updatedAlumno.nombre).toBe('Ana María');
      expect(updatedAlumno.apellido).toBe('Martínez'); // Unchanged

      // Get specific alumno
      const getResponse = await ctx.app.request(`/alumnos/${alumnoData[0].id}`);
      const fetchedAlumno = await getResponse.json();
      expect(fetchedAlumno.correo).toBe('ana.maria@university.edu');

      // Delete all alumnos
      const alumno2Data = await alumno2.json();
      await ctx.app.request(`/alumnos/${alumnoData[0].id}`, { method: 'DELETE' });
      await ctx.app.request(`/alumnos/${alumno2Data[0].id}`, { method: 'DELETE' });

      // Verify all deleted
      const finalListResponse = await ctx.app.request('/alumnos');
      const finalAlumnos = await finalListResponse.json();
      expect(finalAlumnos).toHaveLength(0);
    });
  });

  describe('Error Handling Workflows', () => {
    test('should handle cascade validation errors correctly', async () => {
      // Try to create tarea with non-existent materia
      const response = await ctx.app.request('/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion: 'Invalid Tarea',
          calificacion: 80,
          materiaId: 99999,
        }),
      });
      expect(response.status).toBe(404);
      const error = await response.json();
      expect(error.error).toBe('Materia not found');
    });

    test('should prevent deletion of materia with existing tareas', async () => {
      // Create materia
      const materiaResponse = await ctx.app.request('/materias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: 'Base de Datos',
          sigla: 'BD201',
        }),
      });
      const materia = await materiaResponse.json();

      // Create tarea
      await ctx.app.request('/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion: 'SQL Queries',
          calificacion: 75,
          materiaId: materia[0].id,
        }),
      });

      // Try to delete materia
      const deleteResponse = await ctx.app.request(`/materias/${materia[0].id}`, {
        method: 'DELETE',
      });
      expect(deleteResponse.status).toBe(409);
      const error = await deleteResponse.json();
      expect(error.error).toBe('Cannot delete materia with associated tareas');
    });

    test('should handle duplicate unique constraints', async () => {
      // Create alumno with unique email
      await ctx.app.request('/alumnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: 'Test',
          apellido: 'User',
          correo: 'unique@test.com',
        }),
      });

      // Try to create another alumno with same email
      const duplicateResponse = await ctx.app.request('/alumnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: 'Another',
          apellido: 'User',
          correo: 'unique@test.com',
        }),
      });
      expect(duplicateResponse.status).toBe(409);

      // Same for materia sigla
      await ctx.app.request('/materias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: 'Materia 1',
          sigla: 'MAT001',
        }),
      });

      const duplicateMateriaResponse = await ctx.app.request('/materias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: 'Materia 2',
          sigla: 'MAT001',
        }),
      });
      expect(duplicateMateriaResponse.status).toBe(409);
    });
  });

  describe('Concurrent Operations', () => {
    test('should handle multiple concurrent creates correctly', async () => {
      // Create multiple alumnos in parallel
      const createPromises = [
        ctx.app.request('/alumnos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: 'Alumno 1',
            apellido: 'Test',
            correo: 'alumno1@test.com',
          }),
        }),
        ctx.app.request('/alumnos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: 'Alumno 2',
            apellido: 'Test',
            correo: 'alumno2@test.com',
          }),
        }),
        ctx.app.request('/alumnos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: 'Alumno 3',
            apellido: 'Test',
            correo: 'alumno3@test.com',
          }),
        }),
      ];

      const responses = await Promise.all(createPromises);
      responses.forEach((response) => {
        expect(response.status).toBe(201);
      });

      // Verify all were created
      const listResponse = await ctx.app.request('/alumnos');
      const alumnos = await listResponse.json();
      expect(alumnos).toHaveLength(3);
    });
  });

  describe('Data Integrity', () => {
    test('should maintain referential integrity between materias and tareas', async () => {
      // Create materia
      const materiaResponse = await ctx.app.request('/materias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: 'Cálculo',
          sigla: 'CAL101',
        }),
      });
      const materia = await materiaResponse.json();

      // Create multiple tareas
      const tareasCreated = [];
      for (let i = 1; i <= 5; i++) {
        const response = await ctx.app.request('/tareas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            descripcion: `Tarea ${i}`,
            calificacion: 70 + i * 5,
            materiaId: materia[0].id,
          }),
        });
        const tarea = await response.json();
        tareasCreated.push(tarea[0]);
      }

      // Verify all tareas belong to the materia
      const materiaTareasResponse = await ctx.app.request(`/materias/${materia[0].id}/tareas`);
      const materiaTareas = await materiaTareasResponse.json();
      expect(materiaTareas).toHaveLength(5);

      // Update materia and verify tareas still reference it
      await ctx.app.request(`/materias/${materia[0].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: 'Cálculo Avanzado' }),
      });

      // Tareas should still be accessible
      const tareasAfterUpdate = await ctx.app.request(`/materias/${materia[0].id}/tareas`);
      const tareasData = await tareasAfterUpdate.json();
      expect(tareasData).toHaveLength(5);
    });
  });
});
