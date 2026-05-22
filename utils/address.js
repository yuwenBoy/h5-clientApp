/**
 * 拼接完整收货地址，避免省/市/区与详细地址重复（如「北京」+「北京市」+「通州区」）
 */
export function formatFullAddress(item = {}) {
	const province = (item.province || '').trim();
	const city = (item.city || '').trim();
	const area = (item.area || item.district || '').trim();
	const detail = (item.detailAddress || item.address || '').trim();

	if (!province && !city && !area) return detail;

	// 详细地址已包含省市区信息时，直接展示详细地址
	if (detail) {
		const regionParts = [province, city, area].filter(Boolean);
		const covered = regionParts.some((part) => {
			if (!part) return false;
			const short = part.replace(/(省|市|区|县)$/, '');
			return detail.includes(part) || (short && detail.includes(short));
		});
		if (covered) return detail;
	}

	const segments = [];
	const pushSegment = (seg) => {
		if (!seg) return;
		const duplicated = segments.some(
			(exist) => exist.includes(seg) || seg.includes(exist)
		);
		if (!duplicated) segments.push(seg);
	};

	pushSegment(province);
	pushSegment(city);
	pushSegment(area);

	const prefix = segments.join('');
	if (!detail) return prefix;
	if (detail.startsWith(prefix)) return detail;
	if (prefix && (detail.startsWith(city) || detail.startsWith(area))) return detail;
	return prefix + detail;
}

/** 解析地址经纬度 */
export function parseAddressCoords(item = {}) {
	const lat = parseFloat(item.latitude ?? item.lat);
	const lng = parseFloat(item.longitude ?? item.lng);
	if (isNaN(lat) || isNaN(lng)) return null;
	return { lat, lng };
}
