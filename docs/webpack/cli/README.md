# webpack 源码系列


## 调试

```js
{
 "main": "lib/index.js",
  "bin": {
    "webpack": "bin/webpack.js"
  },
}
```

# lib/index.js

```js
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

"use strict";

const util = require("util");
const memoize = require("./util/memoize");

/** @typedef {import("../declarations/WebpackOptions").Entry} Entry */
/** @typedef {import("../declarations/WebpackOptions").EntryNormalized} EntryNormalized */
/** @typedef {import("../declarations/WebpackOptions").EntryObject} EntryObject */
/** @typedef {import("../declarations/WebpackOptions").ExternalItemFunctionData} ExternalItemFunctionData */
/** @typedef {import("../declarations/WebpackOptions").ExternalItemObjectKnown} ExternalItemObjectKnown */
/** @typedef {import("../declarations/WebpackOptions").ExternalItemObjectUnknown} ExternalItemObjectUnknown */
/** @typedef {import("../declarations/WebpackOptions").ExternalItemValue} ExternalItemValue */
/** @typedef {import("../declarations/WebpackOptions").Externals} Externals */
/** @typedef {import("../declarations/WebpackOptions").FileCacheOptions} FileCacheOptions */
/** @typedef {import("../declarations/WebpackOptions").LibraryOptions} LibraryOptions */
/** @typedef {import("../declarations/WebpackOptions").MemoryCacheOptions} MemoryCacheOptions */
/** @typedef {import("../declarations/WebpackOptions").ModuleOptions} ModuleOptions */
/** @typedef {import("../declarations/WebpackOptions").ResolveOptions} ResolveOptions */
/** @typedef {import("../declarations/WebpackOptions").RuleSetCondition} RuleSetCondition */
/** @typedef {import("../declarations/WebpackOptions").RuleSetConditionAbsolute} RuleSetConditionAbsolute */
/** @typedef {import("../declarations/WebpackOptions").RuleSetRule} RuleSetRule */
/** @typedef {import("../declarations/WebpackOptions").RuleSetUse} RuleSetUse */
/** @typedef {import("../declarations/WebpackOptions").RuleSetUseItem} RuleSetUseItem */
/** @typedef {import("../declarations/WebpackOptions").StatsOptions} StatsOptions */
/** @typedef {import("../declarations/WebpackOptions").WebpackOptions} Configuration */
/** @typedef {import("../declarations/WebpackOptions").WebpackOptionsNormalized} WebpackOptionsNormalized */
/** @typedef {import("../declarations/WebpackOptions").WebpackPluginFunction} WebpackPluginFunction */
/** @typedef {import("../declarations/WebpackOptions").WebpackPluginInstance} WebpackPluginInstance */
/** @typedef {import("./ChunkGroup")} ChunkGroup */
/** @typedef {import("./Compilation").Asset} Asset */
/** @typedef {import("./Compilation").AssetInfo} AssetInfo */
/** @typedef {import("./Compilation").EntryOptions} EntryOptions */
/** @typedef {import("./Compilation").PathData} PathData */
/** @typedef {import("./Compiler").AssetEmittedInfo} AssetEmittedInfo */
/** @typedef {import("./MultiCompiler").MultiCompilerOptions} MultiCompilerOptions */
/** @typedef {import("./MultiStats")} MultiStats */
/** @typedef {import("./NormalModuleFactory").ResolveData} ResolveData */
/** @typedef {import("./Parser").ParserState} ParserState */
/** @typedef {import("./ResolverFactory").ResolvePluginInstance} ResolvePluginInstance */
/** @typedef {import("./ResolverFactory").Resolver} Resolver */
/** @typedef {import("./Watching")} Watching */
/** @typedef {import("./cli").Argument} Argument */
/** @typedef {import("./cli").Problem} Problem */
/** @typedef {import("./stats/DefaultStatsFactoryPlugin").StatsAsset} StatsAsset */
/** @typedef {import("./stats/DefaultStatsFactoryPlugin").StatsChunk} StatsChunk */
/** @typedef {import("./stats/DefaultStatsFactoryPlugin").StatsChunkGroup} StatsChunkGroup */
/** @typedef {import("./stats/DefaultStatsFactoryPlugin").StatsChunkOrigin} StatsChunkOrigin */
/** @typedef {import("./stats/DefaultStatsFactoryPlugin").StatsCompilation} StatsCompilation */
/** @typedef {import("./stats/DefaultStatsFactoryPlugin").StatsError} StatsError */
/** @typedef {import("./stats/DefaultStatsFactoryPlugin").StatsLogging} StatsLogging */
/** @typedef {import("./stats/DefaultStatsFactoryPlugin").StatsLoggingEntry} StatsLoggingEntry */
/** @typedef {import("./stats/DefaultStatsFactoryPlugin").StatsModule} StatsModule */
/** @typedef {import("./stats/DefaultStatsFactoryPlugin").StatsModuleIssuer} StatsModuleIssuer */
/** @typedef {import("./stats/DefaultStatsFactoryPlugin").StatsModuleReason} StatsModuleReason */
/** @typedef {import("./stats/DefaultStatsFactoryPlugin").StatsModuleTraceDependency} StatsModuleTraceDependency */
/** @typedef {import("./stats/DefaultStatsFactoryPlugin").StatsModuleTraceItem} StatsModuleTraceItem */
/** @typedef {import("./stats/DefaultStatsFactoryPlugin").StatsProfile} StatsProfile */
/** @typedef {import("./util/fs").InputFileSystem} InputFileSystem */
/** @typedef {import("./util/fs").OutputFileSystem} OutputFileSystem */

/**
 * @template {Function} T
 * @param {function(): T} factory factory function
 * @returns {T} function
 */
const lazyFunction = factory => {
	const fac = memoize(factory);
	const f = /** @type {any} */ ((...args) => fac()(...args));
	return /** @type {T} */ (f);
};

/**
 * @template A
 * @template B
 * @param {A} obj input a
 * @param {B} exports input b
 * @returns {A & B} merged
 */
const mergeExports = (obj, exports) => {
	const descriptors = Object.getOwnPropertyDescriptors(exports);
	for (const name of Object.keys(descriptors)) {
		const descriptor = descriptors[name];
		if (descriptor.get) {
			const fn = descriptor.get;
			Object.defineProperty(obj, name, {
				configurable: false,
				enumerable: true,
				get: memoize(fn)
			});
		} else if (typeof descriptor.value === "object") {
			Object.defineProperty(obj, name, {
				configurable: false,
				enumerable: true,
				writable: false,
				value: mergeExports({}, descriptor.value)
			});
		} else {
			throw new Error(
				"Exposed values must be either a getter or an nested object"
			);
		}
	}
	return /** @type {A & B} */ (Object.freeze(obj));
};

const fn = lazyFunction(() => require("./webpack"));
module.exports = mergeExports(fn, {
	get webpack() {
		return require("./webpack");
	},
	get validate() {
		const webpackOptionsSchemaCheck = require("../schemas/WebpackOptions.check.js");
		const getRealValidate = memoize(() => {
			const validateSchema = require("./validateSchema");
			const webpackOptionsSchema = require("../schemas/WebpackOptions.json");
			return options => validateSchema(webpackOptionsSchema, options);
		});
		return options => {
			if (!webpackOptionsSchemaCheck(options)) getRealValidate()(options);
		};
	},
	get validateSchema() {
		const validateSchema = require("./validateSchema");
		return validateSchema;
	},
	get version() {
		return /** @type {string} */ (require("../package.json").version);
	},

	get cli() {
		return require("./cli");
	},
	get AutomaticPrefetchPlugin() {
		return require("./AutomaticPrefetchPlugin");
	},
	get AsyncDependenciesBlock() {
		return require("./AsyncDependenciesBlock");
	},
	get BannerPlugin() {
		return require("./BannerPlugin");
	},
	get Cache() {
		return require("./Cache");
	},
	get Chunk() {
		return require("./Chunk");
	},
	get ChunkGraph() {
		return require("./ChunkGraph");
	},
	get CleanPlugin() {
		return require("./CleanPlugin");
	},
	get Compilation() {
		return require("./Compilation");
	},
	get Compiler() {
		return require("./Compiler");
	},
	get ConcatenationScope() {
		return require("./ConcatenationScope");
	},
	get ContextExclusionPlugin() {
		return require("./ContextExclusionPlugin");
	},
	get ContextReplacementPlugin() {
		return require("./ContextReplacementPlugin");
	},
	get DefinePlugin() {
		return require("./DefinePlugin");
	},
	get DelegatedPlugin() {
		return require("./DelegatedPlugin");
	},
	get Dependency() {
		return require("./Dependency");
	},
	get DllPlugin() {
		return require("./DllPlugin");
	},
	get DllReferencePlugin() {
		return require("./DllReferencePlugin");
	},
	get DynamicEntryPlugin() {
		return require("./DynamicEntryPlugin");
	},
	get EntryOptionPlugin() {
		return require("./EntryOptionPlugin");
	},
	get EntryPlugin() {
		return require("./EntryPlugin");
	},
	get EnvironmentPlugin() {
		return require("./EnvironmentPlugin");
	},
	get EvalDevToolModulePlugin() {
		return require("./EvalDevToolModulePlugin");
	},
	get EvalSourceMapDevToolPlugin() {
		return require("./EvalSourceMapDevToolPlugin");
	},
	get ExternalModule() {
		return require("./ExternalModule");
	},
	get ExternalsPlugin() {
		return require("./ExternalsPlugin");
	},
	get Generator() {
		return require("./Generator");
	},
	get HotUpdateChunk() {
		return require("./HotUpdateChunk");
	},
	get HotModuleReplacementPlugin() {
		return require("./HotModuleReplacementPlugin");
	},
	get InitFragment() {
		return require("./InitFragment");
	},
	get IgnorePlugin() {
		return require("./IgnorePlugin");
	},
	get JavascriptModulesPlugin() {
		return util.deprecate(
			() => require("./javascript/JavascriptModulesPlugin"),
			"webpack.JavascriptModulesPlugin has moved to webpack.javascript.JavascriptModulesPlugin",
			"DEP_WEBPACK_JAVASCRIPT_MODULES_PLUGIN"
		)();
	},
	get LibManifestPlugin() {
		return require("./LibManifestPlugin");
	},
	get LibraryTemplatePlugin() {
		return util.deprecate(
			() => require("./LibraryTemplatePlugin"),
			"webpack.LibraryTemplatePlugin is deprecated and has been replaced by compilation.outputOptions.library or compilation.addEntry + passing a library option",
			"DEP_WEBPACK_LIBRARY_TEMPLATE_PLUGIN"
		)();
	},
	get LoaderOptionsPlugin() {
		return require("./LoaderOptionsPlugin");
	},
	get LoaderTargetPlugin() {
		return require("./LoaderTargetPlugin");
	},
	get Module() {
		return require("./Module");
	},
	get ModuleFilenameHelpers() {
		return require("./ModuleFilenameHelpers");
	},
	get ModuleGraph() {
		return require("./ModuleGraph");
	},
	get ModuleGraphConnection() {
		return require("./ModuleGraphConnection");
	},
	get NoEmitOnErrorsPlugin() {
		return require("./NoEmitOnErrorsPlugin");
	},
	get NormalModule() {
		return require("./NormalModule");
	},
	get NormalModuleReplacementPlugin() {
		return require("./NormalModuleReplacementPlugin");
	},
	get MultiCompiler() {
		return require("./MultiCompiler");
	},
	get OptimizationStages() {
		return require("./OptimizationStages");
	},
	get Parser() {
		return require("./Parser");
	},
	get PlatformPlugin() {
		return require("./PlatformPlugin");
	},
	get PrefetchPlugin() {
		return require("./PrefetchPlugin");
	},
	get ProgressPlugin() {
		return require("./ProgressPlugin");
	},
	get ProvidePlugin() {
		return require("./ProvidePlugin");
	},
	get RuntimeGlobals() {
		return require("./RuntimeGlobals");
	},
	get RuntimeModule() {
		return require("./RuntimeModule");
	},
	get SingleEntryPlugin() {
		return util.deprecate(
			() => require("./EntryPlugin"),
			"SingleEntryPlugin was renamed to EntryPlugin",
			"DEP_WEBPACK_SINGLE_ENTRY_PLUGIN"
		)();
	},
	get SourceMapDevToolPlugin() {
		return require("./SourceMapDevToolPlugin");
	},
	get Stats() {
		return require("./Stats");
	},
	get Template() {
		return require("./Template");
	},
	get UsageState() {
		return require("./ExportsInfo").UsageState;
	},
	get WatchIgnorePlugin() {
		return require("./WatchIgnorePlugin");
	},
	get WebpackError() {
		return require("./WebpackError");
	},
	get WebpackOptionsApply() {
		return require("./WebpackOptionsApply");
	},
	get WebpackOptionsDefaulter() {
		return util.deprecate(
			() => require("./WebpackOptionsDefaulter"),
			"webpack.WebpackOptionsDefaulter is deprecated and has been replaced by webpack.config.getNormalizedWebpackOptions and webpack.config.applyWebpackOptionsDefaults",
			"DEP_WEBPACK_OPTIONS_DEFAULTER"
		)();
	},
	// TODO webpack 6 deprecate
	get WebpackOptionsValidationError() {
		return require("schema-utils").ValidationError;
	},
	get ValidationError() {
		return require("schema-utils").ValidationError;
	},

	cache: {
		get MemoryCachePlugin() {
			return require("./cache/MemoryCachePlugin");
		}
	},

	config: {
		get getNormalizedWebpackOptions() {
			return require("./config/normalization").getNormalizedWebpackOptions;
		},
		get applyWebpackOptionsDefaults() {
			return require("./config/defaults").applyWebpackOptionsDefaults;
		}
	},

	dependencies: {
		get ModuleDependency() {
			return require("./dependencies/ModuleDependency");
		},
		get HarmonyImportDependency() {
			return require("./dependencies/HarmonyImportDependency");
		},
		get ConstDependency() {
			return require("./dependencies/ConstDependency");
		},
		get NullDependency() {
			return require("./dependencies/NullDependency");
		}
	},

	ids: {
		get ChunkModuleIdRangePlugin() {
			return require("./ids/ChunkModuleIdRangePlugin");
		},
		get NaturalModuleIdsPlugin() {
			return require("./ids/NaturalModuleIdsPlugin");
		},
		get OccurrenceModuleIdsPlugin() {
			return require("./ids/OccurrenceModuleIdsPlugin");
		},
		get NamedModuleIdsPlugin() {
			return require("./ids/NamedModuleIdsPlugin");
		},
		get DeterministicChunkIdsPlugin() {
			return require("./ids/DeterministicChunkIdsPlugin");
		},
		get DeterministicModuleIdsPlugin() {
			return require("./ids/DeterministicModuleIdsPlugin");
		},
		get NamedChunkIdsPlugin() {
			return require("./ids/NamedChunkIdsPlugin");
		},
		get OccurrenceChunkIdsPlugin() {
			return require("./ids/OccurrenceChunkIdsPlugin");
		},
		get HashedModuleIdsPlugin() {
			return require("./ids/HashedModuleIdsPlugin");
		}
	},

	javascript: {
		get EnableChunkLoadingPlugin() {
			return require("./javascript/EnableChunkLoadingPlugin");
		},
		get JavascriptModulesPlugin() {
			return require("./javascript/JavascriptModulesPlugin");
		},
		get JavascriptParser() {
			return require("./javascript/JavascriptParser");
		}
	},

	optimize: {
		get AggressiveMergingPlugin() {
			return require("./optimize/AggressiveMergingPlugin");
		},
		get AggressiveSplittingPlugin() {
			return util.deprecate(
				() => require("./optimize/AggressiveSplittingPlugin"),
				"AggressiveSplittingPlugin is deprecated in favor of SplitChunksPlugin",
				"DEP_WEBPACK_AGGRESSIVE_SPLITTING_PLUGIN"
			)();
		},
		get InnerGraph() {
			return require("./optimize/InnerGraph");
		},
		get LimitChunkCountPlugin() {
			return require("./optimize/LimitChunkCountPlugin");
		},
		get MinChunkSizePlugin() {
			return require("./optimize/MinChunkSizePlugin");
		},
		get ModuleConcatenationPlugin() {
			return require("./optimize/ModuleConcatenationPlugin");
		},
		get RealContentHashPlugin() {
			return require("./optimize/RealContentHashPlugin");
		},
		get RuntimeChunkPlugin() {
			return require("./optimize/RuntimeChunkPlugin");
		},
		get SideEffectsFlagPlugin() {
			return require("./optimize/SideEffectsFlagPlugin");
		},
		get SplitChunksPlugin() {
			return require("./optimize/SplitChunksPlugin");
		}
	},

	runtime: {
		get GetChunkFilenameRuntimeModule() {
			return require("./runtime/GetChunkFilenameRuntimeModule");
		},
		get LoadScriptRuntimeModule() {
			return require("./runtime/LoadScriptRuntimeModule");
		}
	},

	prefetch: {
		get ChunkPrefetchPreloadPlugin() {
			return require("./prefetch/ChunkPrefetchPreloadPlugin");
		}
	},

	web: {
		get FetchCompileAsyncWasmPlugin() {
			return require("./web/FetchCompileAsyncWasmPlugin");
		},
		get FetchCompileWasmPlugin() {
			return require("./web/FetchCompileWasmPlugin");
		},
		get JsonpChunkLoadingRuntimeModule() {
			return require("./web/JsonpChunkLoadingRuntimeModule");
		},
		get JsonpTemplatePlugin() {
			return require("./web/JsonpTemplatePlugin");
		}
	},

	webworker: {
		get WebWorkerTemplatePlugin() {
			return require("./webworker/WebWorkerTemplatePlugin");
		}
	},

	node: {
		get NodeEnvironmentPlugin() {
			return require("./node/NodeEnvironmentPlugin");
		},
		get NodeSourcePlugin() {
			return require("./node/NodeSourcePlugin");
		},
		get NodeTargetPlugin() {
			return require("./node/NodeTargetPlugin");
		},
		get NodeTemplatePlugin() {
			return require("./node/NodeTemplatePlugin");
		},
		get ReadFileCompileWasmPlugin() {
			return require("./node/ReadFileCompileWasmPlugin");
		}
	},

	electron: {
		get ElectronTargetPlugin() {
			return require("./electron/ElectronTargetPlugin");
		}
	},

	wasm: {
		get AsyncWebAssemblyModulesPlugin() {
			return require("./wasm-async/AsyncWebAssemblyModulesPlugin");
		},
		get EnableWasmLoadingPlugin() {
			return require("./wasm/EnableWasmLoadingPlugin");
		}
	},

	library: {
		get AbstractLibraryPlugin() {
			return require("./library/AbstractLibraryPlugin");
		},
		get EnableLibraryPlugin() {
			return require("./library/EnableLibraryPlugin");
		}
	},

	container: {
		get ContainerPlugin() {
			return require("./container/ContainerPlugin");
		},
		get ContainerReferencePlugin() {
			return require("./container/ContainerReferencePlugin");
		},
		get ModuleFederationPlugin() {
			return require("./container/ModuleFederationPlugin");
		},
		get scope() {
			return require("./container/options").scope;
		}
	},

	sharing: {
		get ConsumeSharedPlugin() {
			return require("./sharing/ConsumeSharedPlugin");
		},
		get ProvideSharedPlugin() {
			return require("./sharing/ProvideSharedPlugin");
		},
		get SharePlugin() {
			return require("./sharing/SharePlugin");
		},
		get scope() {
			return require("./container/options").scope;
		}
	},

	debug: {
		get ProfilingPlugin() {
			return require("./debug/ProfilingPlugin");
		}
	},

	util: {
		get createHash() {
			return require("./util/createHash");
		},
		get comparators() {
			return require("./util/comparators");
		},
		get runtime() {
			return require("./util/runtime");
		},
		get serialization() {
			return require("./util/serialization");
		},
		get cleverMerge() {
			return require("./util/cleverMerge").cachedCleverMerge;
		},
		get LazySet() {
			return require("./util/LazySet");
		},
		get compileBooleanMatcher() {
			return require("./util/compileBooleanMatcher");
		}
	},

	get sources() {
		return require("webpack-sources");
	},

	experiments: {
		schemes: {
			get HttpUriPlugin() {
				return require("./schemes/HttpUriPlugin");
			}
		},
		ids: {
			get SyncModuleIdsPlugin() {
				return require("./ids/SyncModuleIdsPlugin");
			}
		}
	}
});

```

