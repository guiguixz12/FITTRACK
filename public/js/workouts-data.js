/* ═══════════════════════════════════════════
   Workouts — programa semanal + modo ativo
   ═══════════════════════════════════════════ */

// ── Exercise Library ──────────────────────────────────────────────────────────
const EXERCISE_LIBRARY = {
  peito:   ['Supino Reto','Supino Inclinado','Supino Declinado','Supino c/ Halteres','Supino Inclinado c/ Halteres','Crucifixo Reto','Crucifixo Inclinado','Crossover','Pec Deck (Voador)','Flexão de Braço','Flexão Inclinada','Flexão Diamante','Pullover','Supino Decline c/ Halteres'],
  costas:  ['Puxada Frontal','Puxada Fechada','Puxada Neutra','Barra Fixa','Chin-up','Remada Curvada','Remada Unilateral','Remada Cavalinho','Remada na Máquina','Remada Serrote','Remada Baixa','Remada Alta na Polia','Levantamento Terra','Hiperextensão','Face Pull','Pullover'],
  ombros:  ['Desenvolvimento c/ Barra','Desenvolvimento c/ Halteres','Desenvolvimento Sentado','Arnold Press','Elevação Lateral','Elevação Lateral Sentado','Elevação Lateral na Polia','Elevação Frontal','Crucifixo Inverso','Crucifixo Inverso na Polia','Remada Alta','Encolhimento de Ombros'],
  biceps:  ['Rosca Direta','Rosca Alternada','Rosca Concentrada','Rosca Martelo','Rosca Scott','Rosca 21','Rosca no Cabo','Rosca Inclinada','Rosca Inversa','Rosca Zottman'],
  triceps: ['Tríceps Pulley','Tríceps Corda','Tríceps Barra','Tríceps Testa','Tríceps Francês','Tríceps Coice','Tríceps Banco (Dips)','Extensão Unilateral','Mergulho (Dips)','Kickback','Flexão Diamante'],
  pernas:  ['Agachamento Livre','Agachamento Sumô','Agachamento Goblet','Agachamento Hack','Agachamento Búlgaro','Leg Press','Leg Press 45°','Extensão de Pernas','Flexão de Pernas','Mesa Flexora','Stiff','Levantamento Terra Romeno','Levantamento Terra Sumo','Avanço','Afundo','Passada','Cadeira Adutora','Cadeira Abdutora','Hip Thrust','Glúteo 4 Apoios','Glúteo no Cabo','Elevação de Quadril','Abdutora com Elástico','Panturrilha em Pé','Panturrilha Sentado','Jump Squat'],
  abdomen: ['Crunch','Abdominal Infra','Oblíquo','Abdominal Bicicleta','Prancha','Prancha Lateral','Prancha com Elevação','Elevação de Pernas','Hanging Knee Raise','Abdominal na Polia','Rollout (Roda)','Abdominal Remador','Russian Twist','Dead Bug','Hollow Body'],
  cardio:  ['Esteira','Corrida','Caminhada','Bicicleta Ergométrica','Elíptico','Escada (Stairmaster)','Pular Corda','HIIT','Circuito','Remo Ergométrico','Natação','Jump','Burpee','Box Jump']
};

// ── Exercise metadata: muscles + equipment ────────────────────────────────────
const MUSCLE_LABELS = {
  'chest':          'Peitoral',
  'front-shoulder': 'Deltóide Frontal',
  'side-shoulder':  'Deltóide Lateral',
  'rear-shoulder':  'Deltóide Posterior',
  'biceps':         'Bíceps',
  'triceps':        'Tríceps',
  'forearms':       'Antebraço',
  'abs':            'Abdômen',
  'obliques':       'Oblíquos',
  'traps':          'Trapézio',
  'lats':           'Dorsais',
  'rhomboids':      'Rombóides',
  'lower-back':     'Lombar',
  'quads':          'Quadríceps',
  'hamstrings':     'Isquiotibiais',
  'glutes':         'Glúteos',
  'calves':         'Panturrilha',
  'hip-flexors':    'Flexores do Quadril',
};

