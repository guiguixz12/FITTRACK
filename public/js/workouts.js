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

// ── State ─────────────────────────────────────────────────────────────────────
let wkState      = null;   // AppState ref
let wkTemplates  = {};     // { [dow]: { id, name, exercises[] } }
let editingDow   = null;   // day being edited
let tplExList    = [];     // exercises in the template editor
let tplActiveMg  = null;   // active muscle group in template editor
let activeMg     = null;   // active muscle group in manual session
let currentWkId  = null;   // current manual session workout id

// Active workout mode


let waExercises    = [];
let waChecked      = 0;
let waTimerInt     = null;
let waStartTime    = null;
let waWorkoutDow   = null;
let waCurrentExIdx = 0;
let waPhase        = 'working'; // 'working' | 'resting'
let waNextLabel    = 'Próxima série';

// Rest timer
let restTimerInt   = null;
let restTimerSecs  = 0;
let waRestTotalSecs = 90;

const WA_RING_R    = 86;
const WA_RING_CIRC = +(2 * Math.PI * WA_RING_R).toFixed(2); // 540.35
const WA_STORE_KEY = 'ft_wk_session';

function waPersist() {
  if (!waStartTime || !waExercises.length) return;
  try {
    localStorage.setItem(WA_STORE_KEY, JSON.stringify({
      startTime:  waStartTime,
      dow:        waWorkoutDow,
      name:       document.getElementById('waTitle')?.textContent || '',
      exercises:  waExercises,
      exIdx:      waCurrentExIdx,
      phase:      waPhase,
    }));
  } catch {}
}

function waClearPersist() {
  localStorage.removeItem(WA_STORE_KEY);
}

