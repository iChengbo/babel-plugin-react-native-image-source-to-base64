import { types as Types, PluginObj } from 'babel__core'
import * as mimeType from 'mime-types'
import * as fs from 'fs'
import * as nodePath from 'path';

const buildImageSource = (t: typeof Types, imgPath: string) => {
    const fileMimeType = mimeType.lookup(imgPath);
    const data = fs.readFileSync(imgPath);
    const buff = Buffer.from(data).toString('base64');
    const base64 = 'data:' + fileMimeType + ';base64,' + buff;
    const dimensions = require('image-size')(imgPath);
    const source = t.objectExpression([
        t.objectProperty(
            t.identifier('uri'),
            t.stringLiteral(base64),
        ),
        t.objectProperty(
            t.identifier('width'),
            t.numericLiteral(dimensions.width)
        ),
        t.objectProperty(
            t.identifier('height'),
            t.numericLiteral(dimensions.height)
        ),
    ]);
    return source;
}

const plugin = function (babel: { types: typeof Types }): PluginObj {
    const t = babel.types;
    const LIMIT = 1 * 1024;
    const FILE_TEST = /\.(png|jpg|jpeg)$/;
    return {
        visitor: {
            CallExpression(ast, source: any) {
                const { opts: { limit = LIMIT, test = FILE_TEST }, file: { opts: { cwd } } } = source;
                if (t.isIdentifier(ast.node.callee, { name: 'require' }) && ast.node.arguments.length === 1) {
                    if (t.isStringLiteral(ast.node.arguments[0]) && test.test(ast.node.arguments[0].value)) {
                        const filePath = nodePath.resolve(cwd, ast.node.arguments[0].value);
                        const data = fs.readFileSync(filePath);
                        if (data.length < limit) {
                            const source = buildImageSource(t, filePath);
                            ast.replaceWith(source);
                        }
                    }
                }
            },
            ImportDeclaration(ast, source: any) {
                const { opts: { limit = LIMIT, test = FILE_TEST }, file: { opts: { cwd } } } = source;
                if (test.test(ast.node.source.value)) {
                    const filePath = nodePath.resolve(cwd, ast.node.source.value);
                    const data = fs.readFileSync(filePath);
                    if (data.length < limit) {
                        const source = buildImageSource(t, filePath);
                        ast.replaceWith(t.variableDeclaration("const", [
                            t.variableDeclarator(
                                t.identifier(ast.node.specifiers[0].local.name),
                                source
                            )
                        ]));
                    }
                }
            }
        },
    }
}

export default plugin;