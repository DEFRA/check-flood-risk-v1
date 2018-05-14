// Map component
var Autocomplete = (function() {

    //
    // Private properties
    //

    var _options

    //
    // Public methods
    //
    
    var init = function (options) {

        //
        // Options
        //

        var defaults = {
            elementInput: '#address',
            maxListLength: 6
        }
        _options = Object.assign({}, defaults, options)

        //
        // Map to DOM elements
        //

        var elementInput = document.querySelector(_options.elementInput)
        
        //
        // Add options list to DOM
        //
        
        var elementList = document.createElement('ul')
        elementList.classList.add('autocomplete-menu-list')
        elementList.setAttribute('hidden', true)
        elementList.style.display = 'none'
        elementInput.parentNode.insertBefore(elementList, elementInput.nextSibling)

        elementInput.addEventListener('keyup', function(e) {
            var xhr = new XMLHttpRequest()
            var data = { 'address' : elementInput.value }
            xhr.open('POST', '/get-address-results')
            xhr.onload = function(data) {
                var result = this.responseText
                if (elementInput.value.length && result.length) {
                    elementList.removeAttribute('hidden')
                    elementList.style.display = 'block'
                    elementList.innerHTML = result
                } else {
                    elementList.setAttribute('hidden', true)
                    elementList.style.display = 'none'
                    elementList.innerHTML = ''
                }
                console.log(result.length)
            }
            xhr.setRequestHeader('Content-Type', 'application/json')
            xhr.send(JSON.stringify(data))
        })
        
    }

    return {
        init: init
    }

})()