function waLoadPersist() {
  try {
    const raw = localStorage.getItem(WA_STORE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    if (new Date(d.startTime).toISOString().slice(0, 10) !== today) {
      waClearPersist();
      return null;
    }
    return d;
  } catch { return null; }
}

function resumeWaTimerInterval() {
  clearInterval(waTimerInt);
  waTimerInt = setInterval(() => {
    const s  = Math.floor((Date.now() - waStartTime) / 1000);
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    const el = document.getElementById('waTimer');
    if (el) el.textContent = `${mm}:${ss}`;
  }, 1000);
}

// PR cache for current session [{exercise_name, volume}]
let sessionPRs = [];

// ── Init ──────────────────────────────────────────────────────────────────────
function initWorkouts(state) {
  wkState = state;

  // Sub-tab switching
  document.querySelectorAll('[data-view]').forEach(btn => {
    if (!btn.closest('#tab-workouts')) return;
    btn.addEventListener('click', () => switchWkView(btn.dataset.view));
  });

  setupProgramaView();
  setupEditDayView();
  setupRegistrarView(state);
  setupActiveMode(state);

  // Restore workout if page reloaded mid-session
  const saved = waLoadPersist();
  if (saved) restoreWorkoutSession(saved, state);

  // Restart timer interval when returning from another app
  document.addEventListener('visibilitychange', () => {
    if (document.hidden || !waStartTime) return;
    if (document.getElementById('workoutActive')?.style.display === 'none') return;
    resumeWaTimerInterval();
  });
}

function restoreWorkoutSession(saved, state) {
  waWorkoutDow    = saved.dow;
  waExercises     = saved.exercises;
  waCurrentExIdx  = saved.exIdx;
  waPhase         = 'working'; // always return to working phase
  waChecked       = waExercises.filter(e => e.done).length;
  waRestTotalSecs = 90;

  clearInterval(restTimerInt);
  sessionPRs = [];

  document.getElementById('waTitle').textContent      = saved.name;
  document.getElementById('waAddExtra').style.display = 'none';
  document.getElementById('waExtraName').value        = '';

  renderWaFocus();
  updateWaProgress();

  // Resume elapsed timer from saved start time
  waStartTime = saved.startTime;
  resumeWaTimerInterval();

  document.getElementById('workoutActive').style.display = '';
  document.body.style.overflow = 'hidden';

  toast('Treino retomado de onde parou!');
}

function switchWkView(view) {
  document.getElementById('wkViewPrograma').style.display   = view === 'programa'   ? '' : 'none';
  document.getElementById('wkViewEditDay').style.display    = view === 'editDay'    ? '' : 'none';
  document.getElementById('wkViewRegistrar').style.display  = view === 'registrar'  ? '' : 'none';
  document.getElementById('wkViewHistorico').style.display  = view === 'historico'  ? '' : 'none';

  document.querySelectorAll('#tab-workouts .sub-tab').forEach(b => {
    b.classList.toggle('active',
      b.dataset.view === view ||
      (view === 'editDay' && b.dataset.view === 'programa')
    );
  });

  if (view === 'historico') loadWorkoutHistory();
}

// ══════════════════════════════════════════
//  PROGRAMA SEMANAL
// ══════════════════════════════════════════
function setupProgramaView() {
  // no extra listeners needed, render is called on load
}

async function loadWorkouts(state) {
  wkState = state;
  switchWkView('programa');
  await loadWeekGrid();
}

async function loadWeekGrid() {
  const { templates } = await api.get('/api/workout-templates');
  wkTemplates = {};
  (templates || []).forEach(t => { wkTemplates[t.day_of_week] = t; });
  renderWeekGrid();
}

function renderWeekGrid() {
  const today = new Date().getDay();
  const grid  = document.getElementById('weekGrid');

  // Order: today first, then rest of week
  const order = Array.from({length: 7}, (_, i) => (today + i) % 7);

  grid.innerHTML = order.map((dow, idx) => {
    const tpl     = wkTemplates[dow];
    const isToday = dow === today;
    const hasWk   = tpl && tpl.name;

    const sectionLabel = isToday
      ? `<div class="week-section-label today-label">— Hoje —</div>`
      : idx === 1
        ? `<div class="week-section-label">Próximos dias</div>`
        : '';

    if (!hasWk) {
      return `${sectionLabel}
        <div class="day-card${isToday ? ' is-today' : ''}">
          <div class="day-header">
            <span class="day-dow${isToday ? ' today' : ''}">${DAYS[dow]}</span>
            <span class="day-name-text rest">Descanso</span>
            <button class="btn btn-ghost btn-sm" onclick="openEditDay(${dow})">Editar</button>
          </div>
        </div>`;
    }

    const exCount = tpl.exercises?.length || 0;
    const chips   = (tpl.exercises || []).map(ex => {
      const meta = [
        ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : '',
        ex.weight_kg       ? `${ex.weight_kg}kg`      : ''
      ].filter(Boolean).join(' @ ');
      return `<div class="wk-ex-row">
        <span class="wk-ex-name">${escHtml(ex.name)}</span>
        ${meta ? `<span class="wk-ex-meta">${meta}</span>` : ''}
      </div>`;
    }).join('');

    const startBtn = isToday
      ? `<button class="btn btn-primary" style="flex:1" onclick="startActiveWorkout(${dow})">▶ Iniciar Treino</button>`
      : `<button class="btn btn-secondary btn-sm" onclick="startActiveWorkout(${dow})">▶ Iniciar</button>`;

    // Today starts expanded; other days start collapsed
    const startExpanded = isToday;

    return `${sectionLabel}
      <div class="day-card${isToday ? ' is-today' : ''}" id="wk-card-${dow}">
        <div class="day-header" onclick="toggleWkCard(${dow})" style="cursor:pointer">
          <span class="day-dow${isToday ? ' today' : ''}">${DAYS[dow]}</span>
          <span class="day-name-text">${escHtml(tpl.name)}</span>
          <span class="wk-ex-count" id="wk-count-${dow}">${exCount} exercício${exCount !== 1 ? 's' : ''}</span>
          <span class="wk-chevron" id="wk-chevron-${dow}">${startExpanded ? '▲' : '▼'}</span>
        </div>
        <div class="day-body" id="wk-body-${dow}" style="${startExpanded ? '' : 'display:none'}">
          ${chips ? `<div class="wk-ex-list">${chips}</div>` : ''}
          <div class="day-actions" style="margin-top:10px">
            ${startBtn}
            <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();openEditDay(${dow})">Editar</button>
            <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();copyWkTemplate(${dow})" title="Copiar">${ICON.copy}</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function toggleWkCard(dow) {
  const body    = document.getElementById(`wk-body-${dow}`);
  const chevron = document.getElementById(`wk-chevron-${dow}`);
  if (!body) return;
  const opening = body.style.display === 'none';
  body.style.display  = opening ? '' : 'none';
  chevron.textContent = opening ? '▲' : '▼';
}
window.toggleWkCard = toggleWkCard;

// ══════════════════════════════════════════
//  HISTÓRICO DE TREINOS
// ══════════════════════════════════════════
async function loadWorkoutHistory() {
  const el = document.getElementById('wkHistoricoList');
  el.innerHTML = '<p style="color:var(--text-faint);font-size:.85rem;padding:12px 0">Carregando...</p>';
  try {
    const { workouts } = await api.get('/api/workouts');
    renderWorkoutHistory(workouts || []);
  } catch (err) {
    el.innerHTML = `<p style="color:var(--red);font-size:.85rem">${err.message}</p>`;
  }
}

function renderWorkoutHistory(workouts) {
  const el = document.getElementById('wkHistoricoList');
  if (!workouts.length) {
    el.innerHTML = '<p class="empty-state">Nenhum treino registrado ainda.</p>';
    return;
  }

  el.innerHTML = workouts.map(w => {
    const d       = w.date.split('-');
    const dateStr = `${d[2]}/${d[1]}/${d[0]}`;
    const exs     = w.exercises || [];
    const volume  = exs.reduce((s, e) => s + (e.sets || 0) * (e.reps || 0) * (e.weight_kg || 0), 0);

    const chipsHtml = exs.slice(0, 5).map(ex => {
      const meta = [
        ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : '',
        ex.weight_kg       ? `${ex.weight_kg}kg`      : ''
      ].filter(Boolean).join('@');
      return `<span class="hist-chip">${escHtml(ex.name)}${meta ? ' · ' + meta : ''}</span>`;
    }).join('');
    const more = exs.length > 5 ? `<span class="hist-chip hist-more">+${exs.length - 5}</span>` : '';

    return `
      <div class="hist-card">
        <div class="hist-card-head">
          <div>
            <div class="hist-date">${dateStr}</div>
            ${w.notes ? `<div class="hist-notes">${escHtml(w.notes)}</div>` : ''}
          </div>
          <div class="hist-stats">
            <span class="hist-stat">${exs.length} ex.</span>
            ${volume > 0 ? `<span class="hist-stat vol">${Math.round(volume).toLocaleString('pt-BR')} kg</span>` : ''}
          </div>
        </div>
        ${exs.length ? `<div class="hist-chips">${chipsHtml}${more}</div>` : ''}
      </div>`;
  }).join('');
}

async function copyWkTemplate(fromDow) {
  const src = wkTemplates[fromDow];
  if (!src) return;

  const otherDays = DAYS_FULL
    .map((label, dow) => dow !== fromDow ? { dow, label, hasTemplate: !!wkTemplates[dow] } : null)
    .filter(Boolean);

  const selected = await showDayCopyModal(src.name || DAYS_FULL[fromDow], otherDays);
  if (!selected || !selected.length) return;

  try {
    await Promise.all(selected.map(toDow =>
      api.put(`/api/workout-templates/${toDow}`, {
        name:      src.name,
        exercises: (src.exercises || []).map(ex => ({
          name:      ex.name,
          sets:      ex.sets,
          reps:      ex.reps,
          weight_kg: ex.weight_kg,
        }))
      })
    ));
    toast(`Treino copiado para ${selected.length} dia(s)!`);
    await loadWeekGrid();
  } catch (err) { toast(err.message, 'error'); }
}
window.copyWkTemplate = copyWkTemplate;

// ══════════════════════════════════════════
//  EDITAR DIA DO PROGRAMA
// ══════════════════════════════════════════
function openEditDay(dow) {
  editingDow = dow;
  const tpl  = wkTemplates[dow];
  tplExList  = tpl ? JSON.parse(JSON.stringify(tpl.exercises || [])) : [];
  tplActiveMg = null;

  document.getElementById('wkEditDayTitle').textContent = DAYS_FULL[dow];
  document.getElementById('tplName').value = tpl?.name || '';

  resetTplExForm();
  renderTplExList();
  hideTplChips();
  switchWkView('editDay');
}
window.openEditDay = openEditDay;

function setupEditDayView() {
  document.getElementById('wkBackBtn').addEventListener('click', () => switchWkView('programa'));

  // Muscle group chips for template editor
  document.getElementById('tplMuscleGroups').addEventListener('click', e => {
    const btn = e.target.closest('.mg-btn');
    if (!btn) return;
    const group = btn.dataset.group;
    if (tplActiveMg === group) {
      tplActiveMg = null;
      btn.classList.remove('active');
      hideTplChips();
    } else {
      tplActiveMg = group;
      document.querySelectorAll('#tplMuscleGroups .mg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTplChips(group);
    }
  });

  // Template exercise form
  document.getElementById('tplExForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('tplExName').value.trim();
    if (!name) return;
    const editIdx = document.getElementById('tplExEditIdx').value;
    const ex = {
      name,
      sets:      parseInt(document.getElementById('tplExSets').value)    || null,
      reps:      parseInt(document.getElementById('tplExReps').value)    || null,
      weight_kg: parseFloat(document.getElementById('tplExWeight').value) || null
    };

    if (editIdx !== '') {
      tplExList[parseInt(editIdx)] = ex;
    } else {
      tplExList.push(ex);
    }

    resetTplExForm();
    renderTplExList();
    if (tplActiveMg) renderTplChips(tplActiveMg);
  });

  document.getElementById('tplExCancelEdit').addEventListener('click', resetTplExForm);

  // Save
  document.getElementById('tplSaveBtn').addEventListener('click', async () => {
    const name = document.getElementById('tplName').value.trim();
    if (!name && tplExList.length === 0) {
      toast('Preencha o nome ou adicione exercícios', 'error'); return;
    }
    try {
      await api.put(`/api/workout-templates/${editingDow}`, { name, exercises: tplExList });
      toast('Programa salvo!');
      await loadWeekGrid();
      switchWkView('programa');
    } catch (err) { toast(err.message, 'error'); }
  });

  // Rest day
  document.getElementById('tplRestDayBtn').addEventListener('click', async () => {
    if (!confirm('Marcar este dia como descanso (remove o programa)?')) return;
    try {
      await api.del(`/api/workout-templates/${editingDow}`);
      toast('Marcado como descanso');
      await loadWeekGrid();
      switchWkView('programa');
    } catch (err) { toast(err.message, 'error'); }
  });
}

function renderTplChips(group) {
  const current  = document.getElementById('tplExName').value.trim();
  const muscles  = MG_MUSCLES[group] || [];
  const view     = MG_VIEW[group] || 'front';

  const diagramEl = document.getElementById('tplBodyDiagram');
  if (diagramEl && typeof renderChipMap === 'function') {
    renderChipMap(diagramEl, muscles, view);
  }

  document.getElementById('tplExChips').innerHTML = (EXERCISE_LIBRARY[group] || []).map(ex =>
    `<div class="ex-chip-row">
      <button type="button" class="ex-chip${current === ex ? ' selected' : ''}"
        onclick="tplSelectChip('${escHtml(ex)}')">${escHtml(ex)}</button>
      ${EX_META[ex] ? `<button type="button" class="ex-info-btn" onclick="showExerciseInfo('${escHtml(ex)}')" title="Ver músculos">ⓘ</button>` : ''}
    </div>`
  ).join('');
  document.getElementById('tplExChipsWrap').style.display = '';
}

function hideTplChips() {
  document.getElementById('tplExChipsWrap').style.display = 'none';
  document.getElementById('tplExChips').innerHTML = '';
  const d = document.getElementById('tplBodyDiagram');
  if (d) { d.innerHTML = ''; d.style.display = 'none'; }
}

function tplSelectChip(name) {
  document.getElementById('tplExName').value = name;
  document.querySelectorAll('#tplExChips .ex-chip').forEach(c =>
    c.classList.toggle('selected', c.textContent.trim() === name)
  );
  document.getElementById('tplExSets').focus();
}
window.tplSelectChip = tplSelectChip;

function renderTplExList() {
  const el = document.getElementById('tplExerciseList');
  if (!tplExList.length) {
    el.innerHTML = '<div class="empty-state">Nenhum exercício</div>'; return;
  }
  el.innerHTML = tplExList.map((ex, i) => {
    const parts = [];
    if (ex.sets && ex.reps) parts.push(`${ex.sets}×${ex.reps}`);
    else if (ex.sets)       parts.push(`${ex.sets} séries`);
    if (ex.weight_kg)       parts.push(`${ex.weight_kg}kg`);
    return `
      <div class="exercise-item">
        <div class="exercise-num">${i + 1}</div>
        <div class="exercise-item-info">
          <div class="exercise-item-name">${escHtml(ex.name)}</div>
          ${parts.length ? `<div class="exercise-item-meta">${parts.join(' @ ')}</div>` : ''}
        </div>
        <div class="exercise-item-actions">
          <button class="btn btn-icon btn-ghost" onclick="tplEditEx(${i})" title="Editar">${ICON.edit}</button>
          <button class="btn btn-icon btn-ghost" onclick="tplRemoveEx(${i})" title="Remover">${ICON.trash}</button>
        </div>
      </div>`;
  }).join('');
}

function tplEditEx(i) {
  const ex = tplExList[i];
  document.getElementById('tplExEditIdx').value = i;
  document.getElementById('tplExName').value     = ex.name;
  document.getElementById('tplExSets').value     = ex.sets      ?? '';
  document.getElementById('tplExReps').value     = ex.reps      ?? '';
  document.getElementById('tplExWeight').value   = ex.weight_kg ?? '';
  document.getElementById('tplExFormLabel').textContent      = 'Editar Exercício';
  document.getElementById('tplExSubmitBtn').textContent      = 'Atualizar';
  document.getElementById('tplExCancelEdit').style.display   = '';
  document.getElementById('tplExName').focus();
  if (tplActiveMg) renderTplChips(tplActiveMg);
}
window.tplEditEx = tplEditEx;

function tplRemoveEx(i) {
  tplExList.splice(i, 1);
  renderTplExList();
  if (tplActiveMg) renderTplChips(tplActiveMg);
}
window.tplRemoveEx = tplRemoveEx;

function resetTplExForm() {
  document.getElementById('tplExEditIdx').value  = '';
  document.getElementById('tplExName').value     = '';
  document.getElementById('tplExSets').value     = '';
  document.getElementById('tplExReps').value     = '';
  document.getElementById('tplExWeight').value   = '';
  document.getElementById('tplExFormLabel').textContent     = 'Adicionar Exercício';
  document.getElementById('tplExSubmitBtn').textContent     = 'Adicionar';
  document.getElementById('tplExCancelEdit').style.display  = 'none';
  document.querySelectorAll('#tplExChips .ex-chip').forEach(c => c.classList.remove('selected'));
}

// ══════════════════════════════════════════
//  MODO DE TREINO ATIVO
// ══════════════════════════════════════════
function startActiveWorkout(dow) {
  const tpl = wkTemplates[dow];
  waWorkoutDow    = dow;
  waExercises     = (tpl?.exercises || []).map(ex => ({ ...ex, setsCompleted: 0, done: false }));
  waChecked       = 0;
  waCurrentExIdx  = 0;
  waPhase         = 'working';
  waRestTotalSecs = 90;

  clearInterval(restTimerInt);
  sessionPRs = [];

  document.getElementById('waTitle').textContent      = tpl?.name || DAYS_FULL[dow];
  document.getElementById('waAddExtra').style.display = 'none';
  document.getElementById('waExtraName').value        = '';

  renderWaFocus();
  updateWaProgress();
  startWaTimer();
  waPersist();

  document.getElementById('workoutActive').style.display = '';
  document.body.style.overflow = 'hidden';
}
window.startActiveWorkout = startActiveWorkout;

function renderWaFocus() {
  const body = document.getElementById('waBody');
  if (!waExercises.length) {
    body.innerHTML = '<p class="empty-state" style="margin:24px 18px">Nenhum exercício. Use "+ Extra" para adicionar.</p>';
    return;
  }

  if (waCurrentExIdx >= waExercises.length) {
    body.innerHTML = `
      <div class="wa-done-all">
        <div class="wa-done-all-icon">🏆</div>
        <div class="wa-done-all-title">Treino concluído!</div>
        <div class="wa-done-all-sub">Todos os exercícios finalizados.<br>Toque em Finalizar para salvar.</div>
      </div>`;
    return;
  }

  const ex        = waExercises[waCurrentExIdx];
  const totalSets = ex.sets || 3;
  const doneSets  = ex.setsCompleted;

  const dots = Array.from({ length: totalSets }, (_, i) => {
    const cls = i < doneSets ? 'done' : i === doneSets ? 'active' : 'pending';
    return `<div class="wa-set-dot ${cls}">${i < doneSets ? '✓' : i + 1}</div>`;
  }).join('');

  const prescription = [
    totalSets + ' séries',
    ex.reps ? ex.reps + ' reps' : null
  ].filter(Boolean).join(' × ');

  const miniList = waExercises.map((e, idx) => {
    const cls       = e.done ? 'done' : idx === waCurrentExIdx ? 'active' : 'pending';
    const icon      = e.done ? '✓' : idx === waCurrentExIdx ? '▶' : idx + 1;
    const setsLabel = e.done
      ? `${e.sets}/${e.sets} ✓`
      : idx === waCurrentExIdx
        ? `${e.setsCompleted}/${e.sets || 3}`
        : `0/${e.sets || 3}`;
    return `
      <div class="wa-mini-ex ${cls}">
        <div class="wa-mini-icon">${icon}</div>
        <div class="wa-ex-name-mini">${escHtml(e.name)}</div>
        <div class="wa-mini-sets">${setsLabel}</div>
      </div>`;
  }).join('');

  body.innerHTML = `
    <div class="wa-focus-view">
      <div class="wa-ex-hero">
        <div class="wa-focus-meta-top">Exercício ${waCurrentExIdx + 1} de ${waExercises.length}</div>
        <div class="wa-focus-name">${escHtml(ex.name)}</div>
        <div class="wa-focus-prescription">${prescription}</div>
        <div class="wa-set-dots">${dots}</div>
        <div class="wa-set-label">Série ${doneSets + 1} de ${totalSets}</div>
        <div class="wa-weight-row">
          <span class="wa-weight-label">Carga</span>
          <input type="number" id="waWeightInput" class="wa-weight-input"
            value="${ex.weight_kg || ''}" step="0.5" min="0" placeholder="—"
            inputmode="decimal" onchange="updateExWeight(this.value)">
          <span class="wa-weight-unit">kg</span>
        </div>
      </div>
      <button class="btn btn-primary wa-complete-set-btn" onclick="completeSet()">
        ✓ &nbsp;Concluí a Série ${doneSets + 1}
      </button>
      <div class="wa-mini-section-label">Todos os exercícios</div>
      <div class="wa-mini-ex-list">${miniList}</div>
    </div>`;
}

function completeSet() {
  if (waPhase !== 'working') return;
  const ex = waExercises[waCurrentExIdx];
  if (!ex) return;

  ex.setsCompleted++;
  waPhase = 'resting';

  const allSetsDone    = ex.setsCompleted >= (ex.sets || 3);
  const isLastExercise = waCurrentExIdx >= waExercises.length - 1;

  if (allSetsDone) {
    ex.done = true;
    waChecked = waExercises.filter(e => e.done).length;
  }

  updateWaProgress();
  renderWaFocus();
  waPersist();

  if (allSetsDone && isLastExercise) {
    waNextLabel = 'Ver resultado';
  } else if (allSetsDone) {
    waNextLabel = 'Próximo exercício';
  } else {
    waNextLabel = `Próxima série (${ex.setsCompleted + 1}/${ex.sets || 3})`;
  }

  startRestTimer(90);
}
window.completeSet = completeSet;

function updateExWeight(val) {
  const w = parseFloat(val);
  if (waExercises[waCurrentExIdx]) {
    waExercises[waCurrentExIdx].weight_kg = isNaN(w) ? 0 : w;
    waPersist();
  }
}
window.updateExWeight = updateExWeight;

function proceedFromRest() {
  clearInterval(restTimerInt);

  const ex          = waExercises[waCurrentExIdx];
  const allSetsDone = ex && ex.setsCompleted >= (ex.sets || 3);

  if (allSetsDone) waCurrentExIdx++;

  waPhase = 'working';
  renderWaFocus();
  updateWaProgress();
  waPersist();
}
window.proceedFromRest = proceedFromRest;

function updateWaProgress() {
  const totalSets = waExercises.reduce((s, e) => s + (e.sets || 1), 0);
  const doneSets  = waExercises.reduce((s, e) => s + e.setsCompleted, 0);
  const pct       = totalSets > 0 ? (doneSets / totalSets) * 100 : 0;
  const exDone    = waExercises.filter(e => e.done).length;
  const volume    = waExercises
    .filter(e => e.setsCompleted > 0)
    .reduce((s, e) => s + e.setsCompleted * (e.reps || 0) * (e.weight_kg || 0), 0);

  document.getElementById('waProgBar').style.width   = pct + '%';
  document.getElementById('waProgLabel').textContent =
    `${doneSets}/${totalSets} séries · ${exDone}/${waExercises.length} ex${volume > 0 ? ' · ' + Math.round(volume).toLocaleString('pt-BR') + ' kg' : ''}`;
}

// ── Rest Timer — circular ring ────────────────────────────────────────────────
function renderRestScreen() {
  const ex          = waExercises[waCurrentExIdx];
  const allSetsDone = ex && ex.setsCompleted >= (ex.sets || 3);

  let nextLabel, nextName;
  if (allSetsDone) {
    const nextEx = waExercises[waCurrentExIdx + 1];
    if (nextEx) { nextLabel = 'Próximo exercício'; nextName = nextEx.name; }
    else        { nextLabel = 'Último concluído!'; nextName = 'Toque para finalizar'; }
  } else {
    nextLabel = `Série ${(ex?.setsCompleted || 0) + 1} de ${ex?.sets || 3}`;
    nextName  = ex?.name || '';
  }

  document.getElementById('waBody').innerHTML = `
    <div class="wa-rest-screen">
      <div class="wa-rest-label">Descansando</div>
      <div class="wa-ring-wrap">
        <svg class="wa-ring-svg" viewBox="0 0 200 200">
          <circle class="wa-ring-track" cx="100" cy="100" r="${WA_RING_R}"/>
          <circle class="wa-ring-arc"   cx="100" cy="100" r="${WA_RING_R}"
            id="waRingArc"
            stroke-dasharray="${WA_RING_CIRC}"
            stroke-dashoffset="0"/>
        </svg>
        <div class="wa-ring-center">
          <div class="wa-ring-time"  id="waRestTimerCount">--</div>
          <div class="wa-ring-ready" id="waRingReady" style="display:none">Pronto!</div>
        </div>
      </div>
      <div class="wa-rest-next-info">
        <div class="wa-rest-next-label">${escHtml(nextLabel)}</div>
        <div class="wa-rest-next-name">${escHtml(nextName)}</div>
      </div>
      <div class="wa-rest-adjust">
        <button class="btn btn-ghost btn-sm" onclick="adjustRestTimer(-15)">-15s</button>
        <button id="waSkipBtn" class="btn btn-ghost btn-sm wa-skip-btn" onclick="proceedFromRest()">Pular descanso</button>
        <button class="btn btn-ghost btn-sm" onclick="adjustRestTimer(+15)">+15s</button>
      </div>
    </div>`;

  updateRestTimerDisplay();
}

function startRestTimer(secs) {
  clearInterval(restTimerInt);
  restTimerSecs   = secs;
  waRestTotalSecs = secs;

  renderRestScreen();

  restTimerInt = setInterval(() => {
    restTimerSecs--;
    if (restTimerSecs <= 0) {
      restTimerSecs = 0;
      clearInterval(restTimerInt);
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      updateRestTimerDisplay();

      const arcEl   = document.getElementById('waRingArc');
      const countEl = document.getElementById('waRestTimerCount');
      const readyEl = document.getElementById('waRingReady');
      const skipBtn = document.getElementById('waSkipBtn');

      if (arcEl)   arcEl.classList.add('complete');
      if (countEl) countEl.style.display = 'none';
      if (readyEl) readyEl.style.display = '';
      if (skipBtn) { skipBtn.textContent = waNextLabel; skipBtn.classList.add('ready'); }
    } else {
      updateRestTimerDisplay();
    }
  }, 1000);
}

function updateRestTimerDisplay() {
  const secs    = Math.max(restTimerSecs, 0);
  const countEl = document.getElementById('waRestTimerCount');
  const arcEl   = document.getElementById('waRingArc');

  if (countEl) {
    const m = Math.floor(secs / 60);
    const s = String(secs % 60).padStart(2, '0');
    countEl.textContent = `${m}:${s}`;
  }
  if (arcEl && waRestTotalSecs > 0) {
    const offset = (WA_RING_CIRC * (1 - secs / waRestTotalSecs)).toFixed(2);
    arcEl.style.strokeDashoffset = offset;
  }
}

function adjustRestTimer(delta) {
  restTimerSecs = Math.max(restTimerSecs + delta, 5);
  updateRestTimerDisplay();
}
window.adjustRestTimer = adjustRestTimer;

function startWaTimer() {
  clearInterval(waTimerInt);
  waStartTime = Date.now();
  waTimerInt = setInterval(() => {
    const s   = Math.floor((Date.now() - waStartTime) / 1000);
    const mm  = String(Math.floor(s / 60)).padStart(2, '0');
    const ss  = String(s % 60).padStart(2, '0');
    document.getElementById('waTimer').textContent = `${mm}:${ss}`;
  }, 1000);
}

function setupActiveMode(state) {
  // Cancel
  document.getElementById('waCancelBtn').addEventListener('click', () => {
    if (!confirm('Cancelar treino? O progresso não será salvo.')) return;
    closeActiveMode();
  });

  // Toggle extra input
  document.getElementById('waToggleExtra').addEventListener('click', () => {
    const el = document.getElementById('waAddExtra');
    const showing = el.style.display !== 'none';
    el.style.display = showing ? 'none' : '';
    if (!showing) document.getElementById('waExtraName').focus();
  });

  // Add extra exercise
  document.getElementById('waAddExtraBtn').addEventListener('click', () => {
    const name = document.getElementById('waExtraName').value.trim();
    if (!name) return;
    waExercises.push({ name, sets: 3, reps: null, weight_kg: null, setsCompleted: 0, done: false });
    document.getElementById('waExtraName').value = '';
    document.getElementById('waAddExtra').style.display = 'none';
    updateWaProgress();
    renderWaFocus();
  });

  // Finish
  document.getElementById('waFinishBtn').addEventListener('click', async () => {
    await finishActiveWorkout(state);
  });
}

async function finishActiveWorkout(state) {
  const doneEx    = waExercises.filter(e => e.done);
  const partialEx = waExercises.filter(e => e.setsCompleted > 0 && !e.done);
  const totalSets = waExercises.reduce((s, e) => s + e.setsCompleted, 0);

  if (totalSets === 0 && !confirm('Nenhuma série concluída. Salvar mesmo assim?')) return;

  const today    = new Date().toISOString().slice(0, 10);
  const elapsed  = waStartTime ? Math.floor((Date.now() - waStartTime) / 1000) : 0;
  const mm       = Math.floor(elapsed / 60);
  const ss       = elapsed % 60;
  const notesStr = `Duração: ${mm}m${ss}s | ${doneEx.length}/${waExercises.length} exercícios concluídos · ${totalSets} séries totais`;

  try {
    const wkRes     = await api.post('/api/workouts', { date: today, notes: notesStr });
    const workoutId = wkRes.id;

    // Save exercises that had at least 1 set completed; use setsCompleted as actual sets done
    const toSave = waExercises.filter(e => e.setsCompleted > 0);
    for (const ex of toSave) {
      await api.post(`/api/workouts/${workoutId}/exercises`, {
        name: ex.name,
        sets: ex.setsCompleted,
        reps: ex.reps,
        weight_kg: ex.weight_kg
      });
    }

    // Check PRs for fully done exercises with weight
    const prResults = await Promise.all(
      doneEx
        .filter(ex => ex.weight_kg && ex.reps)
        .map(ex => api.post('/api/stats/prs/check', {
          exercise_name: ex.name,
          sets:          ex.setsCompleted,
          reps:          ex.reps,
          weight_kg:     ex.weight_kg,
          date:          today,
        }))
    );
    const newPRs = prResults.filter(r => r.is_pr).length;

    closeActiveMode();
    const prMsg = newPRs > 0 ? ` 🏆 ${newPRs} PR${newPRs > 1 ? 's' : ''}!` : '';
    toast(`Treino salvo! ${mm}m${ss}s · ${doneEx.length}/${waExercises.length} exercícios · ${totalSets} séries${prMsg}`);

    if (state.date === today) loadDashboard(state);

  } catch (err) { toast(err.message, 'error'); }
}

function closeActiveMode() {
  clearInterval(waTimerInt);
  clearInterval(restTimerInt);
  waClearPersist();
  document.body.style.overflow = '';
  document.getElementById('workoutActive').style.display = 'none';
  document.getElementById('waTimer').textContent = '00:00';
  sessionPRs = [];
}

// ══════════════════════════════════════════
//  REGISTRAR SESSÃO MANUAL
// ══════════════════════════════════════════
function setupRegistrarView(state) {
  document.getElementById('wkDate').value = state.date;

  document.getElementById('wkDate').addEventListener('change', async e => {
    await loadManualSession(e.target.value);
  });

  document.getElementById('wkSaveNotes').addEventListener('click', async () => {
    const date  = document.getElementById('wkDate').value;
    const notes = document.getElementById('wkNotes').value;
    try {
      if (currentWkId) {
        await api.put(`/api/workouts/${currentWkId}`, { notes });
      } else {
        const r = await api.post('/api/workouts', { date, notes });
        currentWkId = r.id;
      }
      toast('Notas salvas!');
    } catch (err) { toast(err.message, 'error'); }
  });

  // Muscle groups (manual session)
  document.getElementById('muscleGroups').addEventListener('click', e => {
    const btn = e.target.closest('.mg-btn');
    if (!btn) return;
    const group = btn.dataset.group;
    if (activeMg === group) {
      activeMg = null;
      btn.classList.remove('active');
      document.getElementById('exChipsWrap').style.display = 'none';
      document.getElementById('exChips').innerHTML = '';
      const d = document.getElementById('exBodyDiagram');
      if (d) { d.innerHTML = ''; d.style.display = 'none'; }
    } else {
      activeMg = group;
      document.querySelectorAll('#muscleGroups .mg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderExChips(group);
    }
  });

  // Manual exercise form
  document.getElementById('exerciseForm').addEventListener('submit', async e => {
    e.preventDefault();
    const date = document.getElementById('wkDate').value;
    const name = document.getElementById('exName').value.trim();
    if (!name) return;
    const editId = document.getElementById('exEditId').value;

    try {
      if (!currentWkId) {
        const r = await api.post('/api/workouts', { date, notes: document.getElementById('wkNotes').value });
        currentWkId = r.id;
      }
      const payload = {
        name,
        sets:      parseInt(document.getElementById('exSets').value)    || null,
        reps:      parseInt(document.getElementById('exReps').value)    || null,
        weight_kg: parseFloat(document.getElementById('exWeight').value) || null
      };
      if (editId) {
        await api.put(`/api/workouts/${currentWkId}/exercises/${editId}`, payload);
        cancelManualEdit();
      } else {
        await api.post(`/api/workouts/${currentWkId}/exercises`, payload);
      }
      resetManualExForm();
      await loadManualExercises();
      toast(editId ? 'Exercício atualizado!' : 'Exercício adicionado!');
    } catch (err) { toast(err.message, 'error'); }
  });

  document.getElementById('exCancelEdit').addEventListener('click', cancelManualEdit);
}

async function loadManualSession(date) {
  const { workout } = await api.get(`/api/workouts?date=${date}`);
  currentWkId = workout?.id || null;
  document.getElementById('wkNotes').value = workout?.notes || '';
  renderManualExercises(workout?.exercises || []);
}

async function loadManualExercises() {
  if (!currentWkId) return renderManualExercises([]);
  const { workout } = await api.get(`/api/workouts?date=${document.getElementById('wkDate').value}`);
  renderManualExercises(workout?.exercises || []);
}

function renderManualExercises(exercises) {
  const el = document.getElementById('exerciseList');
  if (!exercises.length) {
    el.innerHTML = '<div class="empty-state">Nenhum exercício adicionado</div>'; return;
  }
  el.innerHTML = exercises.map((ex, i) => {
    const parts = [];
    if (ex.sets && ex.reps) parts.push(`${ex.sets} × ${ex.reps} reps`);
    else if (ex.sets)       parts.push(`${ex.sets} séries`);
    if (ex.weight_kg)       parts.push(`${ex.weight_kg} kg`);
    return `
      <div class="exercise-item">
        <div class="exercise-num">${i + 1}</div>
        <div class="exercise-item-info">
          <div class="exercise-item-name">${escHtml(ex.name)}</div>
          ${parts.length ? `<div class="exercise-item-meta">${parts.join(' @ ')}</div>` : ''}
        </div>
        <div class="exercise-item-actions">
          <button class="btn btn-icon btn-ghost" onclick="editManualEx(${ex.id}, '${escHtml(ex.name)}', ${ex.sets ?? 'null'}, ${ex.reps ?? 'null'}, ${ex.weight_kg ?? 'null'})">${ICON.edit}</button>
          <button class="btn btn-icon btn-ghost" onclick="deleteManualEx(${ex.id})">${ICON.trash}</button>
        </div>
      </div>`;
  }).join('');
}

function editManualEx(id, name, sets, reps, weight) {
  document.getElementById('exEditId').value = id;
  document.getElementById('exName').value   = name;
  document.getElementById('exSets').value   = sets   ?? '';
  document.getElementById('exReps').value   = reps   ?? '';
  document.getElementById('exWeight').value = weight ?? '';
  document.getElementById('exFormLabel').textContent    = 'Editar Exercício';
  document.getElementById('exSubmitBtn').textContent    = 'Atualizar';
  document.getElementById('exCancelEdit').style.display = '';
  if (activeMg) renderExChips(activeMg);
  document.getElementById('exName').focus();
}
window.editManualEx = editManualEx;

async function deleteManualEx(id) {
  if (!confirm('Remover este exercício?')) return;
  try {
    await api.del(`/api/workouts/${currentWkId}/exercises/${id}`);
    await loadManualExercises();
    toast('Exercício removido');
  } catch (err) { toast(err.message, 'error'); }
}
window.deleteManualEx = deleteManualEx;

function cancelManualEdit() {
  resetManualExForm();
  document.getElementById('exFormLabel').textContent    = 'Adicionar Exercício';
  document.getElementById('exSubmitBtn').textContent    = 'Adicionar';
  document.getElementById('exCancelEdit').style.display = 'none';
  if (activeMg) renderExChips(activeMg);
}

function resetManualExForm() {
  ['exEditId','exName','exSets','exReps','exWeight'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.querySelectorAll('#exChips .ex-chip').forEach(c => c.classList.remove('selected'));
}

function renderExChips(group) {
  const current  = document.getElementById('exName').value.trim();
  const muscles  = MG_MUSCLES[group] || [];
  const view     = MG_VIEW[group] || 'front';

  const diagramEl = document.getElementById('exBodyDiagram');
  if (diagramEl && typeof renderChipMap === 'function') {
    renderChipMap(diagramEl, muscles, view);
  }

  document.getElementById('exChips').innerHTML = (EXERCISE_LIBRARY[group] || []).map(ex =>
    `<div class="ex-chip-row">
      <button type="button" class="ex-chip${current === ex ? ' selected' : ''}"
        onclick="selectExChip('${escHtml(ex)}')">${escHtml(ex)}</button>
      ${EX_META[ex] ? `<button type="button" class="ex-info-btn" onclick="showExerciseInfo('${escHtml(ex)}')" title="Ver músculos">ⓘ</button>` : ''}
    </div>`
  ).join('');
  document.getElementById('exChipsWrap').style.display = '';
}

function selectExChip(name) {
  document.getElementById('exName').value = name;
  document.querySelectorAll('#exChips .ex-chip').forEach(c =>
    c.classList.toggle('selected', c.textContent.trim() === name)
  );
  document.getElementById('exSets').focus();
}
window.selectExChip = selectExChip;

// ── Shared util ───────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str).replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])
  );
}
