const fs = require('fs');

const mathRender = require('./renders/math');
const plantUmlRender = require('./renders/plantuml');
const markdownRender = require('./renders/markdown');

const ptFolder = `${__dirname}/pt`;
const enFolder = `${__dirname}/en`;

const publishFolder = `${__dirname}/docs`;

const ptFiles = fs.readdirSync(ptFolder);

const pageDefaults = `
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" integrity="sha384-nB0miv6/jRmo5UMMR1wu3Gz6NLsoTkbqJghGIsx//Rlm+ZU03BU6SQNC66uf4l5+" crossorigin="anonymous">
  </head>
  <body>
  <h1>{{title}}</h1>
  {{body}}
  </body>
</html>`

const main = async () => {
    for (let file of ptFiles) {
        const markdownData = fs.readFileSync(`${ptFolder}/${file}`, 'utf-8');

        const htmlData = markdownRender(markdownData);
    
        const page = pageDefaults
            .replace('{{title}}', file.replace('.md', ''))
            .replace('{{body}}', htmlData);

        const mathRendered = await mathRender(page);
        const graphRendered = await plantUmlRender(mathRendered);
    
        fs.writeFileSync(`${publishFolder}/${file}.html`, graphRendered, );
    }
}

main().catch(err => console.log(err));
