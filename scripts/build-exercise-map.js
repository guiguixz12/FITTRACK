#!/usr/bin/env node
// Builds data/exercise_image_map.json: maps PT exercise names → free-exercise-db IDs

const fs = require('fs');
const path = require('path');

const DB = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/free_exercise_db.json'), 'utf8'));

// ── Muscle translation: our keys → free-exercise-db muscle names ──────────────
const MUSCLE_MAP = {
  'chest':          ['chest'],
  'triceps':        ['triceps'],
  'biceps':         ['biceps'],
  'lats':           ['lats'],
  'quads':          ['quadriceps'],
  'hamstrings':     ['hamstrings'],
  'glutes':         ['glutes'],
  'lower-back':     ['lower back'],
  'calves':         ['calves'],
  'abs':            ['abdominals'],
  'obliques':       ['abdominals'],
  'traps':          ['traps'],
  'rhomboids':      ['middle back'],
  'front-shoulder': ['shoulders'],
  'side-shoulder':  ['shoulders'],
  'rear-shoulder':  ['shoulders'],
  'forearms':       ['forearms'],
  'hip-flexors':    ['abductors', 'adductors', 'hip flexors'],
};

// ── Equipment translation ─────────────────────────────────────────────────────
const EQUIP_MAP = {
  'Barra':           ['barbell'],
  'Halteres':        ['dumbbell'],
  'Cabo/Polia':      ['cable'],
  'Máquina':         ['machine'],
  'Peso Corporal':   ['body only'],
  'Barra Fixa':      ['body only'],
  'Banco':           ['body only', 'other'],
  'Elástico':        ['bands'],
  'Roda Abdominal':  ['other'],
  'Corda':           ['other'],
  'Piscina':         ['other'],
  'Caixote':         ['other'],
};

