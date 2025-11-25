// Validation utility functions for unit testing
export const validators = {
  /**
   * Validates email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validates sigla format (2-10 characters)
   */
  isValidSigla(sigla: string): boolean {
    return sigla.length >= 2 && sigla.length <= 10;
  },

  /**
   * Validates calificacion (0-100)
   */
  isValidCalificacion(calificacion: number): boolean {
    return typeof calificacion === 'number' && calificacion >= 0 && calificacion <= 100;
  },

  /**
   * Validates that a string is not empty
   */
  isNotEmpty(value: string): boolean {
    return typeof value === 'string' && value.trim().length > 0;
  },

  /**
   * Validates a positive integer ID
   */
  isValidId(id: number): boolean {
    return Number.isInteger(id) && id > 0;
  },
};

/**
 * Alumno validation
 */
export function validateAlumno(data: { nombre?: string; apellido?: string; correo?: string }): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.nombre || !validators.isNotEmpty(data.nombre)) {
    errors.push('nombre is required');
  }
  if (!data.apellido || !validators.isNotEmpty(data.apellido)) {
    errors.push('apellido is required');
  }
  if (!data.correo) {
    errors.push('correo is required');
  } else if (!validators.isValidEmail(data.correo)) {
    errors.push('correo must be a valid email');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Materia validation
 */
export function validateMateria(data: { titulo?: string; sigla?: string }): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.titulo || !validators.isNotEmpty(data.titulo)) {
    errors.push('titulo is required');
  }
  if (!data.sigla) {
    errors.push('sigla is required');
  } else if (!validators.isValidSigla(data.sigla)) {
    errors.push('sigla must be between 2 and 10 characters');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Tarea validation
 */
export function validateTarea(data: {
  descripcion?: string;
  calificacion?: number;
  materiaId?: number;
}): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.descripcion || !validators.isNotEmpty(data.descripcion)) {
    errors.push('descripcion is required');
  }
  if (data.calificacion === undefined) {
    errors.push('calificacion is required');
  } else if (!validators.isValidCalificacion(data.calificacion)) {
    errors.push('calificacion must be a number between 0 and 100');
  }
  if (!data.materiaId) {
    errors.push('materiaId is required');
  } else if (!validators.isValidId(data.materiaId)) {
    errors.push('materiaId must be a positive integer');
  }

  return { valid: errors.length === 0, errors };
}