// Primary muscles visible on each view (used for auto view detection)
const MUSCLE_VIEW = {
  'chest':'front','front-shoulder':'front','side-shoulder':'front',
  'biceps':'front','abs':'front','obliques':'front','hip-flexors':'front','quads':'front',
  'forearms':'front','traps':'back','rear-shoulder':'back','lats':'back',
  'rhomboids':'back','triceps':'back','lower-back':'back','glutes':'back','hamstrings':'back',
  'calves':'back',
};

// Which muscles to highlight when a muscle group chip is selected
const MG_MUSCLES = {
  peito:   ['chest','front-shoulder','triceps'],
  costas:  ['lats','rhomboids','lower-back','traps'],
  ombros:  ['side-shoulder','front-shoulder','rear-shoulder'],
  biceps:  ['biceps','forearms'],
  triceps: ['triceps'],
  pernas:  ['quads','hamstrings','glutes','calves'],
  abdomen: ['abs','obliques'],
  cardio:  [],
};

// Which view to show for each muscle group
const MG_VIEW = {
  peito:'front', costas:'back', ombros:'front', biceps:'front',
  triceps:'back', pernas:'front', abdomen:'front', cardio:'front',
};

// Exercise name → { imgStart, imgEnd } — null if no image downloaded
const EX_IMAGES = {
  'Supino Reto':                                 { imgStart:'/images/exercises/supino-reto/0.jpg', imgEnd:'/images/exercises/supino-reto/1.jpg' },
  'Supino Inclinado':                            { imgStart:'/images/exercises/supino-inclinado/0.jpg', imgEnd:'/images/exercises/supino-inclinado/1.jpg' },
  'Supino Declinado':                            { imgStart:'/images/exercises/supino-declinado/0.jpg', imgEnd:'/images/exercises/supino-declinado/1.jpg' },
  'Supino c/ Halteres':                          { imgStart:'/images/exercises/supino-c-halteres/0.jpg', imgEnd:'/images/exercises/supino-c-halteres/1.jpg' },
  'Supino Inclinado c/ Halteres':                { imgStart:'/images/exercises/supino-inclinado-c-halteres/0.jpg', imgEnd:'/images/exercises/supino-inclinado-c-halteres/1.jpg' },
  'Supino Decline c/ Halteres':                  { imgStart:'/images/exercises/supino-decline-c-halteres/0.jpg', imgEnd:'/images/exercises/supino-decline-c-halteres/1.jpg' },
  'Crucifixo Reto':                              { imgStart:'/images/exercises/crucifixo-reto/0.jpg', imgEnd:'/images/exercises/crucifixo-reto/1.jpg' },
  'Crucifixo Inclinado':                         { imgStart:'/images/exercises/crucifixo-inclinado/0.jpg', imgEnd:'/images/exercises/crucifixo-inclinado/1.jpg' },
  'Crossover':                                   { imgStart:'/images/exercises/crossover/0.jpg', imgEnd:'/images/exercises/crossover/1.jpg' },
  'Pec Deck (Voador)':                           { imgStart:'/images/exercises/pec-deck-voador/0.jpg', imgEnd:'/images/exercises/pec-deck-voador/1.jpg' },
  'Flexão de Braço':                             { imgStart:'/images/exercises/flexao-de-braco/0.jpg', imgEnd:'/images/exercises/flexao-de-braco/1.jpg' },
  'Flexão Inclinada':                            { imgStart:'/images/exercises/flexao-inclinada/0.jpg', imgEnd:'/images/exercises/flexao-inclinada/1.jpg' },
  'Flexão Diamante':                             { imgStart:'/images/exercises/flexao-diamante/0.jpg', imgEnd:'/images/exercises/flexao-diamante/1.jpg' },
  'Pullover':                                    { imgStart:'/images/exercises/pullover/0.jpg', imgEnd:'/images/exercises/pullover/1.jpg' },
  'Puxada Frontal':                              { imgStart:'/images/exercises/puxada-frontal/0.jpg', imgEnd:'/images/exercises/puxada-frontal/1.jpg' },
  'Puxada Fechada':                              { imgStart:'/images/exercises/puxada-fechada/0.jpg', imgEnd:'/images/exercises/puxada-fechada/1.jpg' },
  'Puxada Neutra':                               { imgStart:'/images/exercises/puxada-neutra/0.jpg', imgEnd:'/images/exercises/puxada-neutra/1.jpg' },
  'Barra Fixa':                                  { imgStart:'/images/exercises/barra-fixa/0.jpg', imgEnd:'/images/exercises/barra-fixa/1.jpg' },
  'Chin-up':                                     { imgStart:'/images/exercises/chin-up/0.jpg', imgEnd:'/images/exercises/chin-up/1.jpg' },
  'Remada Curvada':                              { imgStart:'/images/exercises/remada-curvada/0.jpg', imgEnd:'/images/exercises/remada-curvada/1.jpg' },
  'Remada Unilateral':                           { imgStart:'/images/exercises/remada-unilateral/0.jpg', imgEnd:'/images/exercises/remada-unilateral/1.jpg' },
  'Remada Cavalinho':                            { imgStart:'/images/exercises/remada-cavalinho/0.jpg', imgEnd:'/images/exercises/remada-cavalinho/1.jpg' },
  'Remada na Máquina':                           { imgStart:'/images/exercises/remada-na-maquina/0.jpg', imgEnd:'/images/exercises/remada-na-maquina/1.jpg' },
  'Remada Serrote':                              { imgStart:'/images/exercises/remada-serrote/0.jpg', imgEnd:'/images/exercises/remada-serrote/1.jpg' },
  'Remada Baixa':                                { imgStart:'/images/exercises/remada-baixa/0.jpg', imgEnd:'/images/exercises/remada-baixa/1.jpg' },
  'Remada Alta na Polia':                        { imgStart:'/images/exercises/remada-alta-na-polia/0.jpg', imgEnd:'/images/exercises/remada-alta-na-polia/1.jpg' },
  'Levantamento Terra':                          { imgStart:'/images/exercises/levantamento-terra/0.jpg', imgEnd:'/images/exercises/levantamento-terra/1.jpg' },
  'Hiperextensão':                               { imgStart:'/images/exercises/hiperextensao/0.jpg', imgEnd:'/images/exercises/hiperextensao/1.jpg' },
  'Face Pull':                                   { imgStart:'/images/exercises/face-pull/0.jpg', imgEnd:'/images/exercises/face-pull/1.jpg' },
  'Desenvolvimento c/ Barra':                    { imgStart:'/images/exercises/desenvolvimento-c-barra/0.jpg', imgEnd:'/images/exercises/desenvolvimento-c-barra/1.jpg' },
  'Desenvolvimento c/ Halteres':                 { imgStart:'/images/exercises/desenvolvimento-c-halteres/0.jpg', imgEnd:'/images/exercises/desenvolvimento-c-halteres/1.jpg' },
  'Desenvolvimento Sentado':                     { imgStart:'/images/exercises/desenvolvimento-sentado/0.jpg', imgEnd:'/images/exercises/desenvolvimento-sentado/1.jpg' },
  'Arnold Press':                                { imgStart:'/images/exercises/arnold-press/0.jpg', imgEnd:'/images/exercises/arnold-press/1.jpg' },
  'Elevação Lateral':                            { imgStart:'/images/exercises/elevacao-lateral/0.jpg', imgEnd:'/images/exercises/elevacao-lateral/1.jpg' },
  'Elevação Lateral Sentado':                    { imgStart:'/images/exercises/elevacao-lateral-sentado/0.jpg', imgEnd:'/images/exercises/elevacao-lateral-sentado/1.jpg' },
  'Elevação Lateral na Polia':                   { imgStart:'/images/exercises/elevacao-lateral-na-polia/0.jpg', imgEnd:'/images/exercises/elevacao-lateral-na-polia/1.jpg' },
  'Crucifixo Inverso na Polia':                  { imgStart:'/images/exercises/crucifixo-inverso-na-polia/0.jpg', imgEnd:'/images/exercises/crucifixo-inverso-na-polia/1.jpg' },
  'Elevação Frontal':                            { imgStart:'/images/exercises/elevacao-frontal/0.jpg', imgEnd:'/images/exercises/elevacao-frontal/1.jpg' },
  'Crucifixo Inverso':                           { imgStart:'/images/exercises/crucifixo-inverso/0.jpg', imgEnd:'/images/exercises/crucifixo-inverso/1.jpg' },
  'Remada Alta':                                 { imgStart:'/images/exercises/remada-alta/0.jpg', imgEnd:'/images/exercises/remada-alta/1.jpg' },
  'Encolhimento de Ombros':                      { imgStart:'/images/exercises/encolhimento-de-ombros/0.jpg', imgEnd:'/images/exercises/encolhimento-de-ombros/1.jpg' },
  'Rosca Direta':                                { imgStart:'/images/exercises/rosca-direta/0.jpg', imgEnd:'/images/exercises/rosca-direta/1.jpg' },
  'Rosca Alternada':                             { imgStart:'/images/exercises/rosca-alternada/0.jpg', imgEnd:'/images/exercises/rosca-alternada/1.jpg' },
  'Rosca Concentrada':                           { imgStart:'/images/exercises/rosca-concentrada/0.jpg', imgEnd:'/images/exercises/rosca-concentrada/1.jpg' },
  'Rosca Martelo':                               { imgStart:'/images/exercises/rosca-martelo/0.jpg', imgEnd:'/images/exercises/rosca-martelo/1.jpg' },
  'Rosca Scott':                                 { imgStart:'/images/exercises/rosca-scott/0.jpg', imgEnd:'/images/exercises/rosca-scott/1.jpg' },
  'Rosca 21':                                    { imgStart:'/images/exercises/rosca-21/0.jpg', imgEnd:'/images/exercises/rosca-21/1.jpg' },
  'Rosca no Cabo':                               { imgStart:'/images/exercises/rosca-no-cabo/0.jpg', imgEnd:'/images/exercises/rosca-no-cabo/1.jpg' },
  'Rosca Inclinada':                             { imgStart:'/images/exercises/rosca-inclinada/0.jpg', imgEnd:'/images/exercises/rosca-inclinada/1.jpg' },
  'Rosca Inversa':                               { imgStart:'/images/exercises/rosca-inversa/0.jpg', imgEnd:'/images/exercises/rosca-inversa/1.jpg' },
  'Rosca Zottman':                               { imgStart:'/images/exercises/rosca-zottman/0.jpg', imgEnd:'/images/exercises/rosca-zottman/1.jpg' },
  'Tríceps Pulley':                              { imgStart:'/images/exercises/triceps-pulley/0.jpg', imgEnd:'/images/exercises/triceps-pulley/1.jpg' },
  'Tríceps Corda':                               { imgStart:'/images/exercises/triceps-corda/0.jpg', imgEnd:'/images/exercises/triceps-corda/1.jpg' },
  'Tríceps Barra':                               { imgStart:'/images/exercises/triceps-barra/0.jpg', imgEnd:'/images/exercises/triceps-barra/1.jpg' },
  'Tríceps Testa':                               { imgStart:'/images/exercises/triceps-testa/0.jpg', imgEnd:'/images/exercises/triceps-testa/1.jpg' },
  'Tríceps Francês':                             { imgStart:'/images/exercises/triceps-frances/0.jpg', imgEnd:'/images/exercises/triceps-frances/1.jpg' },
  'Tríceps Coice':                               { imgStart:'/images/exercises/triceps-coice/0.jpg', imgEnd:'/images/exercises/triceps-coice/1.jpg' },
  'Tríceps Banco (Dips)':                        { imgStart:'/images/exercises/triceps-banco-dips/0.jpg', imgEnd:'/images/exercises/triceps-banco-dips/1.jpg' },
  'Extensão Unilateral':                         { imgStart:'/images/exercises/extensao-unilateral/0.jpg', imgEnd:'/images/exercises/extensao-unilateral/1.jpg' },
  'Mergulho (Dips)':                             { imgStart:'/images/exercises/mergulho-dips/0.jpg', imgEnd:'/images/exercises/mergulho-dips/1.jpg' },
  'Kickback':                                    { imgStart:'/images/exercises/kickback/0.jpg', imgEnd:'/images/exercises/kickback/1.jpg' },
  'Agachamento Livre':                           { imgStart:'/images/exercises/agachamento-livre/0.jpg', imgEnd:'/images/exercises/agachamento-livre/1.jpg' },
  'Agachamento Sumô':                            { imgStart:'/images/exercises/agachamento-sumo/0.jpg', imgEnd:'/images/exercises/agachamento-sumo/1.jpg' },
  'Agachamento Goblet':                          { imgStart:'/images/exercises/agachamento-goblet/0.jpg', imgEnd:'/images/exercises/agachamento-goblet/1.jpg' },
  'Agachamento Hack':                            { imgStart:'/images/exercises/agachamento-hack/0.jpg', imgEnd:'/images/exercises/agachamento-hack/1.jpg' },
  'Agachamento Búlgaro':                         { imgStart:'/images/exercises/agachamento-bulgaro/0.jpg', imgEnd:'/images/exercises/agachamento-bulgaro/1.jpg' },
  'Jump Squat':                                  { imgStart:'/images/exercises/jump-squat/0.jpg', imgEnd:'/images/exercises/jump-squat/1.jpg' },
  'Leg Press':                                   { imgStart:'/images/exercises/leg-press/0.jpg', imgEnd:'/images/exercises/leg-press/1.jpg' },
  'Leg Press 45°':                               { imgStart:'/images/exercises/leg-press-45/0.jpg', imgEnd:'/images/exercises/leg-press-45/1.jpg' },
  'Extensão de Pernas':                          { imgStart:'/images/exercises/extensao-de-pernas/0.jpg', imgEnd:'/images/exercises/extensao-de-pernas/1.jpg' },
  'Flexão de Pernas':                            { imgStart:'/images/exercises/flexao-de-pernas/0.jpg', imgEnd:'/images/exercises/flexao-de-pernas/1.jpg' },
  'Mesa Flexora':                                { imgStart:'/images/exercises/mesa-flexora/0.jpg', imgEnd:'/images/exercises/mesa-flexora/1.jpg' },
  'Stiff':                                       { imgStart:'/images/exercises/stiff/0.jpg', imgEnd:'/images/exercises/stiff/1.jpg' },
  'Levantamento Terra Romeno':                   { imgStart:'/images/exercises/levantamento-terra-romeno/0.jpg', imgEnd:'/images/exercises/levantamento-terra-romeno/1.jpg' },
  'Levantamento Terra Sumo':                     { imgStart:'/images/exercises/levantamento-terra-sumo/0.jpg', imgEnd:'/images/exercises/levantamento-terra-sumo/1.jpg' },
  'Avanço':                                      { imgStart:'/images/exercises/avanco/0.jpg', imgEnd:'/images/exercises/avanco/1.jpg' },
  'Afundo':                                      { imgStart:'/images/exercises/afundo/0.jpg', imgEnd:'/images/exercises/afundo/1.jpg' },
  'Passada':                                     { imgStart:'/images/exercises/passada/0.jpg', imgEnd:'/images/exercises/passada/1.jpg' },
  'Cadeira Adutora':                             { imgStart:'/images/exercises/cadeira-adutora/0.jpg', imgEnd:'/images/exercises/cadeira-adutora/1.jpg' },
  'Cadeira Abdutora':                            { imgStart:'/images/exercises/cadeira-abdutora/0.jpg', imgEnd:'/images/exercises/cadeira-abdutora/1.jpg' },
  'Hip Thrust':                                  { imgStart:'/images/exercises/hip-thrust/0.jpg', imgEnd:'/images/exercises/hip-thrust/1.jpg' },
  'Glúteo 4 Apoios':                             { imgStart:'/images/exercises/gluteo-4-apoios/0.jpg', imgEnd:'/images/exercises/gluteo-4-apoios/1.jpg' },
  'Glúteo no Cabo':                              { imgStart:'/images/exercises/gluteo-no-cabo/0.jpg', imgEnd:'/images/exercises/gluteo-no-cabo/1.jpg' },
  'Elevação de Quadril':                         { imgStart:'/images/exercises/elevacao-de-quadril/0.jpg', imgEnd:'/images/exercises/elevacao-de-quadril/1.jpg' },
  'Abdutora com Elástico':                       { imgStart:'/images/exercises/abdutora-com-elastico/0.jpg', imgEnd:'/images/exercises/abdutora-com-elastico/1.jpg' },
  'Panturrilha em Pé':                           { imgStart:'/images/exercises/panturrilha-em-pe/0.jpg', imgEnd:'/images/exercises/panturrilha-em-pe/1.jpg' },
  'Panturrilha Sentado':                         { imgStart:'/images/exercises/panturrilha-sentado/0.jpg', imgEnd:'/images/exercises/panturrilha-sentado/1.jpg' },
  'Crunch':                                      { imgStart:'/images/exercises/crunch/0.jpg', imgEnd:'/images/exercises/crunch/1.jpg' },
  'Abdominal Infra':                             { imgStart:'/images/exercises/abdominal-infra/0.jpg', imgEnd:'/images/exercises/abdominal-infra/1.jpg' },
  'Oblíquo':                                     { imgStart:'/images/exercises/obliquo/0.jpg', imgEnd:'/images/exercises/obliquo/1.jpg' },
  'Abdominal Bicicleta':                         null,
  'Prancha':                                     { imgStart:'/images/exercises/prancha/0.jpg', imgEnd:'/images/exercises/prancha/1.jpg' },
  'Prancha Lateral':                             { imgStart:'/images/exercises/prancha-lateral/0.jpg', imgEnd:'/images/exercises/prancha-lateral/1.jpg' },
  'Prancha com Elevação':                        { imgStart:'/images/exercises/prancha-com-elevacao/0.jpg', imgEnd:'/images/exercises/prancha-com-elevacao/1.jpg' },
  'Elevação de Pernas':                          { imgStart:'/images/exercises/elevacao-de-pernas/0.jpg', imgEnd:'/images/exercises/elevacao-de-pernas/1.jpg' },
  'Hanging Knee Raise':                          { imgStart:'/images/exercises/hanging-knee-raise/0.jpg', imgEnd:'/images/exercises/hanging-knee-raise/1.jpg' },
  'Abdominal na Polia':                          { imgStart:'/images/exercises/abdominal-na-polia/0.jpg', imgEnd:'/images/exercises/abdominal-na-polia/1.jpg' },
  'Rollout (Roda)':                              { imgStart:'/images/exercises/rollout-roda/0.jpg', imgEnd:'/images/exercises/rollout-roda/1.jpg' },
  'Abdominal Remador':                           { imgStart:'/images/exercises/abdominal-remador/0.jpg', imgEnd:'/images/exercises/abdominal-remador/1.jpg' },
  'Russian Twist':                               { imgStart:'/images/exercises/russian-twist/0.jpg', imgEnd:'/images/exercises/russian-twist/1.jpg' },
  'Dead Bug':                                    { imgStart:'/images/exercises/dead-bug/0.jpg', imgEnd:'/images/exercises/dead-bug/1.jpg' },
  'Hollow Body':                                 null,
  'Esteira':                                     null,
  'Corrida':                                     null,
  'Caminhada':                                   { imgStart:'/images/exercises/caminhada/0.jpg', imgEnd:'/images/exercises/caminhada/1.jpg' },
  'Bicicleta Ergométrica':                       { imgStart:'/images/exercises/bicicleta-ergometrica/0.jpg', imgEnd:'/images/exercises/bicicleta-ergometrica/1.jpg' },
  'Elíptico':                                    { imgStart:'/images/exercises/eliptico/0.jpg', imgEnd:'/images/exercises/eliptico/1.jpg' },
  'Escada (Stairmaster)':                        { imgStart:'/images/exercises/escada-stairmaster/0.jpg', imgEnd:'/images/exercises/escada-stairmaster/1.jpg' },
  'Pular Corda':                                 null,
  'HIIT':                                        null,
  'Circuito':                                    null,
  'Remo Ergométrico':                            { imgStart:'/images/exercises/remo-ergometrico/0.jpg', imgEnd:'/images/exercises/remo-ergometrico/1.jpg' },
  'Natação':                                     null,
  'Jump':                                        { imgStart:'/images/exercises/jump/0.jpg', imgEnd:'/images/exercises/jump/1.jpg' },
  'Burpee':                                      null,
  'Box Jump':                                    { imgStart:'/images/exercises/box-jump/0.jpg', imgEnd:'/images/exercises/box-jump/1.jpg' },
};


