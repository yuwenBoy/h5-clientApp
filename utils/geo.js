/** 计算两点球面距离（米） */
export function calcDistanceMeters(lat1, lng1, lat2, lng2) {
	const la1 = parseFloat(lat1);
	const lo1 = parseFloat(lng1);
	const la2 = parseFloat(lat2);
	const lo2 = parseFloat(lng2);
	if ([la1, lo1, la2, lo2].some((v) => isNaN(v))) return null;
	const R = 6371000;
	const toRad = (d) => (d * Math.PI) / 180;
	const dLat = toRad(la2 - la1);
	const dLng = toRad(lo2 - lo1);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(la1)) * Math.cos(toRad(la2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
	return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** 格式化为展示文案 */
export function formatDistanceText(meters) {
	if (meters == null || isNaN(meters)) return '';
	if (meters < 1000) return `${Math.round(meters)}m`;
	return `${(meters / 1000).toFixed(1)}km`;
}

/** 判断经纬度是否相同（约 11 米精度） */
export function isSameCoordinate(lat1, lng1, lat2, lng2) {
	const a = parseFloat(lat1);
	const b = parseFloat(lng1);
	const c = parseFloat(lat2);
	const d = parseFloat(lng2);
	if ([a, b, c, d].some((v) => isNaN(v))) return false;
	return Math.abs(a - c) < 0.0001 && Math.abs(b - d) < 0.0001;
}
