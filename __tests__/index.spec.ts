import * as babel from '@babel/core'
import plugin from '../src'

it('import & < limit, should transform', function () {
    const code = `
    import imgSource from './test.png'
  `
    const result = babel.transform(code, { plugins: [[plugin, { limit: 3 * 1024 }]] })
    expect(result?.code).toMatchSnapshot()
});

it('import & > limit, should not transform', function () {
    const code = `
    import imgSource from './test.png'
  `
    const result = babel.transform(code, { plugins: [[plugin]] })
    expect(result?.code).toMatchSnapshot()
});

it('import & !image, should not transform', function () {
    const code = `
    import { get } from 'lodash'
  `
    const result = babel.transform(code, { plugins: [[plugin, { limit: 3 * 1024 }]] })
    expect(result?.code).toMatchSnapshot()
});

it('require & < limit, should transform', function () {
    const code = `
    require('./test.png')
  `
    const result = babel.transform(code, { plugins: [[plugin, { limit: 3 * 1024 }]] })
    expect(result?.code).toMatchSnapshot()
});

it('require & > limit, should not transform', function () {
    const code = `
    require('./test.png')
  `
    const result = babel.transform(code, { plugins: [[plugin]] })
    expect(result?.code).toMatchSnapshot()
});

it('require & !image, should not transform', function () {
    const code = `
    require('lodash')
  `
    const result = babel.transform(code, { plugins: [[plugin]] })
    expect(result?.code).toMatchSnapshot()
});

it('function & !image, should not transform', function () {
    const code = `
    get(obj, 'a.b')
  `
    const result = babel.transform(code, { plugins: [[plugin]] })
    expect(result?.code).toMatchSnapshot()
});
