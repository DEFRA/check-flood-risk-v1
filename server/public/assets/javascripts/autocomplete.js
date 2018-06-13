// Map component
var Autocomplete = (function() {

    //
    // Private properties
    //

    var _options
    var elementInput, elementList

    //
    // Private methods
    //

    var addInteractions = function () {
        //console.log(elementList.children.length)

        // Keyboard

        // Mouse

    }

    //
    // Public methods
    //
    
    var init = function (options) {

        //
        // Options
        //

        var defaults = {
            elementInput: '#address',
            maxListLength: 10
        }
        _options = Object.assign({}, defaults, options)

        //
        // Map to DOM elements
        //

        elementInput = document.querySelector(_options.elementInput)
        
        //
        // Add options list to DOM
        //
        
        elementList = document.createElement('ul')
        elementList.classList.add('autocomplete-menu-list')
        elementList.setAttribute('hidden', true)
        elementList.style.display = 'none'
        elementInput.parentNode.insertBefore(elementList, elementInput.nextSibling)

        // Stop up/down keys moving caret
        elementInput.addEventListener('keydown', function(e) {
            if (e.keyCode == 38 || e.keyCode == 40) {
                e.preventDefault()
                this.selectionStart = this.selectionEnd = this.value.length
            }
        })

        // Main keyup handler
        elementInput.addEventListener('keyup', function(e) {
            // Up or down pressed
            if (e.keyCode == 38 || e.keyCode == 40) {
                e.preventDefault()
            }
            // Characters entered
            else {
                var xhr = new XMLHttpRequest()
                var data = { 'address' : elementInput.value }
                xhr.open('POST', '/get-address-results')
                xhr.onload = function(data) {
                    var result = this.responseText
                    if (elementInput.value.length && result != null) {
                        elementList.removeAttribute('hidden')
                        elementList.style.display = 'block'
                        elementList.innerHTML = result
                        addInteractions()
                    } else {
                        elementList.setAttribute('hidden', true)
                        elementList.style.display = 'none'
                        elementList.innerHTML = ''
                    }
                }
                xhr.setRequestHeader('Content-Type', 'application/json')
                xhr.send(JSON.stringify(data))
            }
        })

        // Options list mouse click handler
        document.addEventListener('click', function(e) {
            if (e.target && e.target.classList.contains('autocomplete-menu-option')) {
                elementInput.value = e.target.innerHTML
                elementList.setAttribute('hidden', true)
                elementList.style.display = 'none'
                elementList.innerHTML = ''
            }
        })

        // Options list mouse over handler
        document.addEventListener('mouseover', function(e) {
            if (e.target && e.target.classList.contains('autocomplete-menu-option')) {
                var elementOptions = e.target.parentNode.children
                for (var i = 0; i < elementOptions.length; i++) {
                    elementOptions[i].classList.remove('autocomplete-menu-option-focussed')
                    elementOptions[i].removeAttribute('aria-selected')
                }
                e.target.classList.add('autocomplete-menu-option-focussed')
                e.target.setAttribute('aria-selected', 'true')
                //e.target.focus()
            }
        })

        // Options list reset focus on mouse out
        document.addEventListener('mouseout', function(e) {
            if (e.target && e.target.classList.contains('autocomplete-menu-option')) {
                var elementOptions = e.target.parentNode.children
                for (var i = 0; i < elementOptions.length; i++) {
                    elementOptions[i].classList.remove('autocomplete-menu-option-focussed')
                    elementOptions[i].removeAttribute('aria-selected')
                }
                elementOptions[0].classList.add('autocomplete-menu-option-focussed')
                elementOptions[0].setAttribute('aria-selected', 'true')
            }
        })

        // Hide options list on click
        document.addEventListener('click', function(e) {
            var elementAutocompleteContainer = document.querySelector('.autocomplete-container')
            if (e.target !== elementAutocompleteContainer && !elementAutocompleteContainer.contains(e.target)) {
                elementList.setAttribute('hidden', true)
                elementList.style.display = 'none'
                elementList.innerHTML = ''
            }
        })
        
    }

    return {
        init: init
    }

})()