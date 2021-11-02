const fs = require("fs")
const yargs = require('yargs');

const argv = yargs
    .option('input', {
        alias: 'i',
        description: 'Path to directory containing input files',
        type: 'string',
        demand: true,
        demand: 'Input directory is required',
    })
    .option('output', {
        alias: 'o',
        description: 'Path to directory for output files',
        type: 'string',
        demand: true,
        demand: 'Output directory is required',
    })
    .help()
    .alias('help', 'h')
    .argv;

if (argv.input && argv.output) {
    // Find all files in input directory
    fs.readdir(argv.input, function (err, files) {
        if (err) {
            return console.error(err);
        }
        // For each svg, do the conversion
        files.forEach(function (file) {
            fs.readFile(`${argv.input}/${file}`, function (err, data) {
                if (err) {
                    return console.error(err);
                }
                var file_string = data.toString()
                // Replace the first instance of height
                file_string = file_string.replace(/(height="[a-zA-Z0-9]*")/, "height={props.size}");
                // Replace the first instance of width
                file_string = file_string.replace(/(width="[a-zA-Z0-9]*")/, "width={props.size}");
                // Replace all instances of fill that are not none
                file_string = file_string.replace(/(?!fill="none")(fill="[#a-zA-Z0-9]*")/g, "fill={props.color}");
                // Replace all instances of stroke
                file_string = file_string.replace(/(stroke="[#a-zA-Z0-9]*")/g, "stroke={props.color}");

                let output_string = `import * as React from "react";\n\nfunction Icon(props) {\n\treturn (\n\t\t${file_string}\n\t);\n}\n\nexport default Icon;`;

                fs.writeFile(`${argv.output}/${file.replace(/(\.[a-zA-Z0-9]*)/, ".js")}`, output_string, function(err) {
                    if (err) {
                       return console.error(err);
                    }

                    console.log(`All done :)\n\nFiles available in ${argv.output}`)
                })
            });
        });
    });
}