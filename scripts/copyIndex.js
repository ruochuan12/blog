import {globby} from 'globby';
import fs from 'node:fs';

import chokidar from 'chokidar';

const globalPaths = await globby(['docs/**/README.md']);

const copyFile = (paths = globalPaths) => {
	paths.forEach((path) => {
		fs.copyFile(path, path.replace(/README\.md/, 'index.md'), (err) => {
			if(err){
				console.err(`${path} 复制为 index.md 失败`, err);
			}
			else{
				// console.log(`${path} 复制为 index.md 成功`);
				// throw err;
			}
		})
	})
}

const watch = () => {
	chokidar
	.watch(globalPaths, {
		ignored: ['**/.{gitkeep,DS_Store}', '**/**/index.md'],
	})
	.on('change', (filePath) => {
		console.log(filePath, '修改成功');
		copyFile([filePath]);
	})
	.on('ready', async () => {
		console.log('ready');
		copyFile();
	});
}

watch();
