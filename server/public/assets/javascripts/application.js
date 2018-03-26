// Prototype javascript

var application = {};
(function(){

  var navBack = document.getElementsByClassName('nav-back')
  if (navBack.length) {
    navBack[0].style.display = 'block'
    navBack[0].removeAttribute('hidden')
    navBack[0].getElementsByTagName('a')[0].addEventListener('click', function(e) {
      e.preventDefault()
      window.history.back()
    })
  }

}).call(application);