## bin/webpack.js

```js
#!/usr/bin/env node

/**
 * @param {string} command process to run
 * @param {string[]} args command line arguments
 * @returns {Promise<void>} promise
 */
const runCommand = (command, args) => {
	const cp = require("child_process");
	return new Promise((resolve, reject) => {
		const executedCommand = cp.spawn(command, args, {
			stdio: "inherit",
			shell: true
		});

		executedCommand.on("error", error => {
			reject(error);
		});

		executedCommand.on("exit", code => {
			if (code === 0) {
				resolve();
			} else {
				reject();
			}
		});
	});
};

/**
 * @param {string} packageName name of the package
 * @returns {boolean} is the package installed?
 */
const isInstalled = packageName => {
	if (process.versions.pnp) {
		return true;
	}

	const path = require("path");
	const fs = require("graceful-fs");

	let dir = __dirname;

	do {
		try {
			if (
				fs.statSync(path.join(dir, "node_modules", packageName)).isDirectory()
			) {
				return true;
			}
		} catch (_error) {
			// Nothing
		}
	} while (dir !== (dir = path.dirname(dir)));

	// https://github.com/nodejs/node/blob/v18.9.1/lib/internal/modules/cjs/loader.js#L1274
	// eslint-disable-next-line no-warning-comments
	// @ts-ignore
	for (const internalPath of require("module").globalPaths) {
		try {
			if (fs.statSync(path.join(internalPath, packageName)).isDirectory()) {
				return true;
			}
		} catch (_error) {
			// Nothing
		}
	}

	return false;
};

/**
 * @param {CliOption} cli options
 * @returns {void}
 */
const runCli = cli => {
	const path = require("path");
	const pkgPath = require.resolve(`${cli.package}/package.json`);
	const pkg = require(pkgPath);

	if (pkg.type === "module" || /\.mjs/i.test(pkg.bin[cli.binName])) {
		import(path.resolve(path.dirname(pkgPath), pkg.bin[cli.binName])).catch(
			err => {
				console.error(err);
				process.exitCode = 1;
			}
		);
	} else {
		require(path.resolve(path.dirname(pkgPath), pkg.bin[cli.binName]));
	}
};

/**
 * @typedef {object} CliOption
 * @property {string} name display name
 * @property {string} package npm package name
 * @property {string} binName name of the executable file
 * @property {boolean} installed currently installed?
 * @property {string} url homepage
 */

/** @type {CliOption} */
const cli = {
	name: "webpack-cli",
	package: "webpack-cli",
	binName: "webpack-cli",
	installed: isInstalled("webpack-cli"),
	url: "https://github.com/webpack/webpack-cli"
};

if (!cli.installed) {
	const path = require("path");
	const fs = require("graceful-fs");
	const readLine = require("readline");

	const notify = `CLI for webpack must be installed.\n  ${cli.name} (${cli.url})\n`;

	console.error(notify);

	/** @type {string | undefined} */
	let packageManager;

	if (fs.existsSync(path.resolve(process.cwd(), "yarn.lock"))) {
		packageManager = "yarn";
	} else if (fs.existsSync(path.resolve(process.cwd(), "pnpm-lock.yaml"))) {
		packageManager = "pnpm";
	} else {
		packageManager = "npm";
	}

	const installOptions = [packageManager === "yarn" ? "add" : "install", "-D"];

	console.error(
		`We will use "${packageManager}" to install the CLI via "${packageManager} ${installOptions.join(
			" "
		)} ${cli.package}".`
	);

	const question = "Do you want to install 'webpack-cli' (yes/no): ";

	const questionInterface = readLine.createInterface({
		input: process.stdin,
		output: process.stderr
	});

	// In certain scenarios (e.g. when STDIN is not in terminal mode), the callback function will not be
	// executed. Setting the exit code here to ensure the script exits correctly in those cases. The callback
	// function is responsible for clearing the exit code if the user wishes to install webpack-cli.
	process.exitCode = 1;
	questionInterface.question(question, answer => {
		questionInterface.close();

		const normalizedAnswer = answer.toLowerCase().startsWith("y");

		if (!normalizedAnswer) {
			console.error(
				"You need to install 'webpack-cli' to use webpack via CLI.\n" +
					"You can also install the CLI manually."
			);

			return;
		}
		process.exitCode = 0;

		console.log(
			`Installing '${
				cli.package
			}' (running '${packageManager} ${installOptions.join(" ")} ${
				cli.package
			}')...`
		);

		runCommand(
			/** @type {string} */ (packageManager),
			installOptions.concat(cli.package)
		)
			.then(() => {
				runCli(cli);
			})
			.catch(err => {
				console.error(err);
				process.exitCode = 1;
			});
	});
} else {
	runCli(cli);
}

