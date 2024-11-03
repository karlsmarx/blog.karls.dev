const plantuml = require('node-plantuml');
const { JSDOM } = require('jsdom');

const plantUmlRender = async (text) => {
    const jsDom = new JSDOM();
    const parser = new jsDom.window.DOMParser();

    const wrapper = parser.parseFromString(text, 'text/html').body;
    const blocks = wrapper.querySelectorAll('code.plantuml.language-plantuml');
    
    return new Promise((resolve, reject) => {
        blocks.forEach((element) => {
            const input = element.textContent;
    
            plantuml.generate(input, { format: 'svg' }, (_, data) => {
                element.parentNode.outerHTML = `<span title="${input.trim()}">${data.toString()}</span>`;
                resolve(wrapper.innerHTML);
            });
        });
    })
}

module.exports = plantUmlRender;
