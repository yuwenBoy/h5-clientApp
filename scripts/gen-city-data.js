const https = require('https');
const fs = require('fs');
const path = require('path');

let pinyin;
try {
	pinyin = require('pinyin-pro').pinyin;
} catch (e) {
	console.error('请先执行: npm install pinyin-pro --no-save');
	process.exit(1);
}

/** 热门城市（9 个，3×3） */
const HOT_CITIES = [
	'北京', '上海', '广州', '深圳', '杭州',
	'南京', '武汉', '成都', '重庆'
];

function normalizeCityName(name) {
	return name
		.replace(/(维吾尔|壮族|回族)?自治州$/, '')
		.replace(/地区$/, '')
		.replace(/盟$/, '')
		.replace(/市$/, '');
}

/** 是否县级条目（县 / 自治县 / 旗等） */
function isCountyArea(name) {
	return /县$/.test(name) || /自治县$/.test(name) || /旗$/.test(name);
}

function processData(cityList, areaList) {
	const names = new Set(HOT_CITIES);
	const skip = /辖区|直辖|行政区划/;

	cityList.forEach((c) => {
		if (!c.name || skip.test(c.name)) return;
		const n = normalizeCityName(c.name);
		if (n.length >= 2) names.add(n);
	});

	if (areaList && areaList.length) {
		areaList.forEach((a) => {
			if (!a.name || !isCountyArea(a.name)) return;
			names.add(a.name);
		});
	}

	const groups = {};
	[...names].sort((a, b) => a.localeCompare(b, 'zh')).forEach((name) => {
		const py = pinyin(name[0], { toneType: 'none', type: 'array' })[0] || '';
		const letter = (py[0] || '#').toUpperCase();
		if (!/^[A-Z]$/.test(letter)) return;
		if (!groups[letter]) groups[letter] = [];
		groups[letter].push(name);
	});

	const CITY_GROUPS = Object.keys(groups)
		.sort()
		.map((letter) => ({ letter, cities: groups[letter] }));

	const content = `/**
 * 城市/县区数据（地级市 + 县/自治县/旗，按拼音分组）
 * 由 scripts/gen-city-data.js 生成
 */
export const HOT_CITIES = ${JSON.stringify(HOT_CITIES, null, '\t')};

export const CITY_GROUPS = ${JSON.stringify(CITY_GROUPS, null, '\t')};
`;
	const outPath = path.join(__dirname, '../utils/city-list-generated.js');
	fs.writeFileSync(outPath, content, 'utf8');
	const countyCount = [...names].filter(isCountyArea).length;
	console.log('已生成', outPath);
	console.log('总计', names.size, '条（含县/旗', countyCount, '条），字母组', CITY_GROUPS.length);
}

const citiesPath = path.join(__dirname, '../utils/cities-raw.json');
const areasPath = path.join(__dirname, '../utils/areas-raw.json');

function loadLocal() {
	if (!fs.existsSync(citiesPath)) return false;
	const cityList = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
	const areaList = fs.existsSync(areasPath)
		? JSON.parse(fs.readFileSync(areasPath, 'utf8'))
		: [];
	processData(cityList, areaList);
	return true;
}

function fetchJson(url) {
	return new Promise((resolve, reject) => {
		https.get(url, (res) => {
			let data = '';
			res.on('data', (chunk) => { data += chunk; });
			res.on('end', () => resolve(JSON.parse(data)));
		}).on('error', reject);
	});
}

if (loadLocal()) {
	process.exit(0);
}

Promise.all([
	fetchJson('https://raw.githubusercontent.com/modood/Administrative-divisions-of-China/master/dist/cities.json'),
	fetchJson('https://raw.githubusercontent.com/modood/Administrative-divisions-of-China/master/dist/areas.json')
]).then(([cityList, areaList]) => {
	fs.writeFileSync(citiesPath, JSON.stringify(cityList));
	fs.writeFileSync(areasPath, JSON.stringify(areaList));
	processData(cityList, areaList);
}).catch((err) => {
	console.error(err);
	process.exit(1);
});
