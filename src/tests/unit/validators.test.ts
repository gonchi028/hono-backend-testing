import { describe, expect, test } from 'vitest';
import {
  validators,
  validateAlumno,
  validateMateria,
  validateTarea,
} from '../../utils/validators.js';

describe('Unit Tests - Validators', () => {
  describe('validators.isValidEmail', () => {
    test('should return true for valid emails', () => {
      expect(validators.isValidEmail('test@example.com')).toBe(true);
      expect(validators.isValidEmail('user.name@domain.org')).toBe(true);
      expect(validators.isValidEmail('user+tag@example.co')).toBe(true);
    });

    test('should return false for invalid emails', () => {
      expect(validators.isValidEmail('invalid')).toBe(false);
      expect(validators.isValidEmail('invalid@')).toBe(false);
      expect(validators.isValidEmail('@domain.com')).toBe(false);
      expect(validators.isValidEmail('user@.com')).toBe(false);
      expect(validators.isValidEmail('')).toBe(false);
    });
  });

  describe('validators.isValidSigla', () => {
    test('should return true for valid siglas (2-10 chars)', () => {
      expect(validators.isValidSigla('AB')).toBe(true);
      expect(validators.isValidSigla('MAT101')).toBe(true);
      expect(validators.isValidSigla('ABCDEFGHIJ')).toBe(true);
    });

    test('should return false for invalid siglas', () => {
      expect(validators.isValidSigla('A')).toBe(false);
      expect(validators.isValidSigla('ABCDEFGHIJK')).toBe(false);
      expect(validators.isValidSigla('')).toBe(false);
    });
  });

  describe('validators.isValidCalificacion', () => {
    test('should return true for valid calificaciones (0-100)', () => {
      expect(validators.isValidCalificacion(0)).toBe(true);
      expect(validators.isValidCalificacion(50)).toBe(true);
      expect(validators.isValidCalificacion(100)).toBe(true);
    });

    test('should return false for invalid calificaciones', () => {
      expect(validators.isValidCalificacion(-1)).toBe(false);
      expect(validators.isValidCalificacion(101)).toBe(false);
      expect(validators.isValidCalificacion(NaN)).toBe(false);
    });
  });

  describe('validators.isNotEmpty', () => {
    test('should return true for non-empty strings', () => {
      expect(validators.isNotEmpty('hello')).toBe(true);
      expect(validators.isNotEmpty(' hello ')).toBe(true);
    });

    test('should return false for empty strings', () => {
      expect(validators.isNotEmpty('')).toBe(false);
      expect(validators.isNotEmpty('   ')).toBe(false);
    });
  });

  describe('validators.isValidId', () => {
    test('should return true for positive integers', () => {
      expect(validators.isValidId(1)).toBe(true);
      expect(validators.isValidId(100)).toBe(true);
    });

    test('should return false for invalid IDs', () => {
      expect(validators.isValidId(0)).toBe(false);
      expect(validators.isValidId(-1)).toBe(false);
      expect(validators.isValidId(1.5)).toBe(false);
    });
  });

  describe('validateAlumno', () => {
    test('should validate a complete valid alumno', () => {
      const result = validateAlumno({
        nombre: 'Juan',
        apellido: 'Pérez',
        correo: 'juan@example.com',
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should return errors for missing fields', () => {
      const result = validateAlumno({});
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('nombre is required');
      expect(result.errors).toContain('apellido is required');
      expect(result.errors).toContain('correo is required');
    });

    test('should return error for invalid email', () => {
      const result = validateAlumno({
        nombre: 'Juan',
        apellido: 'Pérez',
        correo: 'invalid-email',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('correo must be a valid email');
    });
  });

  describe('validateMateria', () => {
    test('should validate a complete valid materia', () => {
      const result = validateMateria({
        titulo: 'Matemáticas',
        sigla: 'MAT101',
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should return errors for missing fields', () => {
      const result = validateMateria({});
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('titulo is required');
      expect(result.errors).toContain('sigla is required');
    });

    test('should return error for invalid sigla', () => {
      const result = validateMateria({
        titulo: 'Math',
        sigla: 'M',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('sigla must be between 2 and 10 characters');
    });
  });

  describe('validateTarea', () => {
    test('should validate a complete valid tarea', () => {
      const result = validateTarea({
        descripcion: 'Homework 1',
        calificacion: 85,
        materiaId: 1,
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should return errors for missing fields', () => {
      const result = validateTarea({});
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('descripcion is required');
      expect(result.errors).toContain('calificacion is required');
      expect(result.errors).toContain('materiaId is required');
    });

    test('should return error for invalid calificacion', () => {
      const result = validateTarea({
        descripcion: 'Test',
        calificacion: 150,
        materiaId: 1,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('calificacion must be a number between 0 and 100');
    });

    test('should accept boundary values for calificacion', () => {
      expect(validateTarea({ descripcion: 'Test', calificacion: 0, materiaId: 1 }).valid).toBe(true);
      expect(validateTarea({ descripcion: 'Test', calificacion: 100, materiaId: 1 }).valid).toBe(true);
    });
  });
});
