export class ExtraModule {
	name!: string;
	typeDefinitions?: string | null;
	typeFetchError?: string | null;
}

const nonExistentModules: string[] = [];
export async function fetchTypeDefinitions(packageName: string) {
	if (nonExistentModules.includes(packageName)) return null;
	let typeUrl = `https://cdn.jsdelivr.net/npm/@types/${packageName}/index.d.ts`;

	// Try fetching @types package
	let response = await fetch(typeUrl);
	if (!response.ok) {
		console.warn(`No @types found for ${packageName}. Checking package directly.`);
		typeUrl = `https://cdn.jsdelivr.net/npm/${packageName}/index.d.ts`;
		response = await fetch(typeUrl);
	}

	if (response.ok) {
		return await response.text();
	} else {
		nonExistentModules.push(packageName);
		console.warn(`No types found for ${packageName}`);
		return null;
	}
}
