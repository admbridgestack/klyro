export type VerticalKey =
  | "barbershop"
  | "salon"
  | "fitness"
  | "spa"
  | "tattoo"
  | "carwash"
  | "petgrooming"
  | "other";

export interface VerticalProfile {
  key: VerticalKey;
  displayName: { es: string; en: string };
  icon: string; // lucide-react icon name
  emoji?: string;
  status: "active" | "preview";
  defaultServices: Array<{
    name: { es: string; en: string };
    durationMinutes: number;
    suggestedPriceRange: [number, number];
  }>;
  defaultBufferMinutes: number;
  defaultCancellationHours: number;
  messagingTone: "casual" | "professional" | "wellness";
  bookingPageHints: {
    serviceNoun: { es: string; en: string };
    appointmentNoun: { es: string; en: string };
    staffNoun: { es: string; en: string };
  };
}

export const VERTICALS: Record<VerticalKey, VerticalProfile> = {
  barbershop: {
    key: "barbershop",
    displayName: { es: "Barbería", en: "Barbershop" },
    icon: "Scissors",
    emoji: "💈",
    status: "active",
    defaultServices: [
      {
        name: { es: "Corte de cabello", en: "Haircut" },
        durationMinutes: 30,
        suggestedPriceRange: [150, 300],
      },
      {
        name: { es: "Arreglo de barba", en: "Beard trim" },
        durationMinutes: 20,
        suggestedPriceRange: [100, 200],
      },
      {
        name: { es: "Corte + barba", en: "Haircut + beard" },
        durationMinutes: 45,
        suggestedPriceRange: [250, 450],
      },
    ],
    defaultBufferMinutes: 5,
    defaultCancellationHours: 2,
    messagingTone: "casual",
    bookingPageHints: {
      serviceNoun: { es: "servicio", en: "service" },
      appointmentNoun: { es: "turno", en: "appointment" },
      staffNoun: { es: "barbero", en: "barber" },
    },
  },

  salon: {
    key: "salon",
    displayName: { es: "Salón de belleza", en: "Beauty salon" },
    icon: "Sparkles",
    emoji: "✨",
    status: "active",
    defaultServices: [
      {
        name: { es: "Corte de cabello", en: "Haircut" },
        durationMinutes: 45,
        suggestedPriceRange: [200, 500],
      },
      {
        name: { es: "Color", en: "Hair color" },
        durationMinutes: 90,
        suggestedPriceRange: [500, 1500],
      },
      {
        name: { es: "Manicura", en: "Manicure" },
        durationMinutes: 45,
        suggestedPriceRange: [150, 350],
      },
      {
        name: { es: "Pedicura", en: "Pedicure" },
        durationMinutes: 60,
        suggestedPriceRange: [200, 400],
      },
    ],
    defaultBufferMinutes: 10,
    defaultCancellationHours: 4,
    messagingTone: "casual",
    bookingPageHints: {
      serviceNoun: { es: "servicio", en: "service" },
      appointmentNoun: { es: "cita", en: "appointment" },
      staffNoun: { es: "estilista", en: "stylist" },
    },
  },

  fitness: {
    key: "fitness",
    displayName: { es: "Fitness / Entrenamiento", en: "Fitness / Personal training" },
    icon: "Dumbbell",
    emoji: "💪",
    status: "active",
    defaultServices: [
      {
        name: { es: "Sesión de entrenamiento", en: "Training session" },
        durationMinutes: 60,
        suggestedPriceRange: [300, 800],
      },
      {
        name: { es: "Evaluación física", en: "Fitness assessment" },
        durationMinutes: 90,
        suggestedPriceRange: [500, 1000],
      },
    ],
    defaultBufferMinutes: 10,
    defaultCancellationHours: 12,
    messagingTone: "casual",
    bookingPageHints: {
      serviceNoun: { es: "sesión", en: "session" },
      appointmentNoun: { es: "sesión", en: "session" },
      staffNoun: { es: "entrenador", en: "trainer" },
    },
  },

  spa: {
    key: "spa",
    displayName: { es: "Spa y estética", en: "Spa & aesthetics" },
    icon: "Leaf",
    emoji: "🌿",
    status: "active",
    defaultServices: [
      {
        name: { es: "Masaje relajante", en: "Relaxing massage" },
        durationMinutes: 60,
        suggestedPriceRange: [400, 900],
      },
      {
        name: { es: "Facial hidratante", en: "Hydrating facial" },
        durationMinutes: 60,
        suggestedPriceRange: [350, 800],
      },
      {
        name: { es: "Masaje de tejido profundo", en: "Deep tissue massage" },
        durationMinutes: 90,
        suggestedPriceRange: [600, 1200],
      },
    ],
    defaultBufferMinutes: 15,
    defaultCancellationHours: 24,
    messagingTone: "wellness",
    bookingPageHints: {
      serviceNoun: { es: "tratamiento", en: "treatment" },
      appointmentNoun: { es: "reserva", en: "booking" },
      staffNoun: { es: "terapeuta", en: "therapist" },
    },
  },

  tattoo: {
    key: "tattoo",
    displayName: { es: "Tatuajes y piercings", en: "Tattoo & piercing studio" },
    icon: "PenTool",
    emoji: "🖊️",
    status: "active",
    defaultServices: [
      {
        name: { es: "Tatuaje pequeño", en: "Small tattoo" },
        durationMinutes: 120,
        suggestedPriceRange: [800, 2000],
      },
      {
        name: { es: "Tatuaje mediano", en: "Medium tattoo" },
        durationMinutes: 240,
        suggestedPriceRange: [2000, 5000],
      },
      {
        name: { es: "Piercing", en: "Piercing" },
        durationMinutes: 30,
        suggestedPriceRange: [300, 800],
      },
    ],
    defaultBufferMinutes: 15,
    defaultCancellationHours: 48,
    messagingTone: "casual",
    bookingPageHints: {
      serviceNoun: { es: "servicio", en: "service" },
      appointmentNoun: { es: "cita", en: "appointment" },
      staffNoun: { es: "artista", en: "artist" },
    },
  },

  carwash: {
    key: "carwash",
    displayName: { es: "Lavado de autos", en: "Car wash & detailing" },
    icon: "Car",
    emoji: "🚗",
    status: "active",
    defaultServices: [
      {
        name: { es: "Lavado básico", en: "Basic wash" },
        durationMinutes: 30,
        suggestedPriceRange: [100, 200],
      },
      {
        name: { es: "Lavado completo", en: "Full wash" },
        durationMinutes: 60,
        suggestedPriceRange: [250, 450],
      },
      {
        name: { es: "Detailing interior", en: "Interior detailing" },
        durationMinutes: 120,
        suggestedPriceRange: [500, 1000],
      },
    ],
    defaultBufferMinutes: 10,
    defaultCancellationHours: 2,
    messagingTone: "professional",
    bookingPageHints: {
      serviceNoun: { es: "servicio", en: "service" },
      appointmentNoun: { es: "cita", en: "appointment" },
      staffNoun: { es: "técnico", en: "technician" },
    },
  },

  petgrooming: {
    key: "petgrooming",
    displayName: { es: "Peluquería para mascotas", en: "Pet grooming" },
    icon: "PawPrint",
    emoji: "🐾",
    status: "active",
    defaultServices: [
      {
        name: { es: "Baño y secado", en: "Bath & dry" },
        durationMinutes: 60,
        suggestedPriceRange: [200, 500],
      },
      {
        name: { es: "Corte de pelo", en: "Haircut" },
        durationMinutes: 90,
        suggestedPriceRange: [350, 700],
      },
      {
        name: { es: "Baño + corte", en: "Bath + haircut" },
        durationMinutes: 120,
        suggestedPriceRange: [450, 900],
      },
    ],
    defaultBufferMinutes: 15,
    defaultCancellationHours: 4,
    messagingTone: "casual",
    bookingPageHints: {
      serviceNoun: { es: "servicio", en: "service" },
      appointmentNoun: { es: "cita", en: "appointment" },
      staffNoun: { es: "groomer", en: "groomer" },
    },
  },

  other: {
    key: "other",
    displayName: { es: "Otro tipo de negocio", en: "Other business" },
    icon: "Building2",
    emoji: "🏢",
    status: "active",
    defaultServices: [],
    defaultBufferMinutes: 10,
    defaultCancellationHours: 4,
    messagingTone: "professional",
    bookingPageHints: {
      serviceNoun: { es: "servicio", en: "service" },
      appointmentNoun: { es: "cita", en: "appointment" },
      staffNoun: { es: "profesional", en: "professional" },
    },
  },
};

export function getVertical(key: VerticalKey): VerticalProfile {
  return VERTICALS[key];
}

export function getAllVerticals(): VerticalProfile[] {
  return Object.values(VERTICALS);
}

export function getActiveVerticals(): VerticalProfile[] {
  return getAllVerticals().filter((v) => v.status === "active");
}
