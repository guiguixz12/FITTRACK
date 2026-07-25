const { getDB } = require('../db/init');

const FLOOR_M = 1500; // kcal mínimo saudável masculino
const FLOOR_F = 1200; // kcal mínimo saudável feminino

function computeTargets(userId) {
  const db   = getDB();
  const user = db.prepare(
    'SELECT height_cm, age, sex, activity_factor, goal_diff FROM users WHERE id=?'
  ).get(userId);

  if (!user?.height_cm || !user?.age || !user?.sex) return null;

  const wRow = db.prepare(
    'SELECT weight_kg FROM weight_logs WHERE user_id=? ORDER BY date DESC LIMIT 1'
  ).get(userId);
  if (!wRow) return null;

  const w          = wRow.weight_kg;
  const actFactor  = user.activity_factor ?? 1.55;
  const goalDiff   = user.goal_diff       ?? -300;

  const bmr = user.sex === 'M'
    ? (10 * w) + (6.25 * user.height_cm) - (5 * user.age) + 5
    : (10 * w) + (6.25 * user.height_cm) - (5 * user.age) - 161;

  const tdee   = Math.round(bmr * actFactor);
  const target = Math.round(tdee + goalDiff);

  const floor       = user.sex === 'M' ? FLOOR_M : FLOOR_F;
  const floorHit    = target < floor;
  const safetarget  = floorHit ? floor : target;

  const protMult = goalDiff < 0 ? 2.2 : goalDiff === 0 ? 2.0 : 1.8;
  const protein  = Math.round(w * protMult);
  const fat      = Math.round(w * 0.9);
  const carbs    = Math.max(0, Math.round((safetarget - protein * 4 - fat * 9) / 4));
  const actualKcal = (protein * 4) + (carbs * 4) + (fat * 9);

  return {
    target_calories: actualKcal,
    target_protein:  protein,
    target_carbs:    carbs,
    target_fat:      fat,
    weight_used:     w,
    floor_applied:   floorHit,
    notification:    floorHit
      ? `Meta ajustada para um mínimo saudável (${actualKcal} kcal)`
      : `Meta ajustada para seu peso atual (${w}kg)`,
  };
}

module.exports = { computeTargets };
