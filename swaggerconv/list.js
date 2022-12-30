const fs = require('fs');
const { argv } = require('process');
let docname = argv[2]
let output = docname + '.csv'

let rawdata = fs.readFileSync(docname);
let content = JSON.parse(rawdata);

let tags = content.tags?.map(tag => tag.name) || []

function getListAPI(content, tagname){
    let listAPI = Object.entries(content.paths).filter(path => {
        let methods = Object.entries(path[1]).filter(method => {
            if(method[1].tags.includes(tagname))
                return true
            return false
        })
        if (methods.length > 0)
            return true
        return false
    })
    return listAPI
}
function exportTag(content){
    let tags = []
    Object.entries(content.paths).forEach(path => {
        Object.entries(path[1]).forEach(method => {
            if(method[1].tags.length > 0)
                tags = tags.concat(method[1].tags)
        })
    })
    tags = [...new Set(tags)];
    return tags
}
function getRemainingTags(existing, list){
    return list.filter(tag => !existing.includes(tag))
}

tags = tags.concat(getRemainingTags(tags, exportTag(content)))
index = 1
let rows = []
tags.forEach(tag => {
    let listAPI = getListAPI(content, tag)
    listAPI.forEach(path => {
        let pathName = path[0];
        Object.entries(path[1]).forEach(method=>{
            let methodName = method[0]
            rows.push([index++, tag, pathName, methodName, "","","",""])
        })
    })
})

let csv = [["STT", "Tag", "Path", "Method", "Tested", "Vuln?", "Auth?", "Notes"]]
csv = csv.concat(rows)

csv = csv
  .map((item) => {
    
    // Here item refers to a row in that 2D array
    var row = item;
      
    // Now join the elements of row with "," using join function
    return row.join(",");
  }) // At this point we have an array of strings
  .join("\n");

fs.writeFileSync(output, csv)