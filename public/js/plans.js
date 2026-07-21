/* plans.js — Biblioteca de planos prontos + wizard de sugestão */

// ─── Planos de Treino ─────────────────────────────────────────────────────────

const WORKOUT_PLANS = [
  {
    id: 'fullbody_init_3x',
    type: 'workout',
    name: 'Fullbody Iniciante 3×',
    description: 'Treino completo 3 vezes por semana. Ideal para quem está começando ou voltando à academia.',
    badge: 'Iniciante',
    stats: '3× por semana · 7 exercícios · ~50 min',
    tags: { goal: ['hipertrofia', 'condicionamento'], level: 'iniciante', days: 3, equipment: 'academia' },
    days: [
      { dow: 1, name: 'Treino A — Full Body', exercises: [
        { name: 'Agachamento Livre',            sets: 3, reps: 10, weight_kg: null },
        { name: 'Supino Reto com Barra',         sets: 3, reps: 10, weight_kg: null },
        { name: 'Remada Curvada',                sets: 3, reps: 10, weight_kg: null },
        { name: 'Desenvolvimento com Halteres',  sets: 3, reps: 12, weight_kg: null },
        { name: 'Rosca Direta',                  sets: 3, reps: 12, weight_kg: null },
        { name: 'Tríceps Pulley',                sets: 3, reps: 12, weight_kg: null },
        { name: 'Prancha Abdominal',             sets: 3, reps: 30, weight_kg: null },
      ]},
      { dow: 3, name: 'Treino B — Full Body', exercises: [
        { name: 'Leg Press 45°',                 sets: 3, reps: 12, weight_kg: null },
        { name: 'Supino Inclinado com Halteres', sets: 3, reps: 10, weight_kg: null },
        { name: 'Puxada Frontal',                sets: 3, reps: 10, weight_kg: null },
        { name: 'Elevação Lateral',              sets: 3, reps: 15, weight_kg: null },
        { name: 'Rosca Martelo',                 sets: 3, reps: 12, weight_kg: null },
        { name: 'Tríceps Testa',                 sets: 3, reps: 12, weight_kg: null },
        { name: 'Abdominal Crunch',              sets: 3, reps: 20, weight_kg: null },
      ]},
      { dow: 5, name: 'Treino A — Full Body', exercises: [
        { name: 'Agachamento Livre',             sets: 3, reps: 10, weight_kg: null },
        { name: 'Supino Reto com Barra',         sets: 3, reps: 10, weight_kg: null },
        { name: 'Remada Curvada',                sets: 3, reps: 10, weight_kg: null },
        { name: 'Desenvolvimento com Halteres',  sets: 3, reps: 12, weight_kg: null },
        { name: 'Rosca Direta',                  sets: 3, reps: 12, weight_kg: null },
        { name: 'Tríceps Pulley',                sets: 3, reps: 12, weight_kg: null },
        { name: 'Prancha Abdominal',             sets: 3, reps: 30, weight_kg: null },
      ]},
    ]
  },

  {
    id: 'abc_inter_3x',
    type: 'workout',
    name: 'ABC Intermediário 3×',
    description: 'Divisão ABC clássica: Peito+Tríceps / Costas+Bíceps / Pernas+Ombros. Alto volume por grupo muscular.',
    badge: 'Intermediário',
    stats: '3× por semana · 7-8 exercícios · ~60 min',
    tags: { goal: ['hipertrofia'], level: 'intermediario', days: 3, equipment: 'academia' },
    days: [
      { dow: 1, name: 'Treino A — Peito + Tríceps', exercises: [
        { name: 'Supino Reto com Barra',         sets: 4, reps: 8,  weight_kg: null },
        { name: 'Supino Inclinado com Halteres', sets: 3, reps: 10, weight_kg: null },
        { name: 'Crucifixo com Halteres',        sets: 3, reps: 12, weight_kg: null },
        { name: 'Crossover',                     sets: 3, reps: 15, weight_kg: null },
        { name: 'Tríceps Pulley',                sets: 4, reps: 12, weight_kg: null },
        { name: 'Tríceps Testa',                 sets: 3, reps: 10, weight_kg: null },
        { name: 'Mergulho (Dips)',               sets: 3, reps: 10, weight_kg: null },
      ]},
      { dow: 3, name: 'Treino B — Costas + Bíceps', exercises: [
        { name: 'Barra Fixa',                    sets: 4, reps: 8,  weight_kg: null },
        { name: 'Remada Curvada',                sets: 4, reps: 10, weight_kg: null },
        { name: 'Puxada Frontal',                sets: 3, reps: 12, weight_kg: null },
        { name: 'Remada Cavalinho',              sets: 3, reps: 12, weight_kg: null },
        { name: 'Rosca Direta com Barra',        sets: 4, reps: 10, weight_kg: null },
        { name: 'Rosca Martelo',                 sets: 3, reps: 12, weight_kg: null },
        { name: 'Rosca Concentrada',             sets: 3, reps: 12, weight_kg: null },
      ]},
      { dow: 5, name: 'Treino C — Pernas + Ombros', exercises: [
        { name: 'Agachamento Livre',             sets: 4, reps: 8,  weight_kg: null },
        { name: 'Leg Press 45°',                 sets: 3, reps: 12, weight_kg: null },
        { name: 'Extensora',                     sets: 3, reps: 15, weight_kg: null },
        { name: 'Mesa Flexora',                  sets: 3, reps: 12, weight_kg: null },
        { name: 'Panturrilha em Pé',             sets: 4, reps: 20, weight_kg: null },
        { name: 'Desenvolvimento com Barra',     sets: 4, reps: 10, weight_kg: null },
        { name: 'Elevação Lateral',              sets: 3, reps: 15, weight_kg: null },
        { name: 'Face Pull',                     sets: 3, reps: 15, weight_kg: null },
      ]},
    ]
  },

  {
    id: 'upper_lower_4x',
    type: 'workout',
    name: 'Upper/Lower 4×',
    description: 'Superior e inferior 2× por semana. Cada grupo muscular com mais frequência — ótimo para força e hipertrofia.',
    badge: 'Intermediário',
    stats: '4× por semana · 6-7 exercícios · ~60 min',
    tags: { goal: ['hipertrofia'], level: 'intermediario', days: 4, equipment: 'academia' },
    days: [
      { dow: 1, name: 'Upper A — Superior Força', exercises: [
        { name: 'Supino Reto com Barra',         sets: 4, reps: 6,  weight_kg: null },
        { name: 'Remada Curvada',                sets: 4, reps: 6,  weight_kg: null },
        { name: 'Desenvolvimento com Barra',     sets: 3, reps: 8,  weight_kg: null },
        { name: 'Puxada Frontal',                sets: 3, reps: 8,  weight_kg: null },
        { name: 'Rosca Direta',                  sets: 3, reps: 10, weight_kg: null },
        { name: 'Tríceps Pulley',                sets: 3, reps: 10, weight_kg: null },
      ]},
      { dow: 2, name: 'Lower A — Inferior Força', exercises: [
        { name: 'Agachamento Livre',             sets: 4, reps: 6,  weight_kg: null },
        { name: 'Levantamento Terra',            sets: 3, reps: 5,  weight_kg: null },
        { name: 'Leg Press 45°',                 sets: 3, reps: 10, weight_kg: null },
        { name: 'Mesa Flexora',                  sets: 3, reps: 10, weight_kg: null },
        { name: 'Panturrilha Sentado',           sets: 4, reps: 15, weight_kg: null },
      ]},
      { dow: 4, name: 'Upper B — Superior Volume', exercises: [
        { name: 'Supino Inclinado com Halteres', sets: 4, reps: 10, weight_kg: null },
        { name: 'Puxada Frontal',                sets: 4, reps: 10, weight_kg: null },
        { name: 'Elevação Lateral',              sets: 4, reps: 15, weight_kg: null },
        { name: 'Crucifixo com Halteres',        sets: 3, reps: 12, weight_kg: null },
        { name: 'Remada Cavalinho',              sets: 3, reps: 12, weight_kg: null },
        { name: 'Rosca Martelo',                 sets: 3, reps: 12, weight_kg: null },
        { name: 'Tríceps Testa',                 sets: 3, reps: 12, weight_kg: null },
      ]},
      { dow: 5, name: 'Lower B — Inferior Volume', exercises: [
        { name: 'Agachamento Hack',              sets: 4, reps: 10, weight_kg: null },
        { name: 'Avanço com Halteres',           sets: 3, reps: 12, weight_kg: null },
        { name: 'Extensora',                     sets: 3, reps: 15, weight_kg: null },
        { name: 'Flexora Deitado',               sets: 3, reps: 12, weight_kg: null },
        { name: 'Abdutor',                       sets: 3, reps: 15, weight_kg: null },
        { name: 'Panturrilha em Pé',             sets: 4, reps: 20, weight_kg: null },
      ]},
    ]
  },

  {
    id: 'ppl_avancado_6x',
    type: 'workout',
    name: 'Push / Pull / Legs 6×',
    description: 'PPL repetido 2× por semana. Alto volume e frequência máxima por grupo muscular. Para quem já treina há mais de 2 anos.',
    badge: 'Avançado',
    stats: '6× por semana · 7-8 exercícios · ~75 min',
    tags: { goal: ['hipertrofia'], level: 'avancado', days: 6, equipment: 'academia' },
    days: [
      { dow: 1, name: 'Push A — Peito + Ombro + Tríceps', exercises: [
        { name: 'Supino Reto com Barra',         sets: 4, reps: 6,  weight_kg: null },
        { name: 'Supino Inclinado com Halteres', sets: 4, reps: 10, weight_kg: null },
        { name: 'Crucifixo com Halteres',        sets: 3, reps: 12, weight_kg: null },
        { name: 'Desenvolvimento com Barra',     sets: 4, reps: 8,  weight_kg: null },
        { name: 'Elevação Lateral',              sets: 4, reps: 15, weight_kg: null },
        { name: 'Tríceps Pulley',                sets: 4, reps: 12, weight_kg: null },
        { name: 'Tríceps Testa',                 sets: 3, reps: 10, weight_kg: null },
      ]},
      { dow: 2, name: 'Pull A — Costas + Bíceps', exercises: [
        { name: 'Barra Fixa',                    sets: 4, reps: 8,  weight_kg: null },
        { name: 'Remada Curvada',                sets: 4, reps: 8,  weight_kg: null },
        { name: 'Puxada Frontal',                sets: 3, reps: 10, weight_kg: null },
        { name: 'Remada Unilateral',             sets: 3, reps: 10, weight_kg: null },
        { name: 'Rosca Direta com Barra',        sets: 4, reps: 10, weight_kg: null },
        { name: 'Rosca Martelo',                 sets: 3, reps: 12, weight_kg: null },
        { name: 'Encolhimento de Ombros',        sets: 3, reps: 15, weight_kg: null },
      ]},
      { dow: 3, name: 'Legs A — Pernas', exercises: [
        { name: 'Agachamento Livre',             sets: 4, reps: 6,  weight_kg: null },
        { name: 'Levantamento Terra Romeno',     sets: 4, reps: 8,  weight_kg: null },
        { name: 'Leg Press 45°',                 sets: 3, reps: 12, weight_kg: null },
        { name: 'Extensora',                     sets: 3, reps: 15, weight_kg: null },
        { name: 'Mesa Flexora',                  sets: 3, reps: 12, weight_kg: null },
        { name: 'Panturrilha em Pé',             sets: 5, reps: 15, weight_kg: null },
      ]},
      { dow: 4, name: 'Push B — Peito + Ombro + Tríceps', exercises: [
        { name: 'Supino Declinado com Barra',    sets: 4, reps: 8,  weight_kg: null },
        { name: 'Crossover',                     sets: 4, reps: 12, weight_kg: null },
        { name: 'Desenvolvimento com Halteres',  sets: 4, reps: 10, weight_kg: null },
        { name: 'Face Pull',                     sets: 4, reps: 15, weight_kg: null },
        { name: 'Elevação Frontal',              sets: 3, reps: 12, weight_kg: null },
        { name: 'Mergulho (Dips)',               sets: 4, reps: 10, weight_kg: null },
        { name: 'Tríceps Corda',                 sets: 3, reps: 15, weight_kg: null },
      ]},
      { dow: 5, name: 'Pull B — Costas + Bíceps', exercises: [
        { name: 'Remada Cavalinho',              sets: 4, reps: 10, weight_kg: null },
        { name: 'Pulldown Pegada Supinada',      sets: 4, reps: 10, weight_kg: null },
        { name: 'Remada Sentado na Polia',       sets: 3, reps: 12, weight_kg: null },
        { name: 'Pullover com Halter',           sets: 3, reps: 12, weight_kg: null },
        { name: 'Rosca Alternada com Halteres',  sets: 4, reps: 12, weight_kg: null },
        { name: 'Rosca Concentrada',             sets: 3, reps: 15, weight_kg: null },
      ]},
      { dow: 6, name: 'Legs B — Pernas', exercises: [
        { name: 'Agachamento Hack',              sets: 4, reps: 10, weight_kg: null },
        { name: 'Avanço com Barra',              sets: 3, reps: 10, weight_kg: null },
        { name: 'Stiff com Barra',               sets: 4, reps: 8,  weight_kg: null },
        { name: 'Abdutor',                       sets: 3, reps: 15, weight_kg: null },
        { name: 'Adutor',                        sets: 3, reps: 15, weight_kg: null },
        { name: 'Panturrilha Sentado',           sets: 5, reps: 20, weight_kg: null },
      ]},
    ]
  },

  {
    id: 'emag_funcional_4x',
    type: 'workout',
    name: 'Emagrecimento Funcional 4×',
    description: 'Circuitos de alta intensidade para queimar gordura e manter massa muscular. Treinos curtos e eficientes.',
    badge: 'Todos os níveis',
    stats: '4× por semana · Circuito · ~45 min',
    tags: { goal: ['emagrecimento'], level: ['iniciante', 'intermediario'], days: 4, equipment: 'academia' },
    days: [
      { dow: 1, name: 'Circuito A — Superior + Core', exercises: [
        { name: 'Flexão de Braços',              sets: 4, reps: 15, weight_kg: null },
        { name: 'Remada com Halter Unilateral',  sets: 3, reps: 12, weight_kg: null },
        { name: 'Desenvolvimento com Halteres',  sets: 3, reps: 12, weight_kg: null },
        { name: 'Burpee',                        sets: 4, reps: 10, weight_kg: null },
        { name: 'Prancha Abdominal',             sets: 3, reps: 45, weight_kg: null },
        { name: 'Mountain Climber',              sets: 3, reps: 20, weight_kg: null },
        { name: 'Abdominal Bicicleta',           sets: 3, reps: 20, weight_kg: null },
      ]},
      { dow: 2, name: 'Circuito B — Inferior + Cardio', exercises: [
        { name: 'Agachamento com Peso Corporal', sets: 4, reps: 20, weight_kg: null },
        { name: 'Avanço Alternado',              sets: 3, reps: 16, weight_kg: null },
        { name: 'Agachamento Sumô',              sets: 3, reps: 15, weight_kg: null },
        { name: 'Step Up',                       sets: 3, reps: 12, weight_kg: null },
        { name: 'Jumping Jack',                  sets: 4, reps: 30, weight_kg: null },
        { name: 'Polichinelo',                   sets: 3, reps: 40, weight_kg: null },
      ]},
      { dow: 4, name: 'Circuito C — Full Body HIIT', exercises: [
        { name: 'Burpee',                        sets: 5, reps: 10, weight_kg: null },
        { name: 'Flexão de Braços',              sets: 4, reps: 12, weight_kg: null },
        { name: 'Agachamento com Salto',         sets: 4, reps: 10, weight_kg: null },
        { name: 'Mountain Climber',              sets: 4, reps: 20, weight_kg: null },
        { name: 'Remada com Elástico',           sets: 3, reps: 15, weight_kg: null },
        { name: 'Prancha Dinâmica',              sets: 3, reps: 10, weight_kg: null },
      ]},
      { dow: 5, name: 'Circuito D — Inferior + Glúteos', exercises: [
        { name: 'Agachamento Búlgaro',           sets: 3, reps: 12, weight_kg: null },
        { name: 'Ponte de Glúteo',               sets: 4, reps: 20, weight_kg: null },
        { name: 'Cadeira Extensora',             sets: 3, reps: 15, weight_kg: null },
        { name: 'Panturrilha em Pé',             sets: 4, reps: 20, weight_kg: null },
        { name: 'Avanço com Joelho ao Chão',     sets: 3, reps: 12, weight_kg: null },
        { name: 'Corrida Estacionária',          sets: 5, reps: 30, weight_kg: null },
      ]},
    ]
  },

  {
    id: 'casa_sem_equip_3x',
    type: 'workout',
    name: 'Casa Sem Equipamento 3×',
    description: 'Treino completo com peso do corpo. Pode ser feito em qualquer lugar, sem precisar de academia.',
    badge: 'Iniciante',
    stats: '3× por semana · Calistenia · ~40 min',
    tags: { goal: ['hipertrofia', 'condicionamento', 'emagrecimento'], level: 'iniciante', days: 3, equipment: 'nenhum' },
    days: [
      { dow: 1, name: 'Superiores — Empurrar', exercises: [
        { name: 'Flexão de Braços',              sets: 4, reps: 15, weight_kg: null },
        { name: 'Flexão Diamante (Tríceps)',     sets: 3, reps: 10, weight_kg: null },
        { name: 'Flexão Inclinada',              sets: 3, reps: 10, weight_kg: null },
        { name: 'Pike Press (Ombros)',           sets: 3, reps: 12, weight_kg: null },
        { name: 'Prancha Abdominal',             sets: 3, reps: 45, weight_kg: null },
        { name: 'Abdominal Crunch',              sets: 3, reps: 20, weight_kg: null },
      ]},
      { dow: 3, name: 'Inferiores — Pernas e Glúteos', exercises: [
        { name: 'Agachamento com Peso Corporal', sets: 4, reps: 20, weight_kg: null },
        { name: 'Avanço Alternado',              sets: 3, reps: 16, weight_kg: null },
        { name: 'Ponte de Glúteo',               sets: 4, reps: 25, weight_kg: null },
        { name: 'Agachamento Sumô',              sets: 3, reps: 20, weight_kg: null },
        { name: 'Panturrilha em Pé',             sets: 4, reps: 25, weight_kg: null },
        { name: 'Agachamento com Salto',         sets: 3, reps: 12, weight_kg: null },
      ]},
      { dow: 5, name: 'Full Body — Circuito', exercises: [
        { name: 'Burpee',                        sets: 4, reps: 10, weight_kg: null },
        { name: 'Flexão de Braços',              sets: 3, reps: 12, weight_kg: null },
        { name: 'Agachamento com Peso Corporal', sets: 3, reps: 15, weight_kg: null },
        { name: 'Mountain Climber',              sets: 3, reps: 20, weight_kg: null },
        { name: 'Prancha Lateral',               sets: 3, reps: 30, weight_kg: null },
        { name: 'Superman',                      sets: 3, reps: 15, weight_kg: null },
      ]},
    ]
  },
];