```

## webpack 入口

```js
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

"use strict";

const util = require("util");
const webpackOptionsSchemaCheck = require("../schemas/WebpackOptions.check.js");
const webpackOptionsSchema = require("../schemas/WebpackOptions.json");
const Compiler = require("./Compiler");
const MultiCompiler = require("./MultiCompiler");
const WebpackOptionsApply = require("./WebpackOptionsApply");
const {
	applyWebpackOptionsDefaults,
	applyWebpackOptionsBaseDefaults
} = require("./config/defaults");
const { getNormalizedWebpackOptions } = require("./config/normalization");
const NodeEnvironmentPlugin = require("./node/NodeEnvironmentPlugin");
const memoize = require("./util/memoize");

/** @typedef {import("../declarations/WebpackOptions").WebpackOptions} WebpackOptions */
/** @typedef {import("../declarations/WebpackOptions").WebpackPluginFunction} WebpackPluginFunction */
/** @typedef {import("./Compiler").WatchOptions} WatchOptions */
/** @typedef {import("./MultiCompiler").MultiCompilerOptions} MultiCompilerOptions */
/** @typedef {import("./MultiStats")} MultiStats */
/** @typedef {import("./Stats")} Stats */

const getValidateSchema = memoize(() => require("./validateSchema"));

/**
 * @template T
 * @callback Callback
 * @param {Error | null} err
 * @param {T=} stats
 * @returns {void}
 */

