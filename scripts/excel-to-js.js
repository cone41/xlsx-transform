const fs = require('fs')
const path = require('path')
const { read } = require('../utils/excel')
const loadFile = require('../utils/loadFile')
const fileList = loadFile(path.join(__dirname, '../dist-excel/'), true)

// 默认导出语言为英文，参照 readme
const [, , langType = 'En'] = process.argv
console.log('process.argv', langType)

console.log('fileList', fileList)
readFile()

function readFile() {
    if (!fileList.length) {
        console.warn('------ warning ------', '没有可转化的 excel')
        return
    }
    for (let i = 0; i < fileList.length; i++) {
        let { data, dir, name } = fileList[i];
        let { results } = read(data, 'binary')
        let lang = {}
        console.log('dir', dir, name);
        results.map(res => {
            let { key: key, [langType]: val } = res
            console.log('key', key);
            key = key.split(', ')
            const len = key.length
            let obj = {}
            // key 只有一层时直接赋值
            if (len === 1) {
                lang[key[0]] = isStrArray(val) ? JSON.parse(val) : val;
            } else {
                // 递归创建 obj
                dfs(key, val, obj, 0)
                lang = deepMerge(lang, obj)
            }
        })
        // console.log('lang', lang);

        const dirPath = path.join(__dirname, `../dist-${langType}`)
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath)
        }

        // 将对应的文件放进对应的目录
        dir = dir.split('dist-excel/')[1] || dir.split('dist-excel\\')[1]
        console.log('---dir', dir)
        const filePath = dir ? path.join(__dirname, `../dist-${langType}/${dir}`) : path.join(__dirname, `../dist-${langType}`)
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath, function (err) {
                // err && console.error(err)
            })
        }

        const fileName = filePath + `/${name}.js`
        const content = `export default ${JSON.stringify(lang, null, 2)}`

        // console.log('fileName', fileName);

        fs.writeFile(fileName, content, (err) => {
            // console.log('err', err);
        })
    }
}

function dfs(k, v, o, i) {
    if (i === k.length - 1) {
        o[k[i]] = isStrArray(v) ? JSON.parse(v) : v;
        return
    }
    o[k[i]] = {}
    dfs(k, v, o[k[i]], i + 1)
}

// 对象的深度合并
function deepMerge(o1, o2) {
    for (let k in o2) {
        if (o1[k] && Object.prototype.toString.call(o1[k]) === '[object Object]') {
            deepMerge(o1[k], o2[k])
        } else {
            o1[k] = o2[k]
        }
    }
    return o1
}

function isStrArray(t) {
    if (!t) return false;
    t = t.toString()
    return t.startsWith('[') && t.endsWith(']') && Object.prototype.toString.call(JSON.parse(t)) === '[object Array]'
}