// ─── Planos de Dieta ─────────────────────────────────────────────────────────

const DIET_PLANS = [
  {
    id: 'emag_1500',
    type: 'diet',
    name: 'Emagrecimento 1500 kcal',
    description: 'Déficit calórico para perda de gordura. Rico em proteína para preservar músculo durante o déficit.',
    badge: 'Déficit',
    stats: '~1500 kcal · 130g prot · 120g carb · 50g gord',
    tags: { goal: 'emagrecimento', calories: 1500 },
    dayTemplate: { name: 'Emagrecimento 1500kcal', foods: [
      { meal: 'cafe_manha',   name: 'Ovo mexido',             quantity_g: 120, calories: 186, protein: 15, carbs: 1,  fat: 14 },
      { meal: 'cafe_manha',   name: 'Pão integral',            quantity_g: 25,  calories: 65,  protein: 2,  carbs: 12, fat: 1  },
      { meal: 'cafe_manha',   name: 'Banana',                  quantity_g: 100, calories: 89,  protein: 1,  carbs: 23, fat: 0  },
      { meal: 'cafe_manha',   name: 'Café preto',              quantity_g: 200, calories: 5,   protein: 0,  carbs: 1,  fat: 0  },
      { meal: 'almoco', name: 'Arroz branco cozido',     quantity_g: 100, calories: 130, protein: 3,  carbs: 28, fat: 0  },
      { meal: 'almoco', name: 'Feijão cozido',           quantity_g: 80,  calories: 62,  protein: 4,  carbs: 11, fat: 0  },
      { meal: 'almoco', name: 'Frango grelhado',         quantity_g: 150, calories: 248, protein: 47, carbs: 0,  fat: 5  },
      { meal: 'almoco', name: 'Salada verde',            quantity_g: 100, calories: 20,  protein: 1,  carbs: 3,  fat: 0  },
      { meal: 'cafe_tarde',  name: 'Iogurte grego desnatado', quantity_g: 170, calories: 100, protein: 17, carbs: 7,  fat: 0  },
      { meal: 'cafe_tarde',  name: 'Maçã',                   quantity_g: 130, calories: 68,  protein: 0,  carbs: 18, fat: 0  },
      { meal: 'janta',  name: 'Batata doce cozida',      quantity_g: 150, calories: 129, protein: 2,  carbs: 30, fat: 0  },
      { meal: 'janta',  name: 'Frango grelhado',         quantity_g: 120, calories: 198, protein: 37, carbs: 0,  fat: 4  },
      { meal: 'janta',  name: 'Brócolis cozido',         quantity_g: 100, calories: 35,  protein: 2,  carbs: 7,  fat: 0  },
    ]},
  },

  {
    id: 'emag_1800',
    type: 'diet',
    name: 'Emagrecimento 1800 kcal',
    description: 'Déficit moderado, mais sustentável e com menor risco de perder músculo. Ideal para quem treina.',
    badge: 'Déficit Moderado',
    stats: '~1800 kcal · 150g prot · 160g carb · 55g gord',
    tags: { goal: 'emagrecimento', calories: 1800 },
    dayTemplate: { name: 'Emagrecimento 1800kcal', foods: [
      { meal: 'cafe_manha',   name: 'Ovo mexido',             quantity_g: 180, calories: 279, protein: 22, carbs: 2,  fat: 20 },
      { meal: 'cafe_manha',   name: 'Aveia em flocos',         quantity_g: 40,  calories: 148, protein: 5,  carbs: 26, fat: 3  },
      { meal: 'cafe_manha',   name: 'Banana',                  quantity_g: 120, calories: 107, protein: 1,  carbs: 27, fat: 0  },
      { meal: 'cafe_manha',   name: 'Leite desnatado',         quantity_g: 200, calories: 68,  protein: 7,  carbs: 10, fat: 0  },
      { meal: 'almoco', name: 'Arroz branco cozido',     quantity_g: 130, calories: 169, protein: 3,  carbs: 37, fat: 0  },
      { meal: 'almoco', name: 'Feijão cozido',           quantity_g: 100, calories: 77,  protein: 5,  carbs: 14, fat: 1  },
      { meal: 'almoco', name: 'Frango grelhado',         quantity_g: 180, calories: 297, protein: 56, carbs: 0,  fat: 6  },
      { meal: 'almoco', name: 'Salada com azeite',       quantity_g: 150, calories: 55,  protein: 1,  carbs: 4,  fat: 4  },
      { meal: 'cafe_tarde',  name: 'Iogurte grego',           quantity_g: 200, calories: 118, protein: 20, carbs: 8,  fat: 0  },
      { meal: 'cafe_tarde',  name: 'Fruta (qualquer)',         quantity_g: 150, calories: 80,  protein: 1,  carbs: 20, fat: 0  },
      { meal: 'janta',  name: 'Batata doce cozida',      quantity_g: 200, calories: 172, protein: 3,  carbs: 40, fat: 0  },
      { meal: 'janta',  name: 'Tilápia grelhada',        quantity_g: 150, calories: 173, protein: 35, carbs: 0,  fat: 4  },
      { meal: 'janta',  name: 'Legumes refogados',       quantity_g: 150, calories: 65,  protein: 2,  carbs: 12, fat: 2  },
    ]},
  },

  {
    id: 'manutencao_2200',
    type: 'diet',
    name: 'Manutenção 2200 kcal',
    description: 'Manter o peso atual enquanto treina. Boa distribuição de macros para recomposição corporal.',
    badge: 'Manutenção',
    stats: '~2200 kcal · 165g prot · 230g carb · 65g gord',
    tags: { goal: 'manutencao', calories: 2200 },
    dayTemplate: { name: 'Manutenção 2200kcal', foods: [
      { meal: 'cafe_manha',   name: 'Ovos mexidos (3 ovos)',   quantity_g: 180, calories: 279, protein: 22, carbs: 2,  fat: 20 },
      { meal: 'cafe_manha',   name: 'Aveia em flocos',         quantity_g: 60,  calories: 222, protein: 8,  carbs: 38, fat: 4  },
      { meal: 'cafe_manha',   name: 'Banana',                  quantity_g: 120, calories: 107, protein: 1,  carbs: 27, fat: 0  },
      { meal: 'cafe_manha',   name: 'Leite integral',          quantity_g: 200, calories: 122, protein: 6,  carbs: 10, fat: 7  },
      { meal: 'almoco', name: 'Arroz branco cozido',     quantity_g: 180, calories: 234, protein: 4,  carbs: 51, fat: 0  },
      { meal: 'almoco', name: 'Feijão cozido',           quantity_g: 120, calories: 92,  protein: 6,  carbs: 17, fat: 1  },
      { meal: 'almoco', name: 'Frango grelhado',         quantity_g: 200, calories: 330, protein: 62, carbs: 0,  fat: 7  },
      { meal: 'almoco', name: 'Salada com azeite',       quantity_g: 150, calories: 55,  protein: 1,  carbs: 4,  fat: 4  },
      { meal: 'cafe_tarde',  name: 'Pão integral',            quantity_g: 50,  calories: 130, protein: 5,  carbs: 24, fat: 2  },
      { meal: 'cafe_tarde',  name: 'Pasta de amendoim',       quantity_g: 30,  calories: 177, protein: 7,  carbs: 6,  fat: 15 },
      { meal: 'cafe_tarde',  name: 'Maçã',                   quantity_g: 150, calories: 78,  protein: 0,  carbs: 21, fat: 0  },
      { meal: 'janta',  name: 'Batata doce cozida',      quantity_g: 200, calories: 172, protein: 3,  carbs: 40, fat: 0  },
      { meal: 'janta',  name: 'Frango grelhado',         quantity_g: 150, calories: 248, protein: 47, carbs: 0,  fat: 5  },
      { meal: 'janta',  name: 'Legumes no vapor',        quantity_g: 150, calories: 53,  protein: 3,  carbs: 10, fat: 1  },
    ]},
  },

  {
    id: 'hipertrofia_2500',
    type: 'diet',
    name: 'Hipertrofia 2500 kcal',
    description: 'Superávit calórico leve para ganho de massa com menor acúmulo de gordura. Bulk limpo.',
    badge: 'Superávit',
    stats: '~2500 kcal · 185g prot · 270g carb · 75g gord',
    tags: { goal: 'hipertrofia', calories: 2500 },
    dayTemplate: { name: 'Hipertrofia 2500kcal', foods: [
      { meal: 'cafe_manha',   name: 'Ovos mexidos (4 ovos)',   quantity_g: 240, calories: 372, protein: 29, carbs: 2,  fat: 27 },
      { meal: 'cafe_manha',   name: 'Aveia em flocos',         quantity_g: 80,  calories: 296, protein: 10, carbs: 51, fat: 5  },
      { meal: 'cafe_manha',   name: 'Banana',                  quantity_g: 150, calories: 134, protein: 2,  carbs: 34, fat: 0  },
      { meal: 'cafe_manha',   name: 'Leite integral',          quantity_g: 300, calories: 183, protein: 9,  carbs: 15, fat: 11 },
      { meal: 'almoco', name: 'Arroz branco cozido',     quantity_g: 200, calories: 260, protein: 5,  carbs: 56, fat: 0  },
      { meal: 'almoco', name: 'Feijão cozido',           quantity_g: 130, calories: 100, protein: 7,  carbs: 18, fat: 1  },
      { meal: 'almoco', name: 'Frango grelhado',         quantity_g: 220, calories: 363, protein: 68, carbs: 0,  fat: 8  },
      { meal: 'almoco', name: 'Azeite de oliva',         quantity_g: 10,  calories: 88,  protein: 0,  carbs: 0,  fat: 10 },
      { meal: 'cafe_tarde',  name: 'Pão integral',            quantity_g: 75,  calories: 196, protein: 7,  carbs: 36, fat: 3  },
      { meal: 'cafe_tarde',  name: 'Pasta de amendoim',       quantity_g: 40,  calories: 236, protein: 9,  carbs: 8,  fat: 20 },
      { meal: 'cafe_tarde',  name: 'Banana',                  quantity_g: 120, calories: 107, protein: 1,  carbs: 27, fat: 0  },
      { meal: 'janta',  name: 'Batata doce cozida',      quantity_g: 250, calories: 215, protein: 4,  carbs: 50, fat: 0  },
      { meal: 'janta',  name: 'Carne bovina magra',      quantity_g: 200, calories: 258, protein: 54, carbs: 0,  fat: 7  },
      { meal: 'janta',  name: 'Legumes refogados',       quantity_g: 150, calories: 65,  protein: 2,  carbs: 12, fat: 2  },
    ]},
  },

  {
    id: 'hipertrofia_3000',
    type: 'diet',
    name: 'Hipertrofia 3000 kcal',
    description: 'Superávit calórico maior para ganho de massa rápido. Indicado para hardgainers ou treinos de alta intensidade.',
    badge: 'Superávit Agressivo',
    stats: '~3000 kcal · 210g prot · 340g carb · 85g gord',
    tags: { goal: 'hipertrofia', calories: 3000 },
    dayTemplate: { name: 'Hipertrofia 3000kcal', foods: [
      { meal: 'cafe_manha',   name: 'Ovos mexidos (4 ovos)',   quantity_g: 240, calories: 372, protein: 29, carbs: 2,  fat: 27 },
      { meal: 'cafe_manha',   name: 'Aveia em flocos',         quantity_g: 100, calories: 370, protein: 13, carbs: 63, fat: 7  },
      { meal: 'cafe_manha',   name: 'Banana',                  quantity_g: 200, calories: 178, protein: 2,  carbs: 46, fat: 1  },
      { meal: 'cafe_manha',   name: 'Leite integral',          quantity_g: 300, calories: 183, protein: 9,  carbs: 15, fat: 11 },
      { meal: 'almoco', name: 'Arroz branco cozido',     quantity_g: 250, calories: 325, protein: 6,  carbs: 70, fat: 0  },
      { meal: 'almoco', name: 'Feijão cozido',           quantity_g: 150, calories: 116, protein: 8,  carbs: 21, fat: 1  },
      { meal: 'almoco', name: 'Frango grelhado',         quantity_g: 250, calories: 413, protein: 78, carbs: 0,  fat: 9  },
      { meal: 'almoco', name: 'Azeite de oliva',         quantity_g: 15,  calories: 132, protein: 0,  carbs: 0,  fat: 15 },
      { meal: 'cafe_tarde',  name: 'Batata doce cozida',      quantity_g: 200, calories: 172, protein: 3,  carbs: 40, fat: 0  },
      { meal: 'cafe_tarde',  name: 'Frango grelhado',         quantity_g: 100, calories: 165, protein: 31, carbs: 0,  fat: 4  },
      { meal: 'cafe_tarde',  name: 'Pasta de amendoim',       quantity_g: 30,  calories: 177, protein: 7,  carbs: 6,  fat: 15 },
      { meal: 'janta',  name: 'Arroz branco cozido',     quantity_g: 200, calories: 260, protein: 5,  carbs: 56, fat: 0  },
      { meal: 'janta',  name: 'Carne bovina magra',      quantity_g: 250, calories: 323, protein: 68, carbs: 0,  fat: 9  },
      { meal: 'janta',  name: 'Legumes refogados',       quantity_g: 150, calories: 65,  protein: 2,  carbs: 12, fat: 2  },
    ]},
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DOW_LABELS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

function filterWorkoutPlans(answers) {
  return WORKOUT_PLANS.filter(p => {
    if (answers.equipment === 'nenhum' && p.tags.equipment !== 'nenhum') return false;
    if (answers.equipment === 'academia' && p.tags.equipment === 'nenhum') return false;
    const planGoals = Array.isArray(p.tags.goal) ? p.tags.goal : [p.tags.goal];
    if (!planGoals.includes(answers.goal)) return false;
    const wantDays = parseInt(answers.days);
    if (wantDays === 3 && p.tags.days !== 3) return false;
    if (wantDays === 4 && p.tags.days !== 4) return false;
    if (wantDays === 6 && p.tags.days < 5)  return false;
    return true;
  }).slice(0, 3);
}

// Scale a diet plan to user's exact calorie target
function scalePlanToCalories(basePlan, targetCal) {
  const baseCal = basePlan.dayTemplate.foods.reduce((s, f) => s + f.calories, 0);
  if (!baseCal) return basePlan;
  const f = targetCal / baseCal;
  return {
    ...basePlan,
    name: `${basePlan.dayTemplate.name.split(' kcal')[0].split(/\d{4}/)[0].trim()} ${targetCal} kcal`,
    dayTemplate: {
      name: `Dieta personalizada ${targetCal} kcal`,
      foods: basePlan.dayTemplate.foods.map(food => ({
        ...food,
        quantity_g: Math.round(food.quantity_g * f),
        calories:   Math.round(food.calories   * f),
        protein:    Math.round(food.protein    * f * 10) / 10,
        carbs:      Math.round(food.carbs      * f * 10) / 10,
        fat:        Math.round(food.fat        * f * 10) / 10,
      }))
    }
  };
}

// Choose the best base plan by goal
function basePlanForGoal(goal) {
  const map = { emagrecimento: 'emag_1800', manutencao: 'manutencao_2200', hipertrofia: 'hipertrofia_2500' };
  return DIET_PLANS.find(p => p.id === map[goal]);
}

// ─── Import ───────────────────────────────────────────────────────────────────

async function doImportPlan(plan, type, state) {
  if (!plan) return;
  try {
    if (type === 'workout') {
      // plan.days already has user-chosen DOWs from the mapping step
      await Promise.all([0,1,2,3,4,5,6].map(d => api.del(`/api/workout-templates/${d}`)));
      await Promise.all(plan.days.map(day =>
        api.put(`/api/workout-templates/${day.dow}`, { name: day.name, exercises: day.exercises })
      ));
      toast(`Plano "${plan.name}" importado!`);
      const { templates } = await api.get('/api/workout-templates');
      if (typeof renderWeekGrid === 'function') renderWeekGrid(templates, state);
    } else {
      await Promise.all([0,1,2,3,4,5,6].map(d =>
        api.put(`/api/diet-templates/${d}`, {
          name: plan.dayTemplate.name,
          foods: plan.dayTemplate.foods,
        })
      ));
      toast(`Plano "${plan.name}" importado!`);
      const { templates } = await api.get('/api/diet-templates');
      if (typeof renderDietWeekGrid === 'function') renderDietWeekGrid(templates, state);
    }
  } catch (err) {
    toast('Erro ao importar: ' + err.message, 'error');
  }
}

// ─── Wizard ───────────────────────────────────────────────────────────────────

function openPlanWizard(type, state) {
  document.getElementById('planWizardModal')?.remove();

  const answers = {};
  let step = 0;
  let steps; // built lazily so diet steps can reference state

  const overlay = document.createElement('div');
  overlay.id = 'planWizardModal';
  overlay.className = 'pw-overlay';
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);

  function render() {
    if (!steps) steps = type === 'workout' ? buildWorkoutSteps(answers) : buildDietSteps(answers, state);
    const s = steps[step];
    const isLast = step === steps.length - 1;

    overlay.innerHTML = `
      <div class="pw-box">
        <div class="pw-head">
          <div class="pw-progress-wrap">
            <div class="pw-progress-bar" style="width:${((step + 1) / steps.length) * 100}%"></div>
          </div>
          <button class="pw-close" onclick="document.getElementById('planWizardModal').remove()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="pw-body" id="pwBody">${s.render()}</div>
        <div class="pw-foot">
          ${step > 0
            ? `<button class="btn btn-ghost" id="pwBack">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg> Voltar
              </button>`
            : '<span></span>'}
          <button class="btn btn-primary" id="pwNext" ${s.noNext ? 'style="display:none"' : ''}>
            ${isLast ? 'Importar plano' : 'Próximo'}
            ${!isLast ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>` : ''}
          </button>
        </div>
      </div>`;

    document.getElementById('pwBack')?.addEventListener('click', () => { step--; render(); });
    document.getElementById('pwNext')?.addEventListener('click', async () => {
      if (!s.collect(answers)) return;
      if (isLast) { overlay.remove(); await doImportPlan(answers._plan, type, state); }
      else { step++; render(); }
    });

    overlay.querySelectorAll('.pw-option').forEach(label => {
      label.addEventListener('click', () => {
        label.closest('.pw-options')?.querySelectorAll('.pw-option').forEach(l => l.classList.remove('selected'));
        label.classList.add('selected');
      });
    });
    overlay.querySelectorAll('.pw-plan-card[data-id]').forEach(card => {
      card.addEventListener('click', () => {
        overlay.querySelectorAll('.pw-plan-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        card.querySelector('input[type=radio]').checked = true;
      });
    });

    // Day-mapping step: keep answers._dayMapping in sync as user changes selects
    overlay.querySelectorAll('.pw-day-select').forEach(sel => {
      sel.addEventListener('change', () => {
        const idx = parseInt(sel.dataset.idx);
        if (!answers._dayMapping) answers._dayMapping = [];
        answers._dayMapping[idx] = parseInt(sel.value);
      });
    });
  }

  render();
}

// ─── Step builders ────────────────────────────────────────────────────────────

function buildWorkoutSteps(answers) {
  return [
    // Step 0: Goal
    {
      render: () => `
        <h2 class="pw-title">Qual é o seu objetivo?</h2>
        <div class="pw-options">
          ${pwRadio('pw_goal', [
            { val: 'hipertrofia',     label: 'Ganhar músculo',   sub: 'Hipertrofia e força' },
            { val: 'emagrecimento',   label: 'Perder gordura',   sub: 'Queima de calorias' },
            { val: 'condicionamento', label: 'Condicionamento',  sub: 'Saúde e resistência' },
          ], answers.goal)}
        </div>`,
      collect: ans => radioCollect('pw_goal', ans, 'goal', 'Selecione um objetivo'),
    },
    // Step 1: Days/week
    {
      render: () => `
        <h2 class="pw-title">Quantos dias por semana você pode treinar?</h2>
        <div class="pw-options">
          ${pwRadio('pw_days', [
            { val: '3', label: '3 dias', sub: 'Clássico para iniciantes' },
            { val: '4', label: '4 dias', sub: 'Bom equilíbrio volume/descanso' },
            { val: '6', label: '5 ou 6 dias', sub: 'Alta frequência' },
          ], answers.days)}
        </div>`,
      collect: ans => radioCollect('pw_days', ans, 'days', 'Selecione os dias'),
    },
    // Step 2: Level
    {
      render: () => `
        <h2 class="pw-title">Qual é o seu nível de experiência?</h2>
        <div class="pw-options">
          ${pwRadio('pw_level', [
            { val: 'iniciante',     label: 'Iniciante',     sub: 'Menos de 6 meses de treino' },
            { val: 'intermediario', label: 'Intermediário', sub: '6 meses a 2 anos' },
            { val: 'avancado',      label: 'Avançado',      sub: 'Mais de 2 anos treinando' },
          ], answers.level)}
        </div>`,
      collect: ans => radioCollect('pw_level', ans, 'level', 'Selecione seu nível'),
    },
    // Step 3: Equipment
    {
      render: () => `
        <h2 class="pw-title">Qual equipamento você tem acesso?</h2>
        <div class="pw-options">
          ${pwRadio('pw_equip', [
            { val: 'academia', label: 'Academia completa',  sub: 'Máquinas, barras e halteres' },
            { val: 'nenhum',   label: 'Sem equipamento',    sub: 'Treino em casa com peso corporal' },
          ], answers.equipment)}
        </div>`,
      collect: ans => radioCollect('pw_equip', ans, 'equipment', 'Selecione o equipamento'),
    },
    // Step 4: Plan selection
    {
      render: () => {
        const plans = filterWorkoutPlans(answers);
        if (!plans.length) {
          return `
            <h2 class="pw-title">Nenhum plano encontrado</h2>
            <p style="color:var(--text-muted);margin-top:8px">Volte e tente ajustar os filtros.</p>`;
        }
        if (!answers._plan) answers._plan = { ...plans[0], days: plans[0].days.map(d => ({ ...d })) };
        return `
          <h2 class="pw-title">Planos sugeridos</h2>
          <p class="pw-subtitle">Escolha um para definir os dias de treino.</p>
          <div class="pw-plan-list">
            ${plans.map((p, i) => pwPlanCard(p, i === 0)).join('')}
          </div>`;
      },
      collect: ans => {
        const v = document.querySelector('input[name="pw_plan"]:checked')?.value;
        if (!v) { toast('Selecione um plano', 'error'); return false; }
        const found = WORKOUT_PLANS.find(p => p.id === v);
        // Deep clone days so we can reassign DOWs
        ans._plan = { ...found, days: found.days.map(d => ({ ...d })) };
        return true;
      },
    },
    // Step 5: Day mapping
    {
      render: () => {
        const plan = answers._plan;
        // Initialize _dayMapping with the plan's default DOWs (reset each time this step renders)
        answers._dayMapping = plan.days.map(d => d.dow);
        return `
          <h2 class="pw-title">Escolha os dias de treino</h2>
          <p class="pw-subtitle">Selecione qual dia da semana cada treino vai acontecer.</p>
          <div class="pw-day-map">
            ${plan.days.map((day, i) => `
              <div class="pw-day-row">
                <span class="pw-day-name">${day.name}</span>
                <select class="pw-day-select" data-idx="${i}">
                  ${DOW_LABELS.map((label, d) => `
                    <option value="${d}" ${answers._dayMapping[i] === d ? 'selected' : ''}>${label}</option>
                  `).join('')}
                </select>
              </div>`).join('')}
          </div>
          <p class="pw-import-note" style="margin-top:12px">Os outros dias da semana ficarão como descanso.</p>`;
      },
      collect: ans => {
        // _dayMapping is kept in sync by the 'change' listeners bound in render()
        const chosen = ans._dayMapping || ans._plan.days.map(d => d.dow);
        const unique = new Set(chosen);
        if (unique.size < chosen.length) {
          toast('Cada dia pode ser usado apenas uma vez', 'error'); return false;
        }
        // Apply chosen DOWs to the plan's days
        chosen.forEach((dow, i) => { ans._plan.days[i].dow = dow; });
        return true;
      },
    },
  ];
}

function buildDietSteps(answers, state) {
  return [
    // Step 0: Goal
    {
      render: () => `
        <h2 class="pw-title">Qual é o seu objetivo com a dieta?</h2>
        <div class="pw-options">
          ${pwRadio('pw_goal', [
            { val: 'emagrecimento', label: 'Emagrecer',    sub: 'Reduzir gordura corporal' },
            { val: 'manutencao',    label: 'Manter peso',  sub: 'Recomposição corporal' },
            { val: 'hipertrofia',   label: 'Ganhar massa', sub: 'Superávit calórico' },
          ], answers.goal)}
        </div>`,
      collect: ans => radioCollect('pw_goal', ans, 'goal', 'Selecione um objetivo'),
    },
    // Step 1: Generate plan from user's target calories
    {
      render: () => {
        const targetCal = state?.user?.target_calories;
        if (!targetCal) {
          return `
            <h2 class="pw-title">Calorias não calculadas ainda</h2>
            <div class="pw-import-note" style="margin-top:8px">
              Para gerar uma dieta personalizada, você precisa calcular seu gasto calórico primeiro.<br><br>
              Vá em <strong>Configurações → Calculadora de Calorias</strong>, preencha seus dados e clique em "Calcular e aplicar metas".
            </div>
            <p style="color:var(--text-muted);font-size:.82rem;margin-top:12px">Depois volte aqui e a dieta será gerada com as suas calorias exatas.</p>`;
        }
        const base = basePlanForGoal(answers.goal);
        const scaled = scalePlanToCalories(base, targetCal);
        answers._plan = scaled;

        const mealLabels = { cafe_manha: 'Café da manhã', almoco: 'Almoço', cafe_tarde: 'Café da tarde', janta: 'Jantar' };
        const byMeal = {};
        for (const f of scaled.dayTemplate.foods) {
          if (!byMeal[f.meal]) byMeal[f.meal] = [];
          byMeal[f.meal].push(f);
        }
        const totalCal = scaled.dayTemplate.foods.reduce((s, f) => s + f.calories, 0);
        const totalProt = Math.round(scaled.dayTemplate.foods.reduce((s, f) => s + f.protein, 0));
        const totalCarb = Math.round(scaled.dayTemplate.foods.reduce((s, f) => s + f.carbs, 0));
        const totalFat  = Math.round(scaled.dayTemplate.foods.reduce((s, f) => s + f.fat, 0));

        const preview = Object.entries(byMeal).map(([meal, foods]) => `
          <div class="pw-meal-row">
            <span class="pw-meal-label">${mealLabels[meal] || meal}</span>
            <span class="pw-meal-foods">${foods.map(f => f.name).join(' · ')}</span>
          </div>`).join('');

        return `
          <h2 class="pw-title">Dieta gerada para você</h2>
          <div class="pw-cal-badge">
            <span class="pw-cal-num">${totalCal}</span>
            <span class="pw-cal-label">kcal / dia</span>
            <span class="pw-cal-macros">${totalProt}g prot · ${totalCarb}g carb · ${totalFat}g gord</span>
          </div>
          <div class="pw-meals-preview" style="margin-top:14px">${preview}</div>
          <p class="pw-import-note" style="margin-top:14px">
            Plano calculado com base na sua meta de <strong>${targetCal} kcal</strong> configurada em Configurações.
            Será aplicado como template em todos os dias da semana.
          </p>`;
      },
      collect: ans => {
        if (!state?.user?.target_calories) { toast('Configure suas calorias em Configurações primeiro', 'error'); return false; }
        return !!ans._plan;
      },
    },
  ];
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

function pwRadio(name, opts, selected) {
  return opts.map((o, i) => `
    <label class="pw-option${selected === o.val || (!selected && i === 0) ? ' selected' : ''}">
      <input type="radio" name="${name}" value="${o.val}" ${selected === o.val || (!selected && i === 0) ? 'checked' : ''}>
      <span class="pw-opt-label">${o.label}</span>
      <span class="pw-opt-sub">${o.sub}</span>
    </label>`).join('');
}

function radioCollect(name, ans, key, errMsg) {
  const v = document.querySelector(`input[name="${name}"]:checked`)?.value;
  if (!v) { toast(errMsg, 'error'); return false; }
  ans[key] = v; return true;
}

function pwPlanCard(p, selected) {
  return `
    <div class="pw-plan-card${selected ? ' selected' : ''}" data-id="${p.id}">
      <input type="radio" name="pw_plan" value="${p.id}" ${selected ? 'checked' : ''} style="display:none">
      <div class="pw-plan-card-head">
        <span class="pw-plan-name">${p.name}</span>
        <span class="pw-badge">${p.badge}</span>
      </div>
      <p class="pw-plan-desc">${p.description}</p>
      <span class="pw-stats-row">${p.stats}</span>
    </div>`;
}

window.openPlanWizard = openPlanWizard;