// ── Manual overrides: known perfect matches ───────────────────────────────────
const MANUAL = {
  'Supino Reto':                  'Barbell_Bench_Press_-_Medium_Grip',
  'Supino Inclinado':             'Barbell_Incline_Bench_Press_-_Medium_Grip',
  'Supino Declinado':             'Barbell_Decline_Bench_Press',
  'Supino c/ Halteres':          'Dumbbell_Bench_Press',
  'Supino Inclinado c/ Halteres':'Dumbbell_Incline_Bench_Press',
  'Supino Decline c/ Halteres':  'Dumbbell_Decline_Press',
  'Crucifixo Reto':              'Dumbbell_Flyes',
  'Crucifixo Inclinado':         'Dumbbell_Incline_Flyes',
  'Crossover':                   'Cable_Crossover',
  'Pec Deck (Voador)':           'Pec_Deck_Fly',
  'Flexão de Braço':             'Pushups',
  'Flexão Diamante':             'Close-Grip_Push-Up',
  'Pullover':                    'Bent-Arm_Dumbbell_Pullover',
  'Puxada Frontal':              'Wide-Grip_Lat_Pulldown',
  'Puxada Fechada':              'Close-Grip_Front_Lat_Pulldown',
  'Barra Fixa':                  'Pullups',
  'Chin-up':                     'Chin-Up',
  'Remada Curvada':              'Bent_Over_Barbell_Row',
  'Remada Unilateral':           'Bent_Over_Two-Dumbbell_Row',
  'Remada Serrote':              'One-Arm_Dumbbell_Row',
  'Remada Baixa':                'Seated_Cable_Rows',
  'Remada Alta na Polia':        'Face_Pull',
  'Levantamento Terra':          'Barbell_Deadlift',
  'Face Pull':                   'Face_Pull',
  'Desenvolvimento c/ Barra':    'Barbell_Shoulder_Press',
  'Desenvolvimento c/ Halteres': 'Dumbbell_Shoulder_Press',
  'Desenvolvimento Sentado':     'Seated_Dumbbell_Press',
  'Arnold Press':                'Arnold_Dumbbell_Press',
  'Elevação Lateral':            'Side_Lateral_Raise',
  'Elevação Lateral Sentado':    'Seated_Side_Lateral_Raise',
  'Elevação Lateral na Polia':   'Cable_Seated_Lateral_Raise',
  'Crucifixo Inverso':           'Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench',
  'Remada Alta':                 'Smith_Machine_Upright_Row',
  'Encolhimento de Ombros':      'Dumbbell_Shrug',
  'Rosca Direta':                'Barbell_Curl',
  'Rosca Alternada':             'Dumbbell_Alternate_Bicep_Curl',
  'Rosca Concentrada':           'Concentration_Curls',
  'Rosca Martelo':               'Hammer_Curls',
  'Rosca no Cabo':               'Cable_Hammer_Curls_-_Rope_Attachment',
  'Rosca Inclinada':             'Incline_Dumbbell_Curl',
  'Rosca Inversa':               'Standing_Dumbbell_Reverse_Curl',
  'Rosca Zottman':               'Zottman_Curl',
  'Tríceps Pulley':              'Triceps_Pushdown',
  'Tríceps Corda':               'Triceps_Pushdown',
  'Tríceps Testa':               'EZ-Bar_Skullcrusher',
  'Tríceps Francês':             'Cable_Rope_Overhead_Triceps_Extension',
  'Tríceps Coice':               'Tricep_Dumbbell_Kickback',
  'Tríceps Banco (Dips)':        'Bench_Dips',
  'Kickback':                    'Tricep_Dumbbell_Kickback',
  'Mergulho (Dips)':             'Dips_-_Chest_Version',
  'Agachamento Livre':           'Barbell_Full_Squat',
  'Agachamento Sumô':            'Barbell_Side_Split_Squat',
  'Agachamento Goblet':          'Goblet_Squat',
  'Agachamento Hack':            'Hack_Squat',
  'Agachamento Búlgaro':         'Barbell_Step_Ups',
  'Jump Squat':                  'Freehand_Jump_Squat',
  'Leg Press':                   'Leg_Press',
  'Leg Press 45°':               'Leg_Press',
  'Extensão de Pernas':          'Leg_Extensions',
  'Flexão de Pernas':            'Lying_Leg_Curls',
  'Mesa Flexora':                'Lying_Leg_Curls',
  'Stiff':                       'Romanian_Deadlift',
  'Levantamento Terra Romeno':   'Romanian_Deadlift',
  'Levantamento Terra Sumo':     'Sumo_Deadlift',
  'Avanço':                      'Dumbbell_Lunges',
  'Afundo':                      'Dumbbell_Lunges',
  'Passada':                     'Bodyweight_Walking_Lunge',
  'Hip Thrust':                  'Barbell_Hip_Thrust',
  'Elevação de Quadril':         'Single_Leg_Glute_Bridge',
  'Panturrilha em Pé':           'Standing_Calf_Raises',
  'Panturrilha Sentado':         'Seated_Calf_Raise',
  'Crunch':                      'Crunches',
  'Abdominal Infra':             'Reverse_Crunch',
  'Abdominal Bicicleta':         null,
  'Prancha':                     'Plank',
  'Elevação de Pernas':          'Hanging_Leg_Raise',
  'Hanging Knee Raise':          'Hanging_Leg_Raise',
  'Russian Twist':               'Russian_Twist',
  'Dead Bug':                    'Dead_Bug',
  'Hiperextensão':               'Hyperextensions_Back_Extensions',
  'Elevação Frontal':            'Side_Laterals_to_Front_Raise',
  'Flexão Inclinada':            'Incline_Push-Up',
  'Extensão Unilateral':         'Cable_One_Arm_Tricep_Extension',
  'Glúteo 4 Apoios':             'One-Legged_Cable_Kickback',
  'Glúteo no Cabo':              'One-Legged_Cable_Kickback',
  'Abdutora com Elástico':       'Thigh_Abductor',
  'Cadeira Abdutora':            'Thigh_Abductor',
  'Rollout (Roda)':              'Barbell_Ab_Rollout',
  'Prancha Lateral':             'Push_Up_to_Side_Plank',
  'Prancha com Elevação':        'Plank',
  'Escada (Stairmaster)':        'Stairmaster',
  'Elíptico':                    'Bicycling_Stationary',
  'Esteira':                     null,
  'Pular Corda':                 null,
  'Natação':                     null,
  'Corrida':                     null,
  'Burpee':                      null,
  'Box Jump':                    'Front_Box_Jump',
};

// Build lookup by id
const byId = {};
DB.forEach(e => { byId[e.id] = e; });