/**
 * @param {ReadonlyArray<WebpackOptions>} childOptions options array
 * @param {MultiCompilerOptions} options options
 * @returns {MultiCompiler} a multi-compiler
 */
const createMultiCompiler = (childOptions, options) => {
	const compilers = childOptions.map((options, index) =>
		createCompiler(options, index)
	);
	const compiler = new MultiCompiler(compilers, options);
	for (const childCompiler of compilers) {
		if (childCompiler.options.dependencies) {
			compiler.setDependencies(
				childCompiler,
				childCompiler.options.dependencies
			);
		}
	}
	return compiler;
};

/**
 * @param {WebpackOptions} rawOptions options object
 * @param {number} [compilerIndex] index of compiler
 * @returns {Compiler} a compiler
 */
const createCompiler = (rawOptions, compilerIndex) => {
	const options = getNormalizedWebpackOptions(rawOptions);
	applyWebpackOptionsBaseDefaults(options);
	const compiler = new Compiler(
		/** @type {string} */ (options.context),
		options
	);
	new NodeEnvironmentPlugin({
		infrastructureLogging: options.infrastructureLogging
	}).apply(compiler);
	if (Array.isArray(options.plugins)) {
		for (const plugin of options.plugins) {
			if (typeof plugin === "function") {
				/** @type {WebpackPluginFunction} */
				(plugin).call(compiler, compiler);
			} else if (plugin) {
				plugin.apply(compiler);
			}
		}
	}
	const resolvedDefaultOptions = applyWebpackOptionsDefaults(
		options,
		compilerIndex
	);
	if (resolvedDefaultOptions.platform) {
		compiler.platform = resolvedDefaultOptions.platform;
	}
	compiler.hooks.environment.call();
	compiler.hooks.afterEnvironment.call();
	new WebpackOptionsApply().process(options, compiler);
	compiler.hooks.initialize.call();
	return compiler;
};

