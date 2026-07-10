import Gio from "gi://Gio";

const iconCache = new Map();
const appNameCache = new Map();

export function normalizeAppId(value = "") {
	return value
		.toLowerCase()
		.replace(/\.desktop$/, "")
		.replace(/-default$/, "");
}

function getDesktopApplications() {
	return Gio.AppInfo.get_all();
}

export function getAppName(appId) {
	if (!appId) return "Unknown App";

	if (appNameCache.has(appId)) {
		return appNameCache.get(appId);
	}

	const normalizedAppId = normalizeAppId(appId);
	const applications = getDesktopApplications();

	const exactMatch = applications.find((application) => {
		const desktopId = normalizeAppId(application.get_id() || "");

		return desktopId === normalizedAppId;
	});

	if (exactMatch) {
		const name = exactMatch.get_display_name();

		appNameCache.set(appId, name);
		return name;
	}

	const partialMatch = applications.find((application) => {
		const desktopId = normalizeAppId(application.get_id() || "");

		return (
			desktopId.includes(normalizedAppId) ||
			normalizedAppId.includes(desktopId)
		);
	});

	if (partialMatch) {
		const name = partialMatch.get_display_name();

		appNameCache.set(appId, name);
		return name;
	}

	const fallbackMap = [
		["chrome-", "Google Chrome"],
		["google-chrome", "Google Chrome"],
		["code", "Visual Studio Code"],
		["ghostty", "Ghostty"],
		["kitty", "Kitty"],
		["snap-store", "App Center"],
		["nautilus", "Files"],
		["opera", "Opera"],
		["firefox", "Firefox"],
	];

	const fallback = fallbackMap.find(([key]) =>
		normalizedAppId.includes(key)
	);

	const name = fallback?.[1] || appId;

	appNameCache.set(appId, name);

	return name;
}

export function getIconName(appId) {
	if (!appId) {
		return "application-x-executable";
	}

	if (iconCache.has(appId)) {
		return iconCache.get(appId);
	}

	const normalizedAppId = normalizeAppId(appId);

	const manualMap = [
		["google-chrome", "google-chrome"],
		["chrome-", "google-chrome"],
		["code", "com.visualstudio.code"],
		["ghostty", "com.mitchellh.ghostty"],
		["nautilus", "org.gnome.Nautilus"],
		["opera", "opera"],
		["firefox", "firefox"],
	];

	const manualMatch = manualMap.find(([key]) =>
		normalizedAppId.includes(key)
	);

	if (manualMatch) {
		iconCache.set(appId, manualMatch[1]);
		return manualMatch[1];
	}

	const applications = getDesktopApplications();

	const exactMatch = applications.find((application) => {
		const desktopId = normalizeAppId(application.get_id() || "");

		return desktopId === normalizedAppId;
	});

	if (exactMatch) {
		const icon = exactMatch.get_icon();

		if (icon) {
			iconCache.set(appId, icon);
			return icon;
		}
	}

	const partialMatch = applications.find((application) => {
		const desktopId = normalizeAppId(application.get_id() || "");

		return (
			desktopId.includes(normalizedAppId) ||
			normalizedAppId.includes(desktopId)
		);
	});

	if (partialMatch) {
		const icon = partialMatch.get_icon();

		if (icon) {
			iconCache.set(appId, icon);
			return icon;
		}
	}

	iconCache.set(appId, "application-x-executable");

	return "application-x-executable";
}
