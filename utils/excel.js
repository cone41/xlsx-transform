/* eslint-disable */
const XLSX = require('xlsx')
const fs = require('fs')
const path = require('path')

function auto_width(ws, data) {
    /*set worksheet max width per col*/
    const colWidth = data.map(row => row.map(val => {
        /*if null/undefined*/
        if (val == null) {
            return { 'wch': 10 };
        }
        /*if chinese*/
        else if (val.toString().charCodeAt(0) > 255) {
            return { 'wch': val.toString().length * 2 };
        } else {
            return { 'wch': val.toString().length };
        }
    }))
    /*start in the first row*/
    let result = colWidth[0];
    for (let i = 1; i < colWidth.length; i++) {
        for (let j = 0; j < colWidth[i].length; j++) {
            if (result[j]['wch'] < colWidth[i][j]['wch']) {
                result[j]['wch'] = colWidth[i][j]['wch'];
            }
        }
    }
    // ws['!cols'] = result; 
    // 设置长度不太稳定，针对国际化暂时写死宽度
    ws['!cols'] = [{ wch: 60 }, { wch: 150 }];
}

function json_to_array(key, jsonData) {
    return jsonData.map(v => key.map(j => { return v[j] }));
}

// fix data,return string
function fixdata(data) {
    let o = ''
    let l = 0
    const w = 10240
    for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)))
    o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)))
    return o
}

// get head from excel file,return array
function get_header_row(sheet) {
    const headers = []
    const range = XLSX.utils.decode_range(sheet['!ref'])
    let C
    const R = range.s.r /* start in the first row */
    for (C = range.s.c; C <= range.e.c; ++C) { /* walk every column in the range */
        var cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })] /* find the cell in the first row */
        var hdr = 'UNKNOWN ' + C // <-- replace with your desired default
        if (cell && cell.t) hdr = XLSX.utils.format_cell(cell)
        headers.push(hdr)
    }
    return headers
}




const export_array_to_excel = ({ key, data, title, filename, autoWidth, dir }) => {
    // 新建 book
    const wb = XLSX.utils.book_new();
    const arr = json_to_array(key, data);
    arr.unshift(title);
    // 新建空workbook，然后加入worksheet
    const ws = XLSX.utils.aoa_to_sheet(arr);
    if (autoWidth) {
        auto_width(ws, arr);
    }
    // 生成xlsx文件(book,sheet数据,sheet命名)
    XLSX.utils.book_append_sheet(wb, ws, filename);

    // mkdir dist
    const distPath = path.join(__dirname, '../dist-excel')
    if (!fs.existsSync(distPath)) fs.mkdirSync(distPath)

    // 将对应的文件放进对应的目录
    const filePath = dir ? path.join(__dirname, `../dist-excel/${dir}`) : path.join(__dirname, `../dist-excel`)
    console.log('filePath', filePath)
    console.log('dir', dir)
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, function (err) {
            err && console.error(err)
        })
    }

    // 写文件
    XLSX.writeFile(wb, dir ? `dist-excel/${dir}/${filename}.xlsx` : `dist-excel/${filename}.xlsx`);
}

const read = (data, type) => {
    /* if type == 'base64' must fix data first */
    // const fixedData = fixdata(data)
    // const workbook = XLSX.read(btoa(fixedData), { type: 'base64' })
    const workbook = XLSX.read(data, { type: type });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const header = get_header_row(worksheet);
    const results = XLSX.utils.sheet_to_json(worksheet);
    return { header, results };
}

module.exports = {
    export_array_to_excel,
    read
}
