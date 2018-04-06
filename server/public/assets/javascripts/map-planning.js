var renderMap = function(options) {

    //
    // Define options
    //

    var defaults = {
        lonLat: [0,0],
        zoom: 12,
        dataJSON: '',
        targetAreaStates: [],
        minIconResolution: 300,
        hasKey: false,
        hasLocator: false,
        hasDrawing: false,
        hasUndoRedo: false,
        hasZoomReset: false
    }
    options = Object.assign({}, defaults, options)

    //
    // DOM elements
    //

    var elementMap = document.getElementsByClassName('map')[0]
    var elementMapContainer = document.getElementById('map').firstElementChild

    //
    // Define styles
    //

    // Style function for flood zones

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

                    // Configure icon 
                    image = new ol.style.Icon({
                        src: source,
                        size: [68, 68],
                        anchor: [0.5, 1],
                        scale: 0.5
                    })

                }

            }

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

    // Style function for interactions
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

    // Styles for interacting

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

    // Features source
    var sourceFeatures = new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        url: options.dataJSON,
        projection: 'EPSG:3857'
    })

    // Locator source
    var sourceLocator = new ol.source.Vector()

    // Shape source
    var sourceShape = new ol.source.Vector()

    //
    // Define layers
    //

    // Background map layer
    var tile = new ol.layer.Tile({
        source: new ol.source.OSM()
    })

    // Features layer
    var layerFeatures = new ol.layer.Vector({
        renderMode: 'image',
        source: sourceFeatures,
        // Use custom style function to colour individual features accordingley
        style: styleFeatures
    })

    // Locator layer
    var layerLocator = new ol.layer.Vector({
        source: sourceLocator,
        style: styleInteractiveFeatures,
        visible: true
    })

    // Shape layer
    var layerShape = new ol.layer.Vector({
        source: sourceShape,
        style: styleInteractiveFeatures,
        visible: false
    })

    //
    // Define any intial interactive features
    //

    var featureLocator = new ol.Feature()

    //
    // Define the map view object
    //

    var view = new ol.View({
        center: ol.proj.fromLonLat(options.lonLat),
        enableRotation: false,
        zoom: options.zoom
    })

    //
    // Define the map control buttons
    //

    // Key toggle button
    var key = document.querySelector('.map-key')
    var keyToggleButton = document.querySelector('.map-control-key')
    keyToggleButton.addEventListener('click', function(e) {
        e.preventDefault()
        key.classList.toggle('map-key-open')
    })

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
        elementMapContainer.classList.toggle('map-container-fullscreen')
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
        // Delete empty shape feature
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
        }
        elementMap.classList.add('has-overlay')
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
    deleteFeatureElement.disabled = true
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
    var labelElement = document.createElement('div')
    labelElement.classList.add('ol-map-label')
    labelElement.innerHTML = '<p><strong class="bold-small">Mytholmroyd</strong></p>'
    labelElement.style.visibility = 'false'
    label = new ol.Overlay({
        element: labelElement,
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

    //
    // Configure controls
    //

    var customControls = []
    if (options.hasDrawing && options.hasUndoRedo) {
        elementMap.classList.add('has-undoredo')
        customControls.push(
            placeLocator,
            drawShape,
            drawUndo,
            drawRedo,
            deleteFeature
        )
    }
    else if (options.hasDrawing) {
        customControls.push(
            placeLocator,
            drawShape,
            deleteFeature
        )
    }
    customControls.push(fullScreen)
    if (options.hasZoomReset) {
        customControls.push(zoomReset)
    }
    customControls.push(zoom)
    var controls = ol.control.defaults({
        zoom: false,
        rotate: false,
        attribution: false
    }).extend(customControls)

    //
    // Setup
    //

    // Start drawing boolean used to address finishDrawing bug
    var drawingStarted = false
    var drawingFinished = false

    // Render map
    map = new ol.Map({
        target: 'map-container-inner',
        interactions: interactions,
        controls: controls,
        layers: [tile, layerFeatures, layerShape, layerLocator],
        view: view
    })
    
    //
    // Add initial locator
    //

    if (options.hasLocator) {
        geometryPoint = ol.proj.transform(options.lonLat, 'EPSG:4326', 'EPSG:3857')
        featureLocator.setGeometry(new ol.geom.Point(geometryPoint))
        layerLocator.getSource().addFeature(featureLocator)
        layerLocator.setVisible(true)
        label.setPosition(geometryPoint)
        map.addOverlay(label)
        elementMap.classList.add('has-overlay')
    }

    //
    // Configure map events
    //

    // Close key or place locator if map is clicked
    map.on('click', function(e) {
        var keyOpen = document.getElementsByClassName('map-key-open')
        // Close key
        if (keyOpen.length) {
            keyOpen[0].classList.remove('map-key-open')   
        } 
        // If key is closed
        else {
            // Place locator
            if(options.hasLocator) {
                if (layerLocator.getVisible()) {
                    // locator object
                    geometryPoint = new ol.geom.Point(e.coordinate)
                    featureLocator.setGeometry(geometryPoint)
                    labelElement.innerHTML = '<p><strong class="bold-small">Flood zone 1</strong><br/>(<abbr title="Easting and northing">EN</abbr> 123456/123456)</p>'
                    layerLocator.getSource().clear()
                    layerLocator.getSource().addFeature(featureLocator)
                    layerLocator.setVisible(true)
                    label.setPosition(e.coordinate)
                    map.addOverlay(label)
                    elementMap.classList.add('has-overlay')
                }
                // Enable delete
                deleteFeatureElement.disabled = false
            }
        }
    })

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

    // Finish drawing on escape key
    document.addEventListener('keyup', function() {

        // Escape key pressed
        if (event.keyCode === 27) {

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

    })

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
        layerFeatures.setOpacity(layerOpacity)
    })

}

// Function to get query string parameter
function getParameterByName(name) {
    var v = window.location.search.match(new RegExp('(?:[\?\&]'+name+'=)([^&]+)'))
    return v ? v[1] : null
}

// Function applies greyscale to every pixel in canvas
function greyscale(context) {
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
function isObject(obj) {
    return obj === Object(obj);
}