#!/usr/bin / env node

/* eslint-disable no-unused-vars */
/* eslint-disable indent */

const path = require('path')
const fs = require('fs')
const getPathInfo = p => path.parse(p)

function loadFile(dir, useSubdirectories = false, extList = ['.js', '.xlsx']) {
    console.log('---dir---', dir)
    const fileList = []
    function readFileList(dir, useSubdirectories, extList) {
        const files = fs.readdirSync(dir)
        files.forEach(item => {
            const fullPath = path.join(dir, item)
            console.log('fullPath', fullPath);
            const stat = fs.statSync(fullPath)
            console.log('stat', stat);
            if (stat.isDirectory() && useSubdirectories) {
                readFileList(path.join(dir, item), useSubdirectories, extList)
            } else {
                const info = getPathInfo(fullPath)
                // console.log('info', info);
                extList.includes(info.ext) && fileList.push(fullPath)
            }
        })
    }
    readFileList(dir, useSubdirectories, extList)
    const res = fileList.map(item => {
        const info = getPathInfo(item)
        return {
            path: item,
            data: info.ext === '.xlsx' ? fs.readFileSync(item, "binary") : require(item),
            // data: require(item),
            ...info
        }
    })
    return res
}

module.exports = loadFile