// Exercise → { muscles[], equipment }
const EX_META = {
  // PEITO
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
  // COSTAS
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
  // OMBROS
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
  // BÍCEPS
  'Rosca Direta':                  { muscles:['biceps','forearms'],                      equipment:'Barra' },
  'Rosca Alternada':               { muscles:['biceps','forearms'],                      equipment:'Halteres' },
  'Rosca Concentrada':             { muscles:['biceps'],                                 equipment:'Halteres' },
  'Rosca Martelo':                 { muscles:['biceps','forearms'],                      equipment:'Halteres' },
  'Rosca Scott':                   { muscles:['biceps'],                                 equipment:'Barra' },
  'Rosca 21':                      { muscles:['biceps'],                                 equipment:'Barra' },
  'Rosca no Cabo':                 { muscles:['biceps'],                                 equipment:'Cabo/Polia' },
  'Rosca Inclinada':               { muscles:['biceps'],                                 equipment:'Halteres' },
  'Rosca Inversa':                 { muscles:['forearms','biceps'],                      equipment:'Barra' },
  'Rosca Zottman':                 { muscles:['biceps','forearms'],                      equipment:'Halteres' },
  // TRÍCEPS
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
  // PERNAS
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
  // ABDÔMEN
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
  'Hollow Body':                   { muscles:['abs','hip-flexors'],                      equipment:'Peso Corporal' },
  // CARDIO
  'Esteira':                       { muscles:['quads','calves','hamstrings'],            equipment:'Máquina' },
  'Corrida':                       { muscles:['quads','calves','hamstrings'],            equipment:'Peso Corporal' },
  'Caminhada':                     { muscles:['quads','calves'],                         equipment:'Peso Corporal' },
  'Bicicleta Ergométrica':         { muscles:['quads','calves','hamstrings'],            equipment:'Máquina' },
  'Elíptico':                      { muscles:['quads','calves','hamstrings','glutes'],   equipment:'Máquina' },
  'Escada (Stairmaster)':          { muscles:['quads','glutes','calves'],               equipment:'Máquina' },
  'Pular Corda':                   { muscles:['calves','quads'],                         equipment:'Corda' },
  'HIIT':                          { muscles:['quads','glutes','abs'],                   equipment:'Peso Corporal' },
  'Circuito':                      { muscles:['quads','glutes','abs'],                   equipment:'Peso Corporal' },
  'Remo Ergométrico':              { muscles:['lats','rhomboids','quads','hamstrings'],  equipment:'Máquina' },
  'Natação':                       { muscles:['lats','front-shoulder','triceps'],        equipment:'Piscina' },
  'Jump':                          { muscles:['quads','calves','glutes'],               equipment:'Peso Corporal' },
  'Burpee':                        { muscles:['quads','glutes','chest','abs'],           equipment:'Peso Corporal' },
  'Box Jump':                      { muscles:['quads','glutes','calves'],               equipment:'Caixote' },
};