/**
 * @callback WebpackFunctionSingle
 * @param {WebpackOptions} options options object
 * @param {Callback<Stats>=} callback callback
 * @returns {Compiler} the compiler object
 */

/**
 * @callback WebpackFunctionMulti
 * @param {ReadonlyArray<WebpackOptions> & MultiCompilerOptions} options options objects
 * @param {Callback<MultiStats>=} callback callback
 * @returns {MultiCompiler} the multi compiler object
 */

/**
 * @template T
 * @param {Array<T> | T} options options
 * @returns {Array<T>} array of options
 */
const asArray = options =>
	Array.isArray(options) ? Array.from(options) : [options];

const webpack = /** @type {WebpackFunctionSingle & WebpackFunctionMulti} */ (
	/**
	 * @param {WebpackOptions | (ReadonlyArray<WebpackOptions> & MultiCompilerOptions)} options options
	 * @param {Callback<Stats> & Callback<MultiStats>=} callback callback
	 * @returns {Compiler | MultiCompiler | null} Compiler or MultiCompiler
	 */
	(options, callback) => {
		const create = () => {
			if (!asArray(options).every(webpackOptionsSchemaCheck)) {
				getValidateSchema()(webpackOptionsSchema, options);
				util.deprecate(
					() => {},
					"webpack bug: Pre-compiled schema reports error while real schema is happy. This has performance drawbacks.",
					"DEP_WEBPACK_PRE_COMPILED_SCHEMA_INVALID"
				)();
			}
			/** @type {MultiCompiler|Compiler} */
			let compiler;
			/** @type {boolean | undefined} */
			let watch = false;
			/** @type {WatchOptions|WatchOptions[]} */
			let watchOptions;
			if (Array.isArray(options)) {
				/** @type {MultiCompiler} */
				compiler = createMultiCompiler(
					options,
					/** @type {MultiCompilerOptions} */ (options)
				);
				watch = options.some(options => options.watch);
				watchOptions = options.map(options => options.watchOptions || {});
			} else {
				const webpackOptions = /** @type {WebpackOptions} */ (options);
				/** @type {Compiler} */
				compiler = createCompiler(webpackOptions);
				watch = webpackOptions.watch;
				watchOptions = webpackOptions.watchOptions || {};
			}
			return { compiler, watch, watchOptions };
		};
		if (callback) {
			try {
				const { compiler, watch, watchOptions } = create();
				if (watch) {
					compiler.watch(watchOptions, callback);
				} else {
					compiler.run((err, stats) => {
						compiler.close(err2 => {
							callback(
								err || err2,
								/** @type {options extends WebpackOptions ? Stats : MultiStats} */
								(stats)
							);
						});
					});
				}
				return compiler;
			} catch (err) {
				process.nextTick(() => callback(/** @type {Error} */ (err)));
				return null;
			}
		} else {
			const { compiler, watch } = create();
			if (watch) {
				util.deprecate(
					() => {},
					"A 'callback' argument needs to be provided to the 'webpack(options, callback)' function when the 'watch' option is set. There is no way to handle the 'watch' option without a callback.",
					"DEP_WEBPACK_WATCH_WITHOUT_CALLBACK"
				)();
			}
			return compiler;
		}
	}
);

module.exports = webpack;

```


## 总结
