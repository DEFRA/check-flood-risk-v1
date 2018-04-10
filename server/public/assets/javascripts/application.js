// Prototype javascript

var application = {};
(function(){

  // Navigation backlinks
  var navBack = document.getElementsByClassName('nav-back')
  if (navBack.length) {
    navBack[0].style.display = 'block'
    navBack[0].removeAttribute('hidden')
    navBack[0].getElementsByTagName('a')[0].addEventListener('click', function(e) {
      e.preventDefault()
      window.history.back()
    })
  }

  // Visualisations
  var visualisation = document.getElementsByClassName('visualisation')
  for (i=0; i<visualisation.length; i++){
    var device = visualisation[i].getElementsByClassName('visualisation-device')
    var content = visualisation[i].getElementsByClassName('visualisation-content')
    var alternative = visualisation[i].getElementsByClassName('visualisation-alternative')
    // If javascript is enabled hide the device alert.
    // The presence of aria-hidden on the element will ensure it is not read by assistive technology
    for (j=0; j<device.length; j++){
      device[j].setAttribute('hidden', true)
      device[j].style.display = 'none'
    }
    // If javascript is enabled make content visible to all but assitive technology
    for (j=0; j<content.length; j++){
      content[j].setAttribute('aria-hidden', true)
      content[j].removeAttribute('hidden')
      content[j].removeAttribute('style')
    }
    // If javascript is enabled visually hide this content only
    // The content must be available to assitive technology 
    for (j=0; j<alternative.length; j++){
      alternative[j].classList.add('visuallyhidden')
    }
  }
}).call(application)