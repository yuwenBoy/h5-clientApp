import { HOT_CITIES, CITY_GROUPS } from './city-list-generated.js';

export { HOT_CITIES, CITY_GROUPS };

export const INDEX_LETTERS = CITY_GROUPS.map((g) => g.letter);

/** 扁平化全部城市名 */
export function getAllCityNames() {
	const set = new Set();
	CITY_GROUPS.forEach((g) => g.cities.forEach((c) => set.add(c)));
	HOT_CITIES.forEach((c) => set.add(c));
	return Array.from(set);
}

/**
 * 保存/接口用城市名（直辖市等补全「市」）
 */
export function formatCityName(name) {
	if (!name || typeof name !== 'string') return '';
	const trimmed = name.trim();
	// 县、自治县、旗等保持原名
	if (/县$|自治县$|旗$/.test(trimmed)) return trimmed;
	if (/[市州盟]$/.test(trimmed)) return trimmed;
	const direct = ['北京', '上海', '天津', '重庆'];
	if (direct.includes(trimmed)) return trimmed + '市';
	return trimmed + '市';
}

/** 展示用：地级市去掉「市」，县区保持原名 */
export function displayCityName(name) {
	if (!name) return '';
	const s = String(name);
	if (/县$|自治县$|旗$/.test(s)) return s;
	return s.replace(/市$/, '');
}

/** 判断两个城市名是否同一城市 */
export function isSameCity(a, b) {
	return displayCityName(a) === displayCityName(b);
}

/**
 * 按关键字过滤城市（搜索时仅展示字母列表，与闪购一致）
 */
export function filterCities(keyword) {
	const kw = (keyword || '').trim();
	if (!kw) {
		return {
			hot: HOT_CITIES,
			groups: CITY_GROUPS,
			flat: []
		};
	}
	const flat = getAllCityNames().filter((name) => name.includes(kw));
	const groupMap = {};
	flat.forEach((name) => {
		const group = CITY_GROUPS.find((g) => g.cities.includes(name));
		const letter = group ? group.letter : '#';
		if (!groupMap[letter]) groupMap[letter] = [];
		if (!groupMap[letter].includes(name)) groupMap[letter].push(name);
	});
	const groups = Object.keys(groupMap)
		.sort()
		.map((letter) => ({ letter, cities: groupMap[letter] }));
	return { hot: [], groups, flat };
}
