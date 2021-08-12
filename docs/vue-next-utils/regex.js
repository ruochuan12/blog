const cacheStringFunction = (fn) => {
    const cache = Object.create(null);
    return ((str) => {
        const hit = cache[str];
        return hit || (cache[str] = fn(str));
    });
};
// \w 是 0-9a-zA-Z_ 数字 大小写字母和下划线组成
// () 小括号是 分组捕获
const camelizeRE = /-(\w)/g;
/**
 * @private
 */
// 首字母转大写
const camelize = cacheStringFunction((str) => {
    return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''));
});
// \B 是指 非 \b 单词边界。
const hyphenateRE = /\B([A-Z])/g;

// 连字符
/**
 * @private
 */
const hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, '-$1').toLowerCase());
// 举例：
const hyphenateResult = hyphenate('onClick');
console.log('hyphenateResult', hyphenateResult); // on-click

/**
 * @private
 */
// 首字母转大写
const capitalize = cacheStringFunction((str) => str.charAt(0).toUpperCase() + str.slice(1));
/**
 * @private
 */
const toHandlerKey = cacheStringFunction((str) => (str ? `on${capitalize(str)}` : ``));

const result = toHandlerKey('click');
console.log(result, 'result'); // 'onClick'