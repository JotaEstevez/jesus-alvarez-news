import { Platform } from '@/types/newsroom';
import { addDays, setHours, setMinutes, nextTuesday, nextWednesday, nextThursday, isBefore, startOfDay } from 'date-fns';

export interface ScheduleSlot {
  platform: Platform;
  date: Date;
  time: string;
  justification: string;
}

export interface VariantInfo {
  variant: number;
  name: string;
  description: string;
  isRecommended: boolean;
  alternativeClosingQuestion?: string;
}

// Horarios óptimos por plataforma (Europe/Madrid)
const platformScheduleRules: Record<Platform, {
  preferredDays: number[]; // 0=Domingo, 1=Lunes, etc.
  preferredHours: { hour: number; minute: number }[];
  justification: string;
}> = {
  linkedin: {
    preferredDays: [2, 3], // Martes, Miércoles
    preferredHours: [
      { hour: 8, minute: 30 },
      { hour: 17, minute: 30 },
    ],
    justification: 'Pico de consumo profesional antes/después del trabajo',
  },
  twitter: {
    preferredDays: [1, 2, 3, 4, 5], // Lunes a Viernes
    preferredHours: [
      { hour: 13, minute: 0 },
      { hour: 21, minute: 30 },
    ],
    justification: 'Picos de consumo móvil en pausa mediodía y prime time nocturno',
  },
  instagram: {
    preferredDays: [2, 4, 6], // Martes, Jueves, Sábado
    preferredHours: [
      { hour: 12, minute: 0 },
      { hour: 19, minute: 0 },
    ],
    justification: 'Mayor engagement en horario de almuerzo y tarde-noche',
  },
  facebook: {
    preferredDays: [3, 4, 5], // Miércoles, Jueves, Viernes
    preferredHours: [
      { hour: 13, minute: 0 },
      { hour: 15, minute: 0 },
    ],
    justification: 'Mayor engagement entre 13:00-16:00 en días laborables',
  },
};

// Variantes de copy
export const variantDefinitions: VariantInfo[] = [
  {
    variant: 1,
    name: 'V1 Estándar',
    description: 'Equilibrada: gancho + contexto + claves + cierre',
    isRecommended: false,
  },
  {
    variant: 2,
    name: 'V2 Informativa',
    description: 'Más datos y contexto: cifras, fechas, hechos verificables',
    isRecommended: false,
  },
  {
    variant: 3,
    name: 'V3 Humana',
    description: 'Más storytelling y emoción contenida, sin perder rigor',
    isRecommended: true,
  },
];

// Variantes recomendadas por plataforma
export const recommendedVariantByPlatform: Record<Platform, number> = {
  linkedin: 1, // Estándar para LinkedIn (más profesional)
  twitter: 3,  // Humana para X (más engagement)
  instagram: 3, // Humana para Instagram (visual + emocional)
  facebook: 3,  // Humana para Facebook (narrativa)
};

// Preguntas alternativas de cierre por plataforma
export const alternativeClosingQuestions: Record<Platform, string[]> = {
  linkedin: [
    '¿Qué opináis desde vuestra experiencia profesional?',
    '¿Cómo lo veis desde vuestro sector?',
    '¿Qué aprendizaje extraéis de esto?',
  ],
  twitter: [
    '¿Vosotros qué pensáis?',
    '¿Lo veis igual?',
    '¿Qué momento os viene a la memoria?',
  ],
  instagram: [
    '¿Cuál es vuestro favorito?',
    '¿Qué recuerdos os trae?',
    '¿Con quién lo compartís?',
  ],
  facebook: [
    '¿Qué os parece?',
    '¿Con quién lo veríais?',
    '¿Cuál es vuestro recuerdo favorito?',
  ],
};

/**
 * Calcula el próximo día disponible para publicar en una plataforma
 */
function getNextAvailableDay(platform: Platform, fromDate: Date): Date {
  const rules = platformScheduleRules[platform];
  let candidate = startOfDay(addDays(fromDate, 1));
  
  // Buscar el próximo día preferido
  for (let i = 0; i < 14; i++) {
    const dayOfWeek = candidate.getDay();
    if (rules.preferredDays.includes(dayOfWeek)) {
      return candidate;
    }
    candidate = addDays(candidate, 1);
  }
  
  return candidate;
}

/**
 * Genera horarios de publicación sugeridos para un tema
 */