function autoView(muscles) {
  if (!muscles?.length) return 'front';
  let front = 0, back = 0;
  muscles.forEach(m => {
    const v = MUSCLE_VIEW[m];
    if (v === 'front') front++;
    else if (v === 'back') back++;
  });
  return back > front ? 'back' : 'front';
}

// ── Exercise info modal ───────────────────────────────────────────────────────
function showExerciseInfo(name) {
  const meta = EX_META[name];
  const el   = document.getElementById('exInfoModal');
  if (!el) return;

  const muscles   = meta?.muscles || [];
  const equipment = meta?.equipment || '—';
  const view      = autoView(muscles);

  document.getElementById('exInfoTitle').textContent = name;
  document.getElementById('exInfoEquip').innerHTML =
    `<span class="equip-tag">${equipment}</span>`;
  document.getElementById('exInfoMuscles').innerHTML = muscles.map((m, i) =>
    `<span class="muscle-tag${i === 0 ? ' primary' : ''}">${MUSCLE_LABELS[m] || m}</span>`
  ).join('');

  // Exercise photos
  const imgs    = EX_IMAGES[name];
  const imgWrap = document.getElementById('exInfoImages');
  const img0    = document.getElementById('exInfoImg0');
  const img1    = document.getElementById('exInfoImg1');
  if (imgs && imgWrap && img0 && img1) {
    img0.src = imgs.imgStart || '';
    img1.src = imgs.imgEnd   || imgs.imgStart || '';
    imgWrap.style.display = '';
  } else if (imgWrap) {
    imgWrap.style.display = 'none';
  }

  // Muscle map highlight (PNG overlay system)
  if (typeof highlightMuscles === 'function') {
    highlightMuscles({ primary: muscles.slice(0, 1), secondary: muscles.slice(1) });
  }

  el.style.display = '';
  el.querySelector('.ex-info-backdrop').onclick = () => { el.style.display = 'none'; };
}
window.showExerciseInfo = showExerciseInfo;

const DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const DAYS_FULL = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];


// ── Shared util (moved to data file for early availability) ────────────────────

// ── Shared util ───────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str).replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])
  );
}
