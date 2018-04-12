// Map component
var Map = (function() {

    //
    // Private properties
    //

    var sourceFloodZones
    var sourceTargetAreas
    var sourceRiverLevels
    var sourceLocator
    var sourceShape
    
    var layerTile
    var layerFloodZones
    var layerTargetAreas
    var layerRiverLevels
    var layerLocator
    var layerShape

    var elementLabel
    var elementMap
    var elementMapContainer
    var elementMapContainerInner
    var key

    //
    // Private methods
    //

    // Style features
    var styleFeatures = function(feature, resolution) {

        // Defaults
        var strokeColour = 'transparent'
        var fillColour = 'transparent'
        var strokeWidth = 0
        var zIndex = 1
        var source = '' // Icon image source
        var image = null

        //
        // Flood zones
        //

        if (feature.get('type') == 'floodZone') {

            //Flood zone 1
            if (feature.get('zone') == 3) {
                fillColour = '#464D95'
                zIndex = 3
            }

            // Flood zone 2
            else if (feature.get('zone') == 2) {
                fillColour = '#ABD6FF'
                zIndex = 2
            }
            
        }

        //
        // Target areas
        //

        else if (feature.get('type') == 'targetArea') {

            var targetArea = options.targetAreaStates.find(x => x.id == feature.getId())

            if (isObject(targetArea)) {

                if (resolution <= options.minIconResolution) {

                    // Warning or severe warning colours
                    if (targetArea.state == 1 || targetArea.state == 2) {
                        strokeColour = '#e3000f'
                        strokeWidth = 2
                        fillColour = '#e3000f'
                        zIndex = 3
                    }

                    // Alert area colours
                    else if (targetArea.state == 3) {
                        strokeColour = '#f18700'
                        strokeWidth = 2
                        fillColour = '#f18700'
                        zIndex = 2
                    }

                    // Warning removed colours
                    else if (targetArea.state == 4) {
                        strokeColour = '#6f777b'
                        strokeWidth = 2
                        fillColour = '#6f777b'
                        zIndex = 1
                    }

                } else {

                    // Warning or severe warning colours
                    if (targetArea.state == 1 || targetArea.state == 2) {
                        zIndex = 3
                        source = '/public/icon-flood-warning-small-2x.png'
                    }

                    // Alert area colours
                    else if (targetArea.state == 3) {
                        zIndex = 2
                        source = '/public/icon-flood-alert-small-2x.png'
                    }

                    // Warning removed colours
                    else if (targetArea.state == 4) {
                        zIndex = 1;
                        source = ''
                    }

                    // Define icon 
                    image = new ol.style.Icon({
                        src: source,
                        size: [68, 68],
                        anchor: [0.5, 1],
                        scale: 0.5
                    })

                }

            }

        }

        //
        // River levels
        //

        else if (feature.get('type') == 'riverLevel') {

            var riverLevel = options.riverLevelStates.find(x => x.id == feature.getId())
            
            source = '/public/icon-locator-green-2x.png'

            if (isObject(riverLevel)) {

                if (riverLevel.state == 'above') {
                    source = '/public/icon-locator-red-2x.png'
                }

            }

            // Define icon
            image = new ol.style.Icon({
                src: source,
                size: [52, 71],
                anchor: [0.5, 1],
                scale: 0.5
            })
            
        }

        // Generate style
        var style = new ol.style.Style({
            fill: new ol.style.Fill({ color: fillColour }),			
            stroke: new ol.style.Stroke({ color: strokeColour, width: strokeWidth, miterLimit: 2, lineJoin: 'round' }),
            image: image,
            zIndex: zIndex 
        })

        return style

    }

    // Style interactions
    var styleInteractiveFeatures = function(feature, resolution) {
                
        var featureType = feature.getGeometry().getType()
        
        // Complete polygon drawing style
        var styleDrawComplete = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.5)'
            }),
            stroke: new ol.style.Stroke({
                color: '#B10E1E',
                width: 3
            }),
            image: new ol.style.Icon({
                opacity: 1,
                size : [32,32],
                scale: 0.5,
                src: '/public/map-draw-cursor-2x.png'
            })
        })
        // Complete polygon geometry style
        var styleDrawCompleteGeometry = new ol.style.Style({
            image: new ol.style.Icon({
                opacity: 1,
                size : [32,32],
                scale: 0.5,
                src: '/public/map-draw-cursor-2x.png'
            }),
            // Return the coordinates of the first ring of the polygon
            geometry: function(feature) {
                if (feature.getGeometry().getType() == 'Polygon'){
                    var coordinates = feature.getGeometry().getCoordinates()[0]
                    return new ol.geom.MultiPoint(coordinates)
                } else {
                    return null
                }
            }
        })
        // locator style
        var styleLocator = new ol.style.Style({
            image: new ol.style.Icon({
                src: '/public/icon-locator-blue-2x.png',
                size: [53, 71],
                anchor: [0.5, 1],
                scale: 0.5
            })
        })

        // Return appropriate style
        if (featureType == 'Polygon') {
            return [styleDrawComplete, styleDrawCompleteGeometry]
        } else if (featureType == 'Point') {
            return [styleLocator]
        }

    }
    
    // Add feature locator
    var addFeatureLocator = function (point, copy) {
        var featureLocator = new ol.Feature()
        featureLocator.setGeometry(point)
        layerLocator.getSource().addFeature(featureLocator)
        layerLocator.setVisible(true)
        elementLabel.innerHTML = copy
        label.setPosition(point)
        map.addOverlay(label)
        elementMap.classList.add('has-overlay')
        /*
        height = document.getElementsByClassName('ol-map-label')[0].offsetHeight
        console.log(window.getComputedStyle(document.getElementsByClassName('ol-overlay-container')[0]).display)
        */
    }

    // Function to get query string parameter
    var getParameterByName = function (name) {
        var v = window.location.search.match(new RegExp('(?:[\?\&]'+name+'=)([^&]+)'))
        return v ? v[1] : null
    }

    // Function to add or update a querystring parameter
    var addOrUpdateParameter = function (uri, paramKey, paramVal) {
        var re = new RegExp("([?&])" + paramKey + "=[^&#]*", "i");
        if (re.test(uri)) {
        uri = uri.replace(re, '$1' + paramKey + "=" + paramVal);
        } else {
        var separator = /\?/.test(uri) ? "&" : "?";
        uri = uri + separator + paramKey + "=" + paramVal;
        }
        return uri;
    }

    // Function applies greyscale to every pixel in canvas
    var greyscale = function (context) {
        var canvas = context.canvas
        var width = canvas.width
        var height = canvas.height
        var imageData = context.getImageData(0, 0, width, height)
        var data = imageData.data
        for (i=0; i<data.length; i += 4) {
            var r = data[i]
            var g = data[i + 1]
            var b = data[i + 2]
            // CIE luminance for the RGB
            var v = 0.2126 * r + 0.7152 * g + 0.0722 * b
            // Show white color instead of black color while loading new tiles:
            if(v === 0.0)
            v = 255.0
            data[i+0] = v// Red
            data[i+1] = v // Green
            data[i+2] = v // Blue
            data[i+3] = 255 // Alpha
        }
        context.putImageData(imageData,0,0)
    }

    // Test for object
    var isObject = function (obj) {
        return obj === Object(obj);
    }

    //
    // Public methods
    //
    
    var init = function (options) {

        // Define options
        var defaults = {
            lonLat: [0,0],
            zoom: 12,
            floodZonesJSON: '',
            targetAreasJSON: '',
            riverLevelsJSON: '',
            targetAreaStates: [],
            riverLevelStates: [],
            minIconResolution: 300,
            hasLocator: false,
            hasDrawing: false,
            hasUndoRedo: false,
            hasZoomReset: false
        }
        options = Object.assign({}, defaults, options)

        //
        // Map dom elements
        //

        elementMap = document.getElementsByClassName('map')[0]
        elementMapContainer = document.getElementById('map').firstElementChild
        elementMapContainerInner = elementMapContainer.firstElementChild
        key = document.querySelector('.map-key')

        //
        // Styles
        //

        // Start polygon drawing style
        var styleDraw = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.5)'
            }),
            stroke: new ol.style.Stroke({
                color: '#005EA5',
                width: 3
            }),
            image: new ol.style.Icon({
                opacity: 1,
                size: [32,32],
                scale: 0.5,
                src: '/public/map-draw-cursor-2x.png'
            })
        })

        // Modify polygon drawing style
        var styleDrawModify = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.5)'
            }),
            stroke: new ol.style.Stroke({
                color: '#FFBF47',
                width: 3
            }),
            image: new ol.style.Icon({
                opacity: 1,
                size : [32,32],
                scale: 0.5,
                src: '/public/map-draw-cursor-2x.png'
            })
        })

        // Modify polygon drawing style
        var stylePointModify = new ol.style.Style({
            image: new ol.style.Icon({
                src: '/public/icon-locator-blue-2x.png',
                size: [53, 71],
                anchor: [0.5, 1],
                scale: 0.5
            })
        })

        //
        // Define sources
        //

        // Flood zones source
        sourceFloodZones = new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url: options.floodZonesJSON,
            projection: 'EPSG:3857'
        })

        // Target areas source
        sourceTargetAreas = new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url: options.targetAreasJSON,
            projection: 'EPSG:3857'
        })

        // River levels source
        sourceRiverLevels = new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url: options.riverLevelsJSON,
            projection: 'EPSG:3857'
        })

        // Locator source
        sourceLocator = new ol.source.Vector()

        // Shape source
        sourceShape = new ol.source.Vector()

        //
        // Define layers
        //

        // Background map layer
        layerTile = new ol.layer.Tile({
            source: new ol.source.OSM()
        })

        // Flood zones layer
        layerFloodZones = new ol.layer.Vector({
            renderMode: 'image',
            source: sourceFloodZones,
            style: styleFeatures
        })

        // Target areas layer
        layerTargetAreas = new ol.layer.Vector({
            renderMode: 'hybrid',
            source: sourceTargetAreas,
            style: styleFeatures
        })

        // River levels layer
        layerRiverLevels = new ol.layer.Vector({
            source: sourceRiverLevels,
            style: styleFeatures
        })

        // Locator layer
        layerLocator = new ol.layer.Vector({
            source: sourceLocator,
            style: styleInteractiveFeatures,
            visible: true
        })

        // Shape layer
        layerShape = new ol.layer.Vector({
            source: sourceShape,
            style: styleInteractiveFeatures,
            visible: false
        })

        //
        // Define map control buttons
        //

        // Key toggle button
        if (key) {
            var keyToggleButton = document.querySelector('.map-control-key')
            keyToggleButton.addEventListener('click', function(e) {
                e.preventDefault()
                key.classList.toggle('map-key-open')
            })
        }

        // Zoom buttons
        var zoomElement = document.createElement('button')
        zoomElement.appendChild(document.createTextNode('Zoom'))
        zoomElement.className = 'ol-zoom'
        var zoom = new ol.control.Zoom({
            element: zoomElement
        })

        // Zoom reset button
        var zoomResetElement = document.createElement('button')
        zoomResetElement.appendChild(document.createTextNode('Zoom reset'))
        zoomResetElement.className = 'ol-zoom-reset'
        zoomResetElement.setAttribute('title','Reset location')
        var zoomReset = new ol.control.Control({
            element: zoomResetElement
        })

        // Fullscreen button
        var fullScreenElement = document.createElement('button')
        fullScreenElement.appendChild(document.createTextNode('Full screen'))
        fullScreenElement.className = 'ol-full-screen'
        fullScreenElement.addEventListener('click', function(e) {
            e.preventDefault()
            // Fullscreen view
            if (elementMapContainerInner.classList.contains('map-container-inner-fullscreen')) {
                elementMapContainerInner.classList.remove('map-container-inner-fullscreen')
                history.back()
            }
            // Default view
            else {
                elementMapContainerInner.classList.add('map-container-inner-fullscreen')
                state = {'view':'map'}
                url = addOrUpdateParameter(location.pathname + location.search, 'view', 'map')
                title = document.title
                history.pushState(state, title, url)
            }
            this.classList.toggle('ol-full-screen-open')
            map.updateSize()
        })
        var fullScreen = new ol.control.Control({ // Use fullscreen for HTML Fullscreen API
            element: fullScreenElement
        })

        // Draw shape button
        var drawShapeElement = document.createElement('button')
        drawShapeElement.innerHTML = '<span>Draw shape</span>'
        drawShapeElement.className = 'ol-draw-shape'
        drawShapeElement.setAttribute('title','Start drawing a new shape')
        drawShapeElement.addEventListener('click', function(e) {
            e.preventDefault()
            // Hide locator layer and show shape layer
            layerLocator.setVisible(false)
            layerShape.setVisible(true)
            // Set button disabled properties
            this.disabled = true
            deleteFeatureElement.disabled = true
            placeLocatorElement.disabled = false
            // Add shape interactions
            map.addInteraction(snap)
            map.addInteraction(modifyPolygon)
            // Hide locator overlay if exists
            if(layerLocator.getSource().getFeatures().length){
                document.getElementsByClassName('ol-overlay-container')[0].style.visibility = 'hidden'
            }
            elementMap.classList.remove('has-overlay')
            // Enable delete if shape has already been drawn (feature and geometry exist)
            if(layerShape.getSource().getFeatures().length){
                deleteFeatureElement.disabled = false
            }
            // Add shape feature and interactions if shape has not yet been drawn
            else {
                layerShape.getSource().addFeature(new ol.Feature())
                map.addInteraction(draw)
            }
        })
        var drawShape = new ol.control.Control({
            element: drawShapeElement
        })

        // Place locator button
        var placeLocatorElement = document.createElement('button')
        placeLocatorElement.innerHTML = '<span>Place marker</span>'
        placeLocatorElement.className = 'ol-place-locator'
        placeLocatorElement.setAttribute('title','Place a marker to identify features')
        placeLocatorElement.disabled = true
        placeLocatorElement.addEventListener('click', function(e) {
            e.preventDefault()
            // End drawing if started
            if(drawingStarted){
                draw.finishDrawing()
            }
            // Delete existing polygon feature if it has no geometry
            if(layerShape.getSource().getFeatures().length) {
                if(!layerShape.getSource().getFeatures()[0].getGeometry()) {
                    layerShape.getSource().clear()
                }
            }
            // Reset draw properties
            drawingStarted = false
            drawingFinished = false
            // Remove shape interactions
            map.removeInteraction(draw)
            map.removeInteraction(snap)
            map.removeInteraction(modifyPolygon)
            // Hide shape layer and show locator layer
            layerShape.setVisible(false)
            layerLocator.setVisible(true)
            // Set button disabled properties
            this.disabled = true
            drawShapeElement.disabled = false
            deleteFeatureElement.disabled = true
            // Show locator overlay if exists
            if(layerLocator.getSource().getFeatures().length){
                document.getElementsByClassName('ol-overlay-container')[0].style.visibility = 'visible'
                elementMap.classList.add('has-overlay')
            }
            // Enable delete if feature on this layer exists and show overlay
            if(layerLocator.getSource().getFeatures().length){
                deleteFeatureElement.disabled = false
            }
        })
        var placeLocator = new ol.control.Control({
            element: placeLocatorElement
        })

        // Draw undo
        var drawUndoElement = document.createElement('button')
        drawUndoElement.innerHTML = 'Undo'
        drawUndoElement.className = 'ol-draw-undo'
        drawUndoElement.setAttribute('title','Undo the last change')
        drawUndoElement.disabled = true
        drawUndoElement.addEventListener('click', function(e) {
            e.preventDefault()
        })
        var drawUndo = new ol.control.Control({
            element: drawUndoElement
        })

        // Draw redo
        var drawRedoElement = document.createElement('button')
        drawRedoElement.innerHTML = 'Redo'
        drawRedoElement.className = 'ol-draw-redo'
        drawRedoElement.setAttribute('title','Redo the last change')
        drawRedoElement.disabled = true
        drawRedoElement.addEventListener('click', function(e) {
            e.preventDefault()
        })
        var drawRedo = new ol.control.Control({
            element: drawRedoElement
        })

        // Delete button
        var deleteFeatureElement = document.createElement('button')
        deleteFeatureElement.innerHTML = '<span>Delete</span>'
        deleteFeatureElement.className = 'ol-draw-delete'
        deleteFeatureElement.setAttribute('title','Delete the shape or marker')
        deleteFeatureElement.addEventListener('click', function(e) {
            e.preventDefault()
            this.disabled = true
            // If shape layer
            if(layerShape.getVisible()) {
                layerShape.getSource().clear()
                // End drawing if started
                if(drawingStarted){
                    draw.finishDrawing()
                }
                drawingStarted = false
                drawingFinished = false
                // Add shape feature and interactions
                layerShape.getSource().addFeature(new ol.Feature())
                map.addInteraction(draw)
                map.addInteraction(snap)
                map.addInteraction(modifyPolygon)
            }
            // If locator layer
            else {
                layerLocator.getSource().clear()
                map.removeOverlay(label)
                elementMap.classList.remove('has-overlay')
            }
        })
        var deleteFeature = new ol.control.Control({
            element: deleteFeatureElement
        })

        // Label
        elementLabel = document.createElement('div')
        elementLabel.classList.add('ol-map-label')
        elementLabel.style.visibility = 'false'
        label = new ol.Overlay({
            element: elementLabel,
            positioning: 'bottom-left'
        })

        //
        // Configure interactions
        //

        var interactions = ol.interaction.defaults({
            altShiftDragRotate:false, 
            pinchRotate:false,
            doubleClickZoom :false
        })
        var modifyPolygon = new ol.interaction.Modify({
            source: sourceShape,
            style: styleDrawModify
        })
        var draw = new ol.interaction.Draw({
            source: sourceShape,
            type: 'Polygon',
            style: styleDraw,
            condition: function(e) {
                // Hack to tackle finishDrawing with zero coordinates bug
                if (e.type == 'pointerdown') {
                    drawingStarted = true
                } else {
                    drawingStarted = false
                }
                return true
            }
        })
        var snap = new ol.interaction.Snap({
            source: sourceShape
        })

        // Define the map view object
        var view = new ol.View({
            center: ol.proj.fromLonLat(options.lonLat),
            enableRotation: false,
            zoom: options.zoom
        })

        // Add controls
        var customControls = [fullScreen]
        if (options.hasZoomReset) {
            customControls.push(zoomReset)
        }
        customControls.push(zoom)
        if (options.hasDrawing && options.hasUndoRedo) {
            elementMap.classList.add('has-undoredo')
            customControls.push(
                deleteFeature,
                drawRedo,
                drawUndo,
                drawShape,
                placeLocator
            )
        }
        else if (options.hasDrawing) {
            customControls.push(
                deleteFeature,
                drawShape,
                placeLocator
            )
        }
        var controls = ol.control.defaults({
            zoom: false,
            rotate: false,
            attribution: false
        }).extend(customControls)

        // Add layers
        var layers = [layerTile]
        if (options.floodZonesJSON != '') {
            layers.push(layerFloodZones)
        }
        if (options.targetAreasJSON != '') {
            layers.push(layerTargetAreas)
        }
        if (options.riverLevelsJSON != '') {
            layers.push(layerRiverLevels)
        }
        if (options.hasDrawing) {
            layers.push(layerShape)
        }
        if (options.hasDrawing || options.hasLocator) {
            layers.push(layerLocator)
        }
        
        // Add fullscreen class
        if (getParameterByName('view') == 'map') {
            elementMapContainerInner.classList.add('map-container-inner-fullscreen')
        }

        // Start drawing boolean used to address finishDrawing bug
        var drawingStarted = false
        var drawingFinished = false

        // Render map
        map = new ol.Map({
            target: 'map-container-inner',
            interactions: interactions,
            controls: controls,
            layers: layers,
            view: view
        })
        
        // Add initial locator
        if (options.hasLocator || options.hasDrawing) {
            var coordinate = ol.proj.transform(options.lonLat, 'EPSG:4326', 'EPSG:3857')
            var point = new ol.geom.Point(coordinate)
            addFeatureLocator(point, '<p><strong class="bold-small">Mytholmroyd</strong></p>')
        }

        //
        // Map events
        //

        // Close key or place locator if map is clicked
        map.on('click', function(e) {
            // Close key
            if (key.classList.contains('map-key-open')) {
                key.classList.remove('map-key-open')   
            } 
            // If key is closed
            else {
                // Place locator
                if(options.hasLocator || options.hasDrawing) {
                    if (layerLocator.getVisible()) {
                        // locator object
                        var point = new ol.geom.Point(e.coordinate)
                        addFeatureLocator(point, '<p><strong class="bold-small">Flood zone 1</strong><br/>(<abbr title="Easting and northing">EN</abbr> 123456/123456)</p>')
                    }
                    // Enable delete
                    deleteFeatureElement.disabled = false
                }
            }
        })

        // Set start drawing flag
        draw.on('drawShape', function (e) {
            drawingStarted = true
        })

        // Deactivate draw interaction after first polygon is finished
        draw.on('drawend', function (e) {
            drawingStarted = false
            coordinates = e.feature.getGeometry().getCoordinates()[0]
            // Polygon is too small reset buttons and interaction feature type
            if (coordinates.length < 4) {
                drawShapeElement.disabled = false
                e.feature.setGeometry(null)
            } 
            // Polygon is ok
            else {
                deleteFeatureElement.disabled = false
                drawShapeElement.disabled = true
                drawingFinished = true
                feature = e.feature
                map.removeInteraction(this)
            }
        })

        // Keyboard controls
        document.addEventListener('keydown', function(e) {

            // Finish drawing polygon escape key pressed
            if (e.keyCode === 27) {

                // Escape drawing a polygon if it is not already finished
                if (layerShape.getVisible() && !drawingFinished) {
                    // Clear an reenable draw button 
                    if (!drawingStarted) {
                        map.removeInteraction(draw)
                        map.removeInteraction(snap)
                        map.removeInteraction(modifyPolygon)
                        drawShapeElement.disabled = false
                    } 
                    // finishDrawing can now be called safely
                    else {
                        draw.finishDrawing()
                    }
                }

            }

            // Constrain tab key to 'key' when its open
            else if (e.keyCode === 9) {
                var context = null
                if (elementMapContainerInner.classList.contains('map-container-inner-fullscreen')) {
                    context = elementMapContainerInner
                }
                if (key.classList.contains('map-key-open')) {
                    context = key
                }
                // If dialog context is open
                if (context) {
                    var focusableElements = context.querySelectorAll('button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
                    var firstFocusableElement = focusableElements[0]
                    var lastFocusableElement = focusableElements[focusableElements.length - 1]
                    // Shift tab (backwards)
                    if (e.shiftKey) {
                        if (document.activeElement === firstFocusableElement) {
                            e.preventDefault()
                            lastFocusableElement.focus()
                        }
                    }
                    // Tab (forwards) 
                    else {
                        if (document.activeElement === lastFocusableElement) {
                            e.preventDefault()
                            firstFocusableElement.focus()
                        }
                    }
                }
            }

        })

        // If map is fullscreen set initial focus to first focusable element
        window.onload = function() {
            if (getParameterByName('view') == 'map') {
                focusElement = elementMapContainerInner.querySelectorAll('button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')[0]
                focusElement.focus()
            }
        }

        // Update layer opacity setting for different map resolutions
        map.on('moveend', function(){
            resolution = map.getView().getResolution()
            if (resolution > 20) { 
                layerOpacity = 1 
            }
            else if (resolution > 10) { 
                layerOpacity = 0.8 
            }
            else if (resolution > 5) { 
                layerOpacity = 0.65 
            }
            else {
                layerOpacity = 0.5 
            } 
            layerFloodZones.setOpacity(layerOpacity)
            layerTargetAreas.setOpacity(layerOpacity)
        })

        // Toggle fullscreen view on browser history change
        window.onpopstate = function(e) {    
            if (e && e.state) {
                elementMapContainerInner.classList.add('map-container-inner-fullscreen')
                fullScreenElement.classList.add('ol-full-screen-open')
            }
            else {
                elementMapContainerInner.classList.remove('map-container-inner-fullscreen')
                fullScreenElement.classList.remove('ol-full-screen-open')
            }
            map.updateSize()
        }

    }

    return {
        init: init
    }

})()