// ── EX_META (mirror of workouts.js) ──────────────────────────────────────────
const EX_META = {
  'Supino Reto':                   { muscles:['chest','triceps','front-shoulder'],        equipment:'Barra' },
  'Supino Inclinado':              { muscles:['chest','front-shoulder','triceps'],        equipment:'Barra' },
  'Supino Declinado':              { muscles:['chest','triceps'],                         equipment:'Barra' },
  'Supino c/ Halteres':            { muscles:['chest','triceps','front-shoulder'],        equipment:'Halteres' },
  'Supino Inclinado c/ Halteres':  { muscles:['chest','front-shoulder'],                 equipment:'Halteres' },
  'Supino Decline c/ Halteres':    { muscles:['chest','triceps'],                        equipment:'Halteres' },
  'Crucifixo Reto':                { muscles:['chest','front-shoulder'],                 equipment:'Halteres' },
  'Crucifixo Inclinado':           { muscles:['chest','front-shoulder'],                 equipment:'Halteres' },
  'Crossover':                     { muscles:['chest','front-shoulder'],                 equipment:'Cabo/Polia' },
  'Pec Deck (Voador)':             { muscles:['chest'],                                  equipment:'Máquina' },
  'Flexão de Braço':               { muscles:['chest','triceps','front-shoulder'],        equipment:'Peso Corporal' },
  'Flexão Inclinada':              { muscles:['chest','front-shoulder','triceps'],        equipment:'Peso Corporal' },
  'Flexão Diamante':               { muscles:['triceps','chest'],                        equipment:'Peso Corporal' },
  'Pullover':                      { muscles:['lats','chest','triceps'],                 equipment:'Halteres' },
  'Puxada Frontal':                { muscles:['lats','biceps','rhomboids'],              equipment:'Cabo/Polia' },
  'Puxada Fechada':                { muscles:['lats','biceps'],                          equipment:'Cabo/Polia' },
  'Puxada Neutra':                 { muscles:['lats','biceps'],                          equipment:'Cabo/Polia' },
  'Barra Fixa':                    { muscles:['lats','biceps','rhomboids'],              equipment:'Peso Corporal' },
  'Chin-up':                       { muscles:['lats','biceps'],                          equipment:'Peso Corporal' },
  'Remada Curvada':                { muscles:['lats','rhomboids','rear-shoulder','biceps'], equipment:'Barra' },
  'Remada Unilateral':             { muscles:['lats','rhomboids','biceps'],              equipment:'Halteres' },
  'Remada Cavalinho':              { muscles:['lats','rhomboids','rear-shoulder'],       equipment:'Barra' },
  'Remada na Máquina':             { muscles:['lats','rhomboids','rear-shoulder'],       equipment:'Máquina' },
  'Remada Serrote':                { muscles:['lats','rhomboids','biceps'],              equipment:'Halteres' },
  'Remada Baixa':                  { muscles:['lats','rhomboids','rear-shoulder','biceps'], equipment:'Cabo/Polia' },
  'Remada Alta na Polia':          { muscles:['rear-shoulder','rhomboids','traps'],      equipment:'Cabo/Polia' },
  'Levantamento Terra':            { muscles:['lower-back','glutes','hamstrings','traps','lats'], equipment:'Barra' },
  'Hiperextensão':                 { muscles:['lower-back','glutes','hamstrings'],       equipment:'Banco' },
  'Face Pull':                     { muscles:['rear-shoulder','rhomboids','traps'],      equipment:'Cabo/Polia' },
  'Desenvolvimento c/ Barra':      { muscles:['front-shoulder','side-shoulder','triceps','traps'], equipment:'Barra' },
  'Desenvolvimento c/ Halteres':   { muscles:['front-shoulder','side-shoulder','triceps'], equipment:'Halteres' },
  'Desenvolvimento Sentado':       { muscles:['front-shoulder','side-shoulder','triceps'], equipment:'Halteres' },
  'Arnold Press':                  { muscles:['front-shoulder','side-shoulder','triceps'], equipment:'Halteres' },
  'Elevação Lateral':              { muscles:['side-shoulder'],                          equipment:'Halteres' },
  'Elevação Lateral Sentado':      { muscles:['side-shoulder'],                          equipment:'Halteres' },
  'Elevação Lateral na Polia':     { muscles:['side-shoulder'],                          equipment:'Cabo/Polia' },
  'Crucifixo Inverso na Polia':    { muscles:['rear-shoulder','rhomboids'],              equipment:'Cabo/Polia' },
  'Elevação Frontal':              { muscles:['front-shoulder','traps'],                 equipment:'Halteres' },
  'Crucifixo Inverso':             { muscles:['rear-shoulder','rhomboids','traps'],      equipment:'Halteres' },
  'Remada Alta':                   { muscles:['side-shoulder','traps','front-shoulder'], equipment:'Barra' },
  'Encolhimento de Ombros':        { muscles:['traps'],                                  equipment:'Halteres' },
  'Rosca Direta':                  { muscles:['biceps','forearms'],                      equipment:'Barra' },
  'Rosca Alternada':               { muscles:['biceps','forearms'],                      equipment:'Halteres' },
  'Rosca Concentrada':             { muscles:['biceps'],                                 equipment:'Halteres' },
  'Rosca Martelo':                 { muscles:['biceps','forearms'],                      equipment:'Halteres' },
  'Rosca Scott':                   { muscles:['biceps'],                                 equipment:'Barra', _forceId: 'Preacher_Curl' },
  'Rosca 21':                      { muscles:['biceps'],                                 equipment:'Barra', _forceId: 'Preacher_Curl' },
  'Rosca no Cabo':                 { muscles:['biceps'],                                 equipment:'Cabo/Polia' },
  'Rosca Inclinada':               { muscles:['biceps'],                                 equipment:'Halteres' },
  'Rosca Inversa':                 { muscles:['forearms','biceps'],                      equipment:'Barra' },
  'Rosca Zottman':                 { muscles:['biceps','forearms'],                      equipment:'Halteres' },
  'Tríceps Pulley':                { muscles:['triceps'],                                equipment:'Cabo/Polia' },
  'Tríceps Corda':                 { muscles:['triceps'],                                equipment:'Cabo/Polia' },
  'Tríceps Barra':                 { muscles:['triceps'],                                equipment:'Cabo/Polia' },
  'Tríceps Testa':                 { muscles:['triceps'],                                equipment:'Barra' },
  'Tríceps Francês':               { muscles:['triceps'],                                equipment:'Halteres' },
  'Tríceps Coice':                 { muscles:['triceps'],                                equipment:'Halteres' },
  'Tríceps Banco (Dips)':          { muscles:['triceps','chest','front-shoulder'],       equipment:'Peso Corporal' },
  'Extensão Unilateral':           { muscles:['triceps'],                                equipment:'Halteres' },
  'Mergulho (Dips)':               { muscles:['triceps','chest','front-shoulder'],       equipment:'Peso Corporal' },
  'Kickback':                      { muscles:['triceps'],                                equipment:'Halteres' },
  'Agachamento Livre':             { muscles:['quads','glutes','hamstrings','lower-back'], equipment:'Barra' },
  'Agachamento Sumô':              { muscles:['quads','glutes','hamstrings'],            equipment:'Halteres' },
  'Agachamento Goblet':            { muscles:['quads','glutes'],                         equipment:'Halteres' },
  'Agachamento Hack':              { muscles:['quads','glutes'],                         equipment:'Máquina' },
  'Agachamento Búlgaro':           { muscles:['quads','glutes','hamstrings'],            equipment:'Halteres' },
  'Jump Squat':                    { muscles:['quads','glutes','calves'],                equipment:'Peso Corporal' },
  'Leg Press':                     { muscles:['quads','glutes','hamstrings'],            equipment:'Máquina' },
  'Leg Press 45°':                 { muscles:['quads','glutes','hamstrings'],            equipment:'Máquina' },
  'Extensão de Pernas':            { muscles:['quads'],                                  equipment:'Máquina' },
  'Flexão de Pernas':              { muscles:['hamstrings'],                             equipment:'Máquina' },
  'Mesa Flexora':                  { muscles:['hamstrings'],                             equipment:'Máquina' },
  'Stiff':                         { muscles:['hamstrings','glutes','lower-back'],       equipment:'Barra' },
  'Levantamento Terra Romeno':     { muscles:['hamstrings','glutes','lower-back'],       equipment:'Barra' },
  'Levantamento Terra Sumo':       { muscles:['hamstrings','glutes','lower-back','quads'], equipment:'Barra' },
  'Avanço':                        { muscles:['quads','glutes','hamstrings'],            equipment:'Halteres' },
  'Afundo':                        { muscles:['quads','glutes','hamstrings'],            equipment:'Halteres' },
  'Passada':                       { muscles:['quads','glutes','hamstrings'],            equipment:'Halteres' },
  'Cadeira Adutora':               { muscles:['hip-flexors'],                            equipment:'Máquina' },
  'Cadeira Abdutora':              { muscles:['glutes','hip-flexors'],                   equipment:'Máquina' },
  'Hip Thrust':                    { muscles:['glutes','hamstrings'],                    equipment:'Barra' },
  'Glúteo 4 Apoios':               { muscles:['glutes','hamstrings'],                   equipment:'Cabo/Polia' },
  'Glúteo no Cabo':                { muscles:['glutes','hamstrings'],                   equipment:'Cabo/Polia' },
  'Elevação de Quadril':           { muscles:['glutes','hamstrings'],                   equipment:'Peso Corporal' },
  'Abdutora com Elástico':         { muscles:['glutes'],                                 equipment:'Elástico' },
  'Panturrilha em Pé':             { muscles:['calves'],                                 equipment:'Máquina' },
  'Panturrilha Sentado':           { muscles:['calves'],                                 equipment:'Máquina' },
  'Crunch':                        { muscles:['abs'],                                    equipment:'Peso Corporal' },
  'Abdominal Infra':               { muscles:['abs','hip-flexors'],                      equipment:'Peso Corporal' },
  'Oblíquo':                       { muscles:['obliques','abs'],                         equipment:'Peso Corporal' },
  'Abdominal Bicicleta':           { muscles:['abs','obliques'],                         equipment:'Peso Corporal' },
  'Prancha':                       { muscles:['abs','obliques'],                         equipment:'Peso Corporal' },
  'Prancha Lateral':               { muscles:['obliques'],                               equipment:'Peso Corporal' },
  'Prancha com Elevação':          { muscles:['abs','obliques'],                         equipment:'Peso Corporal' },
  'Elevação de Pernas':            { muscles:['abs','hip-flexors'],                      equipment:'Peso Corporal' },
  'Hanging Knee Raise':            { muscles:['abs','hip-flexors'],                      equipment:'Barra Fixa' },
  'Abdominal na Polia':            { muscles:['abs'],                                    equipment:'Cabo/Polia' },
  'Rollout (Roda)':                { muscles:['abs','lower-back'],                       equipment:'Roda Abdominal' },
  'Abdominal Remador':             { muscles:['abs','obliques'],                         equipment:'Peso Corporal' },
  'Russian Twist':                 { muscles:['obliques','abs'],                         equipment:'Peso Corporal' },
  'Dead Bug':                      { muscles:['abs','obliques','hip-flexors'],           equipment:'Peso Corporal' },
  'Hollow Body':                   { muscles:['abs','hip-flexors'],                      equipment:'Peso Corporal', _noMatch: true },
  'Esteira':                       { muscles:['quads','calves','hamstrings'],            equipment:'Máquina' },
  'Corrida':                       { muscles:['quads','calves','hamstrings'],            equipment:'Peso Corporal' },
  'Caminhada':                     { muscles:['quads','calves'],                         equipment:'Peso Corporal' },
  'Bicicleta Ergométrica':         { muscles:['quads','calves','hamstrings'],            equipment:'Máquina' },
  'Elíptico':                      { muscles:['quads','calves','hamstrings','glutes'],   equipment:'Máquina' },
  'Escada (Stairmaster)':          { muscles:['quads','glutes','calves'],               equipment:'Máquina' },
  'Pular Corda':                   { muscles:['calves','quads'],                         equipment:'Corda' },
  'HIIT':                          { muscles:['quads','glutes','abs'],                   equipment:'Peso Corporal', _noMatch: true },
  'Circuito':                      { muscles:['quads','glutes','abs'],                   equipment:'Peso Corporal', _noMatch: true },
  'Remo Ergométrico':              { muscles:['lats','rhomboids','quads','hamstrings'],  equipment:'Máquina', _forceId: 'Rowing_Stationary' },
  'Natação':                       { muscles:['lats','front-shoulder','triceps'],        equipment:'Piscina' },
  'Jump':                          { muscles:['quads','calves','glutes'],               equipment:'Peso Corporal' },
  'Burpee':                        { muscles:['quads','glutes','chest','abs'],           equipment:'Peso Corporal' },
  'Box Jump':                      { muscles:['quads','glutes','calves'],               equipment:'Caixote' },
};