export function generateScheduleSuggestions(
  themeTitle: string,
  platforms: Platform[] = ['linkedin', 'twitter', 'facebook'],
  fromDate: Date = new Date()
): ScheduleSlot[] {
  const suggestions: ScheduleSlot[] = [];
  const usedDates = new Set<string>();
  
  platforms.forEach((platform, index) => {
    const rules = platformScheduleRules[platform];
    let targetDay = getNextAvailableDay(platform, fromDate);
    
    // Evitar mismo día para diferentes plataformas del mismo tema
    while (usedDates.has(targetDay.toISOString().split('T')[0])) {
      targetDay = addDays(targetDay, 1);
    }
    
    // Seleccionar hora preferida (alternar entre opciones)
    const preferredTime = rules.preferredHours[index % rules.preferredHours.length];
    const scheduledDate = setMinutes(setHours(targetDay, preferredTime.hour), preferredTime.minute);
    
    usedDates.add(targetDay.toISOString().split('T')[0]);
    
    suggestions.push({
      platform,
      date: scheduledDate,
      time: `${preferredTime.hour.toString().padStart(2, '0')}:${preferredTime.minute.toString().padStart(2, '0')}`,
      justification: rules.justification,
    });
  });
  
  return suggestions;
}

/**
 * Genera calendario completo para múltiples temas
 */
export function generateWeeklyCalendar(
  themes: { id: string; title: string }[],
  fromDate: Date = new Date()
): Record<string, ScheduleSlot[]> {
  const calendar: Record<string, ScheduleSlot[]> = {};
  let currentDate = fromDate;
  
  themes.forEach((theme) => {
    calendar[theme.id] = generateScheduleSuggestions(
      theme.title,
      ['linkedin', 'twitter', 'facebook'],
      currentDate
    );
    // Siguiente tema empieza después del último día programado
    const lastSlot = calendar[theme.id][calendar[theme.id].length - 1];
    currentDate = addDays(lastSlot.date, 1);
  });
  
  return calendar;
}

/**
 * Obtiene información de variante con recomendación por plataforma
 */
export function getVariantInfo(variant: number, platform: Platform): VariantInfo {
  const baseInfo = variantDefinitions.find(v => v.variant === variant) || variantDefinitions[0];
  const recommendedVariant = recommendedVariantByPlatform[platform];
  
  return {
    ...baseInfo,
    isRecommended: variant === recommendedVariant,
    alternativeClosingQuestion: alternativeClosingQuestions[platform][
      Math.floor(Math.random() * alternativeClosingQuestions[platform].length)
    ],
  };
}

/**
 * Obtiene la variante recomendada para una plataforma
 */
export function getRecommendedVariant(platform: Platform): number {
  return recommendedVariantByPlatform[platform];
}

/**
 * Formatea hora en formato legible
 */
export function formatScheduleTime(date: Date): string {
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
  });
}

/**
 * Límites de caracteres por plataforma (ACTUALIZADOS según reglas editoriales)
 */
export const characterLimits: Record<Platform, { min: number; max: number; label: string }> = {
  linkedin: { min: 800, max: 1400, label: '800-1.400 caracteres' },
  twitter: { min: 120, max: 280, label: '120-280 caracteres' },
  instagram: { min: 150, max: 300, label: '150-300 caracteres' },
  facebook: { min: 250, max: 600, label: '250-600 caracteres' },
};

/**
 * Límites de hashtags por plataforma
 */
export const hashtagLimits: Record<Platform, { min: number; max: number }> = {
  linkedin: { min: 2, max: 4 },
  twitter: { min: 0, max: 2 },
  instagram: { min: 0, max: 5 },
  facebook: { min: 0, max: 2 },
};

/**
 * Evalúa si el contenido está dentro de los límites recomendados
 */
export function evaluateCharacterCount(
  content: string, 
  platform: Platform
): { status: 'ok' | 'short' | 'long'; message: string } {
  const limits = characterLimits[platform];
  const length = content.length;
  
  if (length < limits.min) {
    return {
      status: 'short',
      message: `Muy corto (${length}/${limits.min} mín.)`,
    };
  }
  
  if (length > limits.max) {
    return {
      status: 'long',
      message: `Muy largo (${length}/${limits.max} máx.)`,
    };
  }
  
  return {
    status: 'ok',
    message: `${length} caracteres ✓`,
  };
}
