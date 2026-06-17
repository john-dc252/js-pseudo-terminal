
export class PseudoTerminal {
    static ROOT_SELECTOR = '.pseudo-term'
    static HEADER_SELECTOR = PseudoTerminal.ROOT_SELECTOR + '>.pseudo-term-header'
    static VIEWPORT_SELECTOR = PseudoTerminal.ROOT_SELECTOR + '>.pseudo-term-viewport'
    static DISPLAY_SELECTOR = PseudoTerminal.VIEWPORT_SELECTOR + '>.pseudo-term-display-section'
    static INPUT_ROW_SELECTOR = PseudoTerminal.VIEWPORT_SELECTOR + '>.pseudo-term-input-row'
    static INPUT_SELECTOR = PseudoTerminal.INPUT_ROW_SELECTOR + '>.pseudo-term-input'
    static ACCEPTING_INPUT_SELECTOR = PseudoTerminal.INPUT_ROW_SELECTOR + '>.pseudo-term-accepting-input-indicator'
    static ACCEPTING_INPUT_ACTIVE_CLS = 'accepting-input'

    /**
     * @private
     * @readonly
     * @type {HTMLElement}
     */
    _root

    /**
     * @private
     * @readonly
     * @type {HTMLElement}
     */
    _header

    /**
     * @private
     * @readonly
     * @type {HTMLElement}
     */
    _viewport

    /**
     * @private
     * @readonly
     * @type {HTMLElement}
     */
    _displaySection

    /**
     * @private
     * @readonly
     * @type {HTMLElement}
     */
    _inputRow

    /**
     * @private
     * @readonly
     * @type {HTMLTextAreaElement}
     */
    _input

    /**
     * @private
     * @readonly
     * @type {HTMLElement}
     */
    _acceptingInputIndicator

    /**
     * @private
     */
    _isAcceptingInput = false

    /**
     * @private
     */
    _shouldEchoInput = true

    /**
     * @private
     * @type {undefined | (input: string) => void}
     */
    _pendingResolver = undefined

    /**
     * @param {HTMLElement} container 
     */
    constructor(container) {
        // initialize references
        this._root = container.querySelector(PseudoTerminal.ROOT_SELECTOR)
        this._header = container.querySelector(PseudoTerminal.HEADER_SELECTOR)
        this._viewport = container.querySelector(PseudoTerminal.VIEWPORT_SELECTOR)
        this._displaySection = container.querySelector(PseudoTerminal.DISPLAY_SELECTOR)
        this._inputRow = container.querySelector(PseudoTerminal.INPUT_ROW_SELECTOR)
        this._input = container.querySelector(PseudoTerminal.INPUT_SELECTOR)
        this._acceptingInputIndicator = container.querySelector(PseudoTerminal.ACCEPTING_INPUT_SELECTOR)

        this._input.disabled = !this._isAcceptingInput

        // initialize event handlers
        this._viewport.addEventListener('click', evt => {
            if (!this._isAcceptingInput) { return }

            this._input.focus()
        })

        this._input.addEventListener('keydown', evt => {
            if (evt.key === 'Enter' && !evt.shiftKey) {
                evt.preventDefault()
            }
        })

        this._input.addEventListener('input', () => {
            this._adjustInputHeight()
        })

        this._input.addEventListener('keyup', evt => {
            const inputKey = evt.key
            if (inputKey !== 'Enter' || evt.shiftKey) {
                return
            }

            const inputValue = this._input.value

            if (this._shouldEchoInput) { this.writeMessageLine('@echo: ' + inputValue) }

            this._disableInput()
            this._pendingResolver?.(inputValue)
            this._pendingResolver = undefined
        })

        this._showWelcomeMessage()
    }

    clearDisplay() {
        this._displaySection.replaceChildren()
    }

    /**
     * 
     * @param {string} message 
     */
    writeMessageLine(message) {
        this.writeMessage(message + '\n')
    }

    /**
     * 
     * @param {string} message 
     */
    writeMessage(message) {
        this._displayTextNode.textContent += message
        setTimeout(() => {
            this._displaySection.scrollTop = this._displaySection.scrollHeight
        }, 100)
    }

    /**
     * @param {...(HTMLElement|string)} o 
     */
    appendToDisplay(...o) {
        this._displaySection.append(...o)
    }

    /**
     * @returns {Promise<string>}
     */
    async getInput(shouldEchoInput = true) {
        this._shouldEchoInput = shouldEchoInput
        this._acceptInput()
        const res = await new Promise(resolve => this._pendingResolver = resolve)
        console.log('Got input: ', res)
        return res
    }

    /**
     * @private
     */
    get _displayTextNode() {
        const childNodeCount = this._displaySection.childNodes.length
        if (childNodeCount > 0) {
            const lastChild = this._displaySection.childNodes[childNodeCount - 1]
            if (lastChild.nodeType === Node.TEXT_NODE) { return lastChild }
        }

        this._displaySection.append('')
        return this._displaySection.childNodes[childNodeCount]
    }

    /**
    * @private
    */
    _acceptInput() {
        this._inputRow.classList.toggle(PseudoTerminal.ACCEPTING_INPUT_ACTIVE_CLS, true)
        this._input.value = ''
        this._input.disabled = false
        this._isAcceptingInput = true
        this._adjustInputHeight()
        this._input.focus()
        console.log('Input enabled')
    }

    /**
     * @private
     */
    _disableInput() {
        this._inputRow.classList.toggle(PseudoTerminal.ACCEPTING_INPUT_ACTIVE_CLS, false)
        this._input.value = ''
        this._input.disabled = true
        this._isAcceptingInput = false
        this._adjustInputHeight()
        console.log('Input disabled')
    }

    /**
     * @private
     */
    _adjustInputHeight() {
        this._input.style.height = 'auto';
        this._input.style.height = this._input.scrollHeight + 'px';
    }

    /**
     * @private
     */
    _showWelcomeMessage() {
        this._displayTextNode.textContent = 'Welcome to JS Pseudo Terminal\n'
    }
}