// ── Scoring: how well does a DB exercise match our exercise ──────────────────
function muscleScore(ourMuscles, dbExercise) {
  const dbAll = [...(dbExercise.primaryMuscles || []), ...(dbExercise.secondaryMuscles || [])];
  let hits = 0;
  ourMuscles.forEach(m => {
    const targets = MUSCLE_MAP[m] || [];
    if (targets.some(t => dbAll.includes(t))) hits++;
  });
  return hits / Math.max(ourMuscles.length, 1);
}

function equipScore(ourEquip, dbEquip) {
  const targets = EQUIP_MAP[ourEquip] || [];
  return targets.includes(dbEquip) ? 1 : 0;
}

// ── Build map ─────────────────────────────────────────────────────────────────
const result = {};
const nenhuma = [];

for (const [ptName, meta] of Object.entries(EX_META)) {
  // _noMatch flag: skip matching entirely
  if (meta._noMatch) {
    result[ptName] = { db_id: null, confidence: 'nenhuma', name_en: null };
    nenhuma.push(ptName);
    continue;
  }

  // _forceId: explicit override without using MANUAL dict
  if (meta._forceId) {
    const dbEntry = byId[meta._forceId];
    result[ptName] = dbEntry
      ? { db_id: meta._forceId, confidence: 'alta', name_en: dbEntry.name }
      : { db_id: null, confidence: 'nenhuma', name_en: null };
    if (!dbEntry) nenhuma.push(ptName);
    continue;
  }

  // Manual override has highest priority (null = explicit no-match)
  if (ptName in MANUAL) {
    const manualId = MANUAL[ptName];
    if (manualId === null) {
      result[ptName] = { db_id: null, confidence: 'nenhuma', name_en: null };
      nenhuma.push(ptName);
      continue;
    }
    const dbEntry = byId[manualId];
    if (dbEntry) {
      result[ptName] = { db_id: manualId, confidence: 'alta', name_en: dbEntry.name };
      continue;
    }
    // Manual id not found in DB — fall through to auto-match
  }

  // Auto-match: score all DB entries
  const candidates = DB
    .filter(e => e.images && e.images.length > 0)
    .map(e => {
      const ms = muscleScore(meta.muscles, e);
      const es = equipScore(meta.equipment, e.equipment);
      return { e, score: ms * 0.7 + es * 0.3 };
    })
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (!candidates.length) {
    result[ptName] = { db_id: null, confidence: 'nenhuma', name_en: null };
    nenhuma.push(ptName);
    continue;
  }

  const best = candidates[0];
  let confidence;
  if (best.score >= 0.85) confidence = 'alta';
  else if (best.score >= 0.5) confidence = 'media';
  else confidence = 'nenhuma';

  if (confidence === 'nenhuma') {
    result[ptName] = { db_id: null, confidence: 'nenhuma', name_en: null };
    nenhuma.push(ptName);
  } else {
    result[ptName] = { db_id: best.e.id, confidence, name_en: best.e.name };
  }
}

// ── Write output ──────────────────────────────────────────────────────────────
const outPath = path.join(__dirname, '../data/exercise_image_map.json');
fs.writeFileSync(outPath, JSON.stringify(result, null, 2));

// ── Summary ───────────────────────────────────────────────────────────────────
const counts = { alta: 0, media: 0, nenhuma: 0 };
Object.values(result).forEach(v => counts[v.confidence]++);

console.log('=== MAPEAMENTO CONCLUÍDO ===');
console.log(`Alta confiança:  ${counts.alta}`);
console.log(`Média confiança: ${counts.media}`);
console.log(`Nenhuma:         ${counts.nenhuma}`);
console.log(`\nSem match (${nenhuma.length}):`);
nenhuma.forEach(n => console.log(`  - ${n}`));
console.log(`\nArquivo salvo em: ${outPath}`);
