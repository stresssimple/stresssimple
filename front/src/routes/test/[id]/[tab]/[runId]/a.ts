export interface AuditRecord {
	id: string;
	name: string;
	runId: string;
	timestamp: Date;
	duration: number;
	requestBody?: string;
	responseBody?: string;
	requestHeaders?: string;
	responseHeaders?: string;
	method: string;
	baseUrl: string;
	path: string;
	status: number;
	statusDescription?: string;
	success: boolean;
}
