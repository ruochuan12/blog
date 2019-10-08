const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const analyzeModule = function(filename){
	const fileContent = fs.readFileSync(filename, 'utf-8');
	const ast = parser.parse(fileContent, {
		sourceType: 'module',
	});

	console.log('parser:', ast.program.body);

	console.log(ast);

	traverse(ast, {
		ImportDeclaration({ node }){
			console.log('node:', node);
			console.log(node.value);
		}
	})
}

analyzeModule('./src/index.js');
