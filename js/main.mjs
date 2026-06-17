
import { PseudoTerminal } from './lib/js-pseudo-terminal.mjs'

export const terminal = new PseudoTerminal(document.querySelector('#app-root'))

export async function main() {
    // WRITE YOUR CODE AFTER THIS LINE
    while (true) {
        const input = await terminal.getInput(false)

        const shouldStop = processInput(input)
        if (shouldStop) { break }
    }
}

/**
 * @param {string} input 
 */
function processInput(input) {
    if (input.trim() === 'clear') {
        terminal.clearDisplay()
        return
    }

    if (input.trim() === 'exit') {
        return true
    }

    if (input.startsWith('@html:')) {
        const frag = document.createDocumentFragment()
        const div = document.createElement('div')
        div.innerHTML = input.slice(6)
        frag.append(div)
        terminal.appendToDisplay(frag)
        return
    }

    terminal.writeMessageLine('@echo: ' + input)
}

