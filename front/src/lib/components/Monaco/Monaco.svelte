<script lang="ts">
	import type monaco from 'monaco-editor';
	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
	import { onDestroy, onMount } from 'svelte';
	import { extraFiles, extraLibs } from './extraLibs';
	import { ExtraModule } from './ExtraModule';
	let editorInstance: monaco.editor.IStandaloneCodeEditor;
	let monacoInstance: typeof monaco;

	let {
		source = $bindable<string>(),
		modules = $bindable<ExtraModule[]>([]),
		onSave = $bindable<() => void>()
	}: { source: string; modules: ExtraModule[]; onSave: () => void } = $props();

	$effect(() => {
		const s = source;
		if (s != editorInstance?.getValue()) editorInstance?.setValue(s);
	});
	$effect(() => {
		refreshExtraModules(modules);
	});

	function refreshExtraModules(modules: ExtraModule[] = []) {
		if (!monacoInstance) return;
		monacoInstance.languages.typescript.typescriptDefaults.setExtraLibs([]);
		monacoInstance.languages.typescript.typescriptDefaults.addExtraLib(extraLibs, 'extraLibs.ts');
		modules.forEach((module: ExtraModule) => {
			if (!module.typeDefinitions) {
				console.warn('No type definitions for module', module.name);
				return;
			}
			monacoInstance.languages.typescript.typescriptDefaults.addExtraLib(
				module.typeDefinitions,
				module.name
			);
			console.log('extraModules', module.name);
		});

		for (let file of extraFiles) {
			console.log('extraFiles', file.fileName);
			monacoInstance.languages.typescript.typescriptDefaults.addExtraLib(
				file.content,
				file.fileName
			);
		}
	}

	onMount(async () => {
		self.MonacoEnvironment = {
			getWorker: function (_moduleId: any, label: string) {
				console.log('getWorker', label);
				if (label === 'typescript' || label === 'javascript') {
					var worker = new tsWorker();
					return worker;
				}
				var worker = new editorWorker();
				return worker;
			}
		};

		monacoInstance = await import('monaco-editor');
		monacoInstance.languages.typescript.typescriptDefaults.setCompilerOptions({
			target: monacoInstance.languages.typescript.ScriptTarget.ESNext,
			module: monacoInstance.languages.typescript.ModuleKind.ESNext,
			moduleResolution: monacoInstance.languages.typescript.ModuleResolutionKind.NodeJs,
			allowNonTsExtensions: true,
			lib: ['esnext', 'dom', 'webworker']
		});

		monacoInstance.languages.typescript.typescriptDefaults.setExtraLibs([]);
		monacoInstance.languages.typescript.typescriptDefaults.addExtraLib(extraLibs, 'extraLibs.ts');

		editorInstance = monacoInstance.editor.create(document.getElementById('editor')!, {
			value: source,
			automaticLayout: true,
			language: 'typescript',
			theme: 'vs-dark'
		});
		editorInstance.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS, () => {
			onSave();
		});
		editorInstance.onDidChangeModelContent(() => {
			const value = editorInstance.getValue();
			source = value;
		});

		refreshExtraModules(modules);
	});

	onDestroy(() => {
		editorInstance.dispose();
	});
</script>

<div id="editor" class="h-[500px] w-full"></div>
