export interface TemplateRunnerService {
  cleanup(): Promise<void>;
  initDirectory(): Promise<void>;
  compileTemplate(source: string): Promise<boolean>;
  packagesInstall(modules: string[]): Promise<boolean>;
  startRunner(): Promise<void>;
}
