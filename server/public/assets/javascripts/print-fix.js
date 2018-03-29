// Detect window print
(function() {
    var beforePrint = function() {
        console.log('Before printing.')
    }
    var afterPrint = function() {
        console.log('After printing')
    }
    if (window.matchMedia) {
        var mediaQueryList = window.matchMedia('print')
        mediaQueryList.addListener(function(mql) {
            if (mql.matches) {
                beforePrint()
            } else {
                afterPrint()
            }
        })
    }
    window.onbeforeprint = beforePrint
    window.onafterprint = afterPrint
}())