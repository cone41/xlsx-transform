const loadFile = require('../utils/loadFile.js')
const path = require('path');
const { export_array_to_excel } = require('../utils/excel.js')

let fileList = loadFile(path.join(__dirname, '../lang/'), true)
const args = require('minimist')(process.argv.slice(2))

console.log('fileList', fileList);

let targetProject = args.p
if (targetProject) {
    fileList = loadFile(path.join(__dirname, '../lang/' + targetProject), true)
}

// 导出 excel
readFile()


function readFile() {
    fileList.filter(file => file.ext === '.js' || file.ext === '.mjs').map(({ data, name, dir }) => {
        let keys = [], values = [], titles = []
        title = ['key', 'En', 'Ch']
        keyMap = ['langKey', 'langValue']
        keys = getKeys(data)
        values = getValues(data)
        const dataArr = formatData(keys, values)
        console.log('dataArr', dataArr);
        dir = dir.split('/lang/')[1] || dir.split('\lang\\')[1]
        export_array_to_excel({ data: dataArr, key: keyMap, title: title, filename: name, autoWidth: true, dir })
    })
}

function formatData(keys, values) {
    let arr = []
    for (let i = 0; i < keys.length; i++) {
        arr.push({
            langKey: keys[i],
            langValue: values[i]
        })
    }
    return arr
}

function getKeys(data) {
    const arr = []
    const DFS = function (data, arr, prev) {
        Object.keys(data).forEach(v => {
            if (Object.prototype.toString.call(data[v]) === '[object Object]') {
                DFS(data[v], arr, prev ? (prev + ', ' + v) : v)
            } else {
                arr.push(prev ? (prev + ', ' + v) : v)
            }
        })
    }

    DFS(data, arr, '')
    return arr

}



function getValues(data) {
    const values = []
    const DFS = function (data, arr) {
        let prev = ''
        Object.values(data).forEach(v => {
            if (Object.prototype.toString.call(v) === '[object Object]') {
                DFS(v, arr)
            } else {
                if (Object.prototype.toString.call(v) === '[object Array]') {
                    arr.push(JSON.stringify(v))
                } else {
                    arr.push(v)
                }
            }
        })
    }

    DFS(data, values)
    return values
}