import { freeSkinIds } from './festivals.mjs';
import { additionalSkins } from './skin-designs.mjs';
import { compact } from './format.mjs';
export const skins = [
  { id: 'plain', name: '原味巨石', note: '命运的初始装备', cost: 0, color: '#8b8271' },
  { id: 'moss', name: '苔藓花园', note: '推久了，也会长绿', cost: 5, color: '#739377' },
  { id: 'gold', name: '黄金传说', note: '沉重，但很有面子', cost: 15, color: '#d7ab4f' },
  { id: 'nebula', name: '星云之石', note: '装着整个宇宙的班', cost: 35, color: '#9a85ce' },
  { id: 'dream', name: '幻彩人生', note: '至少这次是彩色的', cost: 70, color: '#e0a4bb' },
  { id: 'blossom', name: '繁花球', note: '推着一整个春天', cost: 8, color: '#e8a6b9' },
  { id: 'hexagon', name: '蜂巢核心', note: '六边形的稳重', cost: 10, color: '#d3a446' },
  { id: 'cube', name: '不可能方块', note: '方的，也要滚', cost: 12, color: '#7b9bc7' },
  { id: 'balloon', name: '云端气球', note: '让沉重的日子轻一点', cost: 18, color: '#ea8fb4' },
  { id: 'ice', name: '极地冰核', note: '把风雪握在手中', cost: 20, color: '#92d9e8' },
  { id: 'lava', name: '熔岩脉搏', note: '沉睡的火山在呼吸', cost: 22, color: '#ee763c' },
  { id: 'ocean', name: '潮汐之心', note: '带着整片海上山', cost: 25, color: '#399fbe' },
  { id: 'aurora', name: '极光流影', note: '北方的光缓缓流动', cost: 28, color: '#70dbb5' },
  { id: 'neon', name: '霓虹边界', note: '夜色中的电光', cost: 30, color: '#b47cff' },
  { id: 'circuit', name: '赛博电路', note: '每一步都在通电', cost: 32, color: '#45cfaa' },
  { id: 'galaxy', name: '旋臂星河', note: '微小而辽阔', cost: 40, color: '#a68bdf' },
  { id: 'void', name: '事件视界', note: '连烦恼也能吸进去', cost: 45, color: '#78629e' },
  { id: 'sun', name: '微型恒星', note: '今天也在发光', cost: 50, color: '#efb944' },
  { id: 'moon', name: '月面漫游', note: '收藏一颗安静的月亮', cost: 16, color: '#c5cbd7' },
  { id: 'yin', name: '阴阳回转', note: '动静之间，自有平衡', cost: 38, color: '#7e8d8b' },
  { id: 'clock', name: '时之齿轮', note: '时间也陪你转动', cost: 42, color: '#b99a65' },
  { id: 'glitch', name: '像素故障', note: '世界偶尔掉一帧', cost: 48, color: '#c674ca' },
  { id: 'portal', name: '跃迁之门', note: '下一步，是另一个宇宙', cost: 55, color: '#8d9af2' },
  { id: 'candy', name: '薄荷糖旋', note: '给命运加一点甜', cost: 14, color: '#e99da8' },
  { id: 'prism', name: '万花镜', note: '无限折射，不重复的宇宙', cost: 60, color: '#b4a1dc' },
  { id: 'lichun', name: '立春·迎春灯', note: '一盏暖灯，迎来新岁', cost: 65, color: '#709a65' },
  { id: 'yushui', name: '雨水·涟漪', note: '把春雨收进一颗石头', cost: 68, color: '#4696ad' },
  { id: 'jingzhe', name: '惊蛰·雷醒', note: '一声春雷，万物苏醒', cost: 71, color: '#555395' },
  { id: 'chunfen', name: '春分·双生', note: '春色与昼夜恰好平分', cost: 74, color: '#78aa94' },
  { id: 'qingming', name: '清明·柳烟', note: '烟雨里，柳色正新', cost: 77, color: '#5b8d78' },
  { id: 'guyu', name: '谷雨·新茶', note: '雨生百谷，茶香满坡', cost: 80, color: '#52764e' },
  { id: 'lixia', name: '立夏·青荷', note: '夏天从一片荷叶开始', cost: 83, color: '#388c79' },
  { id: 'xiaoman', name: '小满·麦浪', note: '小得盈满，仍有余地', cost: 86, color: '#b3994e' },
  { id: 'mangzhong', name: '芒种·金穗', note: '种下一步，收获远方', cost: 89, color: '#b37c34' },
  { id: 'xiazhi', name: '夏至·西瓜', note: '把清甜的盛夏推向远方', cost: 92, color: '#dc903f' },
  { id: 'xiaoshu', name: '小暑·荷露', note: '一颗水珠，停在碧荷中央', cost: 95, color: '#245c59' },
  { id: 'dashu', name: '大暑·焰阳', note: '盛夏的热烈从不退场', cost: 98, color: '#b64f36' },
  { id: 'liqiu', name: '立秋·金杏', note: '四片金叶，收藏秋日', cost: 101, color: '#ad6d48' },
  { id: 'chushu', name: '处暑·秋穗', note: '紫色晚风，拂过芦穗', cost: 104, color: '#6e9caa' },
  { id: 'bailu', name: '白露·凝珠', note: '清晨的一滴，映出世界', cost: 107, color: '#85aba4' },
  { id: 'qiufen', name: '秋分·团圆月饼', note: '中秋灵感，把团圆推向远方', cost: 110, color: '#9b774b' },
  { id: 'hanlu', name: '寒露·金菊', note: '秋深之时，菊色正浓', cost: 113, color: '#587d96' },
  { id: 'shuangjiang', name: '霜降·柿红', note: '霜落枝头，柿子红了', cost: 116, color: '#a3464e' },
  { id: 'lidong', name: '立冬·枫舞', note: '将最后一抹秋红藏进冬天', cost: 119, color: '#506782' },
  { id: 'xiaoxue', name: '小雪·轻絮', note: '第一场雪，轻轻落下', cost: 122, color: '#7b9eb7' },
  { id: 'daxue', name: '大雪·雪松', note: '松针托雪，仍然青翠', cost: 125, color: '#6083aa' },
  { id: 'dongzhi', name: '冬至·团圆', note: '一碗汤圆，温暖长夜', cost: 128, color: '#343969' },
  { id: 'xiaohan', name: '小寒·红梅', note: '寒意渐深，红梅初绽', cost: 131, color: '#679bac' },
  { id: 'dahan', name: '大寒·冰晶', note: '寒冬尽处，晶莹如初', cost: 134, color: '#657693' },
  { id: 'christmas', name: '圣诞·心愿', note: '把礼物和星光推向远方', cost: 137, color: '#28694e' },
  ...additionalSkins.map(({art, ...skin}) => skin),
].map((skin, index) => {
  const category = skin.category || (index < 25 ? '经典' : index < 49 ? '节气' : '节日');
  const categories = [category];
  if (['blossom','chunfen','lixia','hanlu','xiaohan','biome_cherry','enamel'].includes(skin.id)) categories.push('花朵');
  if (skin.id === 'qiufen') categories.push('节日');
  return { ...skin, category, categories, cost: skin.cost * 6 };
});
export const attributes = [
  { id: 'strength', name: '力量', icon: '↗', desc: '基础里程每级 ×2，与旅程目标同步成长。', base: 8, growth: 1.35, max: 1000 },
  { id: 'inertia', name: '惯性', icon: '≈', desc: '减速时间每级 +3 秒，最高 60 秒；惯性速度最多为力量的 4 倍。', base: 12, growth: 1.5, max: 20 },
  { id: 'stamina', name: '耐力', icon: '◷', desc: '基础可长按 1 秒，每级 +2 秒，最高 60 秒。', base: 6, growth: 1.4, max: 30 },
  { id: 'rhythm', name: '节奏', icon: '≋', desc: '基础每秒推进 1 次，每级 +0.5 次，最高每秒 10 次。', base: 12, growth: 1.5, max: 18 },
  { id: 'burst', name: '爆发', icon: 'ϟ', desc: '双倍里程概率每级 +10%，最高 100%。', base: 10, growth: 1.5, max: 10 },
  { id: 'focus', name: '专注', icon: '◎', desc: '2 秒内连推，每级每次 +0.5%，最多叠 10 次。', base: 10, growth: 1.5, max: 20 },
  { id: 'inspiration', name: '灵感', icon: '✦', desc: '旅程积分奖励每级 +5%，最高 +150%，不影响成就奖励。', base: 16, growth: 1.6, max: 30 },
  { id: 'lightness', name: '轻盈', icon: '羽', desc: '目标里程每级减少 2%，最多减少 20%。', base: 14, growth: 1.5, max: 10 },
  { id: 'thinking', name: '思考', icon: '☁', desc: '我思故我在。每秒前进力量的 10%，每级 +2.5%，最高 50%。独立于节奏、爆发和惯性，仅在游戏前台运行。', base: 18, growth: 1.45, max: 17 },
];
const finite = (n, fallback = 0) => Number.isFinite(n) && n >= 0 ? Math.min(n, 1e100) : fallback;
const whole = (n, fallback = 0) => Number.isSafeInteger(n) && n >= 0 ? n : fallback;
export function restore(raw) {
  let data;
  try { data = JSON.parse(raw); } catch { /* A damaged save starts fresh. */ }
  const v2 = data?.version === 2;
  const replacements = { triangle: 'blossom', diamond: 'balloon' };
  const savedOwned = Array.isArray(data?.owned) ? data.owned.map(id => replacements[id] || id) : [];
  const selected = replacements[data?.selected] || data?.selected;
  const owned = skins.filter(s => s.cost === 0 || savedOwned.includes(s.id)).map(s => s.id);
  // Preserve the v1 balance and skins, starting the new distance economy at 10 m.
  const legacyCosts = { moss: 30, gold: 100, nebula: 250, dream: 500 };
  const legacyPoints = Math.max(0, whole(data?.total) - owned.reduce((n, id) => n + (legacyCosts[id] || 0), 0));
  const state = {
    version: 2, points: whole(data?.points, v2 ? 0 : legacyPoints),
    owned, selected: owned.includes(selected) ? selected : 'plain',
    round: v2 ? Math.min(whole(data?.round), 100) : 0,
    distance: v2 ? finite(data?.distance) : 0, totalDistance: v2 ? finite(data?.totalDistance) : 0,
    pushes: v2 ? whole(data?.pushes) : whole(data?.total),
    levels: Object.fromEntries(attributes.map(a => [a.id, v2 ? Math.min(whole(data?.levels?.[a.id]), a.max) : 0])),
    settings: { randomSkin: data?.settings?.randomSkin === true, motion: data?.settings?.motion !== false, vibration: data?.settings?.vibration === true,
      sound: data?.settings?.sound !== false, music: data?.settings?.music !== false,
      stoneVolume: volume(data?.settings?.stoneVolume, data?.settings?.sound === false ? 0 : 80),
      musicVolume: volume(data?.settings?.musicVolume, data?.settings?.music === false ? 0 : 35),
      weatherVolume: volume(data?.settings?.weatherVolume, data?.settings?.sound === false ? 0 : 40),
      clock: data?.settings?.clock === 'manual' ? 'manual' : 'system',
      manualTime: /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(data?.settings?.manualTime) ? data.settings.manualTime : '12:00',
      localWeather: data?.settings?.localWeather === true },
    weatherCache: data?.weatherCache && Number.isFinite(data.weatherCache.fetchedAt) && Number.isInteger(data.weatherCache.code) && Number.isFinite(data.weatherCache.temperature)
      ? { fetchedAt: data.weatherCache.fetchedAt, code: data.weatherCache.code, temperature: data.weatherCache.temperature } : null,
    profile: { name: cleanName(data?.profile?.name), avatar: avatars.includes(data?.profile?.avatar) ? data.profile.avatar : avatars[0] },
    environmentSeed: whole(data?.environmentSeed, Math.floor(Math.random() * 4294967296)) % 4294967296,
    claimed: Object.fromEntries(achievementGroups.map(g => [g.id, Math.min(whole(data?.claimed?.[g.id]), g.targets.length)])),
    journeyPace: finite(data?.journeyPace, 0),
    elapsedSeconds: finite(data?.elapsedSeconds),
    lifetimeSeconds: finite(data?.lifetimeSeconds, finite(data?.elapsedSeconds)),
    nightSeconds: finite(data?.nightSeconds),
    thinkingSeconds: finite(data?.thinkingSeconds),
    completedRuns: whole(data?.completedRuns, data?.round >= 100 ? 1 : 0),
    finishedAt: whole(data?.finishedAt),
    codeRedeemed: data?.codeRedeemed === true,
    skinCodeRedeemed: data?.skinCodeRedeemed === true,
  };
  if (!state.journeyPace) state.journeyPace = paceFactor(state);
  state.distance = state.round >= 100 ? 0 : Math.min(state.distance, goal(state) * (1 - Number.EPSILON));
  return state;
}
// Each run settles after 100 journeys; pace is fixed when a journey starts.
export const goal = state => 10 * 2 ** Math.min(state.round, 100) * (state.journeyPace || 1) * (1 - state.levels.lightness * .02);
export const reward = state => Math.ceil(10 * 1.35 ** Math.min(state.round, 100) * (1 + state.levels.inspiration * .05));
export const power = state => 2 ** state.levels.strength;
export const duration = state => Math.min(60, state.levels.inertia * 3);
export const stamina = state => Math.min(60, 1 + state.levels.stamina * 2);
export const interval = state => 1 / Math.min(10, 1 + state.levels.rhythm * .5);
export const burstChance = state => Math.min(1, state.levels.burst * .1);
export const thinkingRatio = state => state.levels.thinking ? Math.min(.5, .1 + (state.levels.thinking - 1) * .025) : 0;
export function holdSpeed(state) {
  const meters = power(state) * (1 + burstChance(state)) * (1 + state.levels.focus * .025);
  const step = interval(state), tail = Math.min(duration(state), step);
  const v = Math.min(power(state) * 4, meters / Math.min(1, step));
  return (meters + (duration(state) ? v * (tail - tail * tail / (2 * duration(state))) : 0)) / step;
}
export const paceFactor = state => holdSpeed(state) / (power(state) / 6);
export function think(state, seconds) {
  return addDistance(state, power(state) * thinkingRatio(state) * seconds);
}
const volume = (value, fallback) => Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : fallback;
export const price = (state, attribute) => Math.ceil(attribute.base * attribute.growth ** Math.min(state.levels[attribute.id], 100));
export function addDistance(state, meters) {
  if (!Number.isFinite(meters) || meters < 0 || state.round >= 100) return { rounds: 0, points: 0 };
  state.distance += meters; state.totalDistance += meters;
  const result = { rounds: 0, points: 0 };
  while (state.distance + 1e-9 >= goal(state) && state.round < 100) {
    state.distance = Math.max(0, state.distance - goal(state));
    const earned = reward(state);
    state.points += earned; result.points += earned; result.rounds++; state.round++;
    state.journeyPace = paceFactor(state);
    if (state.round < 100) randomizeSkin(state);
  }
  if (state.round >= 100) {
    state.totalDistance = Math.max(0, state.totalDistance - state.distance); state.distance = 0;
    if (!state.finishedAt) state.completedRuns++;
    state.finishedAt ||= Date.now();
  }
  return result;
}
export function randomizeSkin(state, random = Math.random) {
  if (!state.settings.randomSkin) return;
  const choices = state.owned.filter(id => id !== state.selected);
  if (choices.length) state.selected = choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))];
}
export function motion() { return { speed: 0, deceleration: 0, lastPush: null, combo: 0 }; }
export function push(state, movement, now, random = Math.random) {
  if (state.round >= 100) return { rounds: 0, points: 0, meters: 0, critical: false };
  const gap = movement.lastPush === null ? Infinity : now - movement.lastPush;
  movement.combo = gap <= 2 ? Math.min(10, movement.combo + 1) : 0;
  const critical = random() < burstChance(state);
  const meters = power(state) * (1 + movement.combo * state.levels.focus * .005) * (critical ? 2 : 1);
  state.pushes++;
  movement.lastPush = now;
  movement.speed = Math.min(power(state) * 4, meters / Math.max(.1, Math.min(1, gap)));
  const seconds = duration(state);
  movement.deceleration = seconds ? movement.speed / seconds : 0;
  if (!seconds) movement.speed = 0;
  return { ...addDistance(state, meters), meters, critical };
}
// Integrate declining inertia down to a continuous idle floor without double-counting.
export function coast(state, movement, seconds, floor = 0) {
  if (seconds <= 0 || state.round >= 100) return { rounds: 0, points: 0 };
  const start = Math.max(floor, movement.speed);
  const dt = movement.deceleration > 0 ? Math.min(seconds, Math.max(0, (start - floor) / movement.deceleration)) : 0;
  const meters = start * dt - .5 * movement.deceleration * dt ** 2 + floor * (seconds - dt);
  movement.speed = Math.max(floor, movement.deceleration > 0 ? start - movement.deceleration * dt : floor);
  return addDistance(state, meters);
}
export function trackTime(state, seconds, date = new Date(), thinking = false) {
  if (state.round >= 100 || !Number.isFinite(seconds) || seconds <= 0) return;
  state.elapsedSeconds += seconds; state.lifetimeSeconds += seconds;
  if (thinking) state.thinkingSeconds += seconds;
  const hour = date.getHours();
  if (hour >= 22 || hour < 6) state.nightSeconds += seconds;
}
export function claimDailySkin(state, id, date = new Date()) {
  if (!skins.some(skin => skin.id === id) || !freeSkinIds(date).includes(id) || state.owned.includes(id)) return false;
  state.owned.push(id); return true;
}
export function equip(state, id) {
  const skin = skins.find(s => s.id === id);
  if (!skin) return false;
  if (!state.owned.includes(id)) {
    if (state.points < skin.cost) return false;
    state.points -= skin.cost; state.owned.push(id);
  }
  state.selected = id; return true;
}
export function upgrade(state, id) {
  if (state.round >= 100) return false;
  const attribute = attributes.find(a => a.id === id);
  if (!attribute || state.levels[id] >= attribute.max || state.points < price(state, attribute)) return false;
  state.points -= price(state, attribute); state.levels[id]++;
  // Lightness may complete a journey that was already almost finished.
  return addDistance(state, 0);
}
export const avatars = ['🧗', '🦊', '🐻', '🐱', '🐼', '🦉', '🐸', '🌻'];
export function cleanName(value) {
  return typeof value === 'string' ? [...value.trim().replace(/[\u0000-\u001f\u007f]/g, '')].slice(0, 16).join('') || '西西弗斯' : '西西弗斯';
}
export function updateProfile(state, name, avatar) {
  state.profile = { name: cleanName(name), avatar: avatars.includes(avatar) ? avatar : avatars[0] };
}
export const achievementGroups = [
  { id: 'distance', name: '远方的路', icon: '🥾', unit: 'm', targets: [10, 100, 1000, 10000, 1000000], rewards: [3, 8, 20, 50, 120], titles: ['初见山路', '百米旅人', '千米不息', '万米长行', '步履无疆'], value: s => s.totalDistance },
  { id: 'journeys', name: '翻越山海', icon: '🏔️', unit: '轮', targets: [1, 5, 10, 20, 40], rewards: [2, 10, 30, 100, 400], titles: ['新的开始', '山外有山', '十度春秋', '群峰之间', '永远向前'], value: s => s.round },
  { id: 'pushes', name: '每一步都算数', icon: '✊', unit: '次', targets: [10, 100, 500, 2000, 10000], rewards: [3, 6, 12, 25, 50], titles: ['十次努力', '习惯的力量', '心之所向', '不倦的双手', '万次热爱'], value: s => s.pushes },
  { id: 'upgrades', name: '更好的自己', icon: '🌱', unit: '级', targets: [1, 5, 15, 40, 100], rewards: [2, 6, 15, 40, 100], titles: ['萌芽', '扎根', '枝繁叶茂', '自成森林', '生生不息'], value: s => Object.values(s.levels).reduce((a, b) => a + b, 0) },
  { id: 'collection', name: '石头收藏家', icon: '💎', unit: '款', targets: [2, 10, 30, 60, 120], rewards: [3, 10, 25, 60, 120], titles: ['换个心情', '小小珍藏', '琳琅满目', '山间宝库', '满天星石'], value: s => s.owned.length },
  { id: 'night', name: '夜猫子', icon: '🦉', unit: '分钟', targets: [1, 10, 30, 60, 180], rewards: [3, 10, 25, 60, 150], titles: ['晚风作伴', '月下旅人', '星夜不眠', '守望黎明', '长夜有光'], value: s => s.nightSeconds / 60, note: '设备时间 22:00—06:00 的前台游玩时长，跨轮回保留' },
  { id: 'time', name: '总时长', icon: '⌛', unit: '分钟', targets: [10, 60, 180, 600, 1440], rewards: [5, 20, 60, 150, 400], titles: ['片刻停留', '一小时的山', '慢慢走过', '十时光阴', '一日人生'], value: s => s.lifetimeSeconds / 60, note: '累计有效游玩时间，跨轮回保留，不计后台时间' },
  { id: 'rebirth', name: '轮回', icon: '🌀', unit: '次', targets: [1, 2, 3, 5, 10], rewards: [100, 200, 400, 800, 1600], titles: ['圆满一程', '再次出发', '三生山海', '五度春秋', '十世旅人'], value: s => s.completedRuns, note: '每完成 100 段旅程计一次；中途重开不增加轮回' },
  { id: 'contemplation', name: '静思者', icon: '🧘', unit: '分钟', targets: [1, 10, 30, 60, 180], rewards: [3, 10, 30, 80, 200], titles: ['一念初生', '心流渐入', '静水深流', '我思故我在', '山静心明'], value: s => s.thinkingSeconds / 60, note: '累计以思考速度匀速前进的有效时长，跨轮回保留' },
];
export function achievementProgress(state, group) {
  const claimed = state.claimed[group.id], all = claimed >= group.targets.length;
  const tier = Math.min(claimed, group.targets.length - 1), target = group.targets[tier];
  return { tier, target, current: group.value(state), all, ready: !all && group.value(state) >= target, reward: group.rewards[tier] };
}
export function claimAchievement(state, id) {
  const group = achievementGroups.find(g => g.id === id);
  if (!group) return 0;
  const progress = achievementProgress(state, group);
  if (!progress.ready) return 0;
  state.claimed[id]++; state.points += progress.reward;
  return progress.reward;
}
export function redeemCode(state, code) {
  if (code.trim() === '必须想象西西弗斯是快乐的') {
    if (state.skinCodeRedeemed && state.owned.length === skins.length) return '本轮已解锁全部皮肤';
    state.owned = skins.map(skin => skin.id); state.skinCodeRedeemed = true;
    return `兑换成功：已解锁全部 ${skins.length} 款皮肤`;
  }
  if (code.trim() !== 'Sunflower613') return '兑换码不正确';
  if (state.codeRedeemed) return '本轮已兑换过此奖励';
  state.points += 999999999999; state.codeRedeemed = true;
  return `兑换成功：+${compact(999999999999)} 积分`;
}
export function restart(state) {
  const { profile, settings, weatherCache, lifetimeSeconds, nightSeconds, thinkingSeconds, completedRuns } = state;
  const retained = Object.fromEntries(['night', 'time', 'rebirth', 'contemplation'].map(id => [id, state.claimed[id]]));
  Object.assign(state, restore(null), { profile, settings, weatherCache, lifetimeSeconds, nightSeconds, thinkingSeconds, completedRuns });
  Object.assign(state.claimed, retained);
}
