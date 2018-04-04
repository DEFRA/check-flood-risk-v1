var renderMap = function(options) {

    //
    // Define options
    //

    var defaults = {
        lonLat: [0,0],
        zoom: 15,
        dataJSON: '',
        targetAreaStates: [],
        minIconResolution: 300
    }
    options = Object.assign({}, defaults, options)

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
        var image = ''
        var source = '' // Icon image source

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

            if (targetArea) {

                if (resolution <= options.minIconResolution) {

                    // Warning or severe warning colours
                    if (targetArea.state == 1 || targetArea.state == 2) {
                        strokeColour = '#e3000f'
                        strokeWidth = 2
                        fillColour = '#e3000f'
                        zIndex = 3
                        source = '/public/icon-flood-warning-small-2x.png'
                    }

                    // Alert area colours
                    else if (targetArea.state == 3) {
                        strokeColour = '#f18700'
                        strokeWidth = 2
                        fillColour = '#f18700'
                        zIndex = 2
                        source = '/public/icon-flood-alert-small-2x.png'
                    }

                    // Warning removed colours
                    else if (targetArea.state == 4) {
                        strokeColour = '#6f777b'
                        strokeWidth = 2
                        fillColour = '#6f777b'
                        zIndex = 3
                        source = ''
                    }

                    // Generate style
                    var style = new ol.style.Style({
                        fill: new ol.style.Fill({ color: fillColour }),			
                        stroke: new ol.style.Stroke({ color: strokeColour, width: strokeWidth, miterLimit: 2, lineJoin: 'round' }),
                        zIndex: zIndex 
                    });

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
                        zIndex = 3;
                        source = ''
                    }

                    // Add image
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
        // Marker style
        var styleMarker = new ol.style.Style({
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
            return [styleMarker]
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

    // Flood zones source
    var sourceFeatures = new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        url: options.dataJSON,
        projection: 'EPSG:3857'
    })

    // Marker source
    var sourceMarker = new ol.source.Vector()

    // Shape source
    var sourceShape = new ol.source.Vector()

    //
    // Define layers
    //

    // Background map layer
    var tile = new ol.layer.Tile({
        source: new ol.source.OSM()
    })

    // Flood zones layer
    var layerFeatures = new ol.layer.Image({
        source: new ol.source.ImageVector({
            source: sourceFeatures,
            // Use custom style function to colour individual features accordingley
            style: styleFeatures
        }),
        opacity: 1
    })

    // Marker layer
    var layerMarker = new ol.layer.Vector({
        source: sourceMarker,
        style: styleInteractiveFeatures,
        visibility: false
    })
    layerMarker.setVisible(false)

    // Shape layer
    var layerShape = new ol.layer.Vector({
        source: sourceShape,
        style: styleInteractiveFeatures,
        visibility: false
    })
    layerShape.setVisible(false)

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
        mapContainer.classList.toggle('map-container-fullscreen')
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
        // Hide marker layer and show shape layer
        this.disabled = true
        placeMarkerElement.disabled = false
        layerMarker.setVisible(false)
        layerShape.setVisible(true)
        document.getElementsByClassName('map')[0].classList.remove('has-overlay')
        // Hide marker overlay if exists
        if(layerMarker.getSource().getFeatures().length){
            document.getElementsByClassName('ol-overlay-container')[0].style.visibility = 'hidden'
        }
        deleteFeatureElement.disabled = true
        // Enable delete if shape has already been drawn
        if(layerShape.getSource().getFeatures().length){
            deleteFeatureElement.disabled = false
        }
        // Add shape feature and interactions if shape has not yet been drawn
        else {
            layerShape.getSource().addFeature(new ol.Feature())
            map.addInteraction(draw)
            map.addInteraction(snap)
            map.addInteraction(modifyPolygon)
        }
    })
    var drawShape = new ol.control.Control({
        element: drawShapeElement
    })

    // Place marker button
    var placeMarkerElement = document.createElement('button')
    placeMarkerElement.innerHTML = '<span>Place marker</span>'
    placeMarkerElement.className = 'ol-place-marker'
    placeMarkerElement.setAttribute('title','Place a marker')
    placeMarkerElement.disabled = true
    placeMarkerElement.addEventListener('click', function(e) {
        e.preventDefault()
        // End drawing if started
        if(drawingStarted){
            draw.finishDrawing()
        }
        // Reset draw properties
        drawingStarted = false
        drawingFinished = false
        // Remove shape interactions
        map.removeInteraction(draw)
        map.removeInteraction(snap)
        map.removeInteraction(modifyPolygon)
        // Hide shape and show marker
        this.disabled = true
        drawShapeElement.disabled = false
        layerShape.setVisible(false)
        layerMarker.setVisible(true)
        if(layerMarker.getSource().getFeatures().length){
            document.getElementsByClassName('ol-overlay-container')[0].style.visibility = 'visible'
        }
        document.getElementsByClassName('map')[0].classList.add('has-overlay')
        deleteFeatureElement.disabled = true
        // Enable delete if feature on this layer exists and show overlay
        if(layerMarker.getSource().getFeatures().length){
            deleteFeatureElement.disabled = false
        }
    })
    var placeMarker = new ol.control.Control({
        element: placeMarkerElement
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
    deleteFeatureElement.innerHTML = '<span>Clear</span>'
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
        // If marker layer
        else {
            layerMarker.getSource().clear()
            map.removeOverlay(label)
            document.getElementsByClassName('map')[0].classList.remove('has-overlay')
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

    var controls = ol.control.defaults({
        zoom: false,
        rotate: false,
        attribution: false
    }).extend([
        placeMarker,
        drawShape,
        drawUndo,
        drawRedo,
        deleteFeature,
        fullScreen,
        zoomReset,
        zoom
    ])

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
        layers: [tile, layerFeatures, layerShape, layerMarker],
        view: view
    })
    
    //
    // Add initial locator
    //

    var featureMarker = new ol.Feature()
    featurePoint = ol.proj.transform(options.lonLat, 'EPSG:4326', 'EPSG:3857')
    featureMarker.setGeometry(new ol.geom.Point(featurePoint))
    layerMarker.getSource().addFeature(featureMarker)
    label.setPosition(featurePoint)
    map.addOverlay(label)
    layerMarker.setVisible(true)
    document.getElementsByClassName('map')[0].classList.add('has-overlay')

    //
    // Configure map events
    //

    // Close key or place marker if map is clicked
    map.on('click', function(e) {
        var keyOpen = document.getElementsByClassName('map-key-open')
        // Close key
        if (keyOpen.length) {
            keyOpen[0].classList.remove('map-key-open')   
        } 
        // If key is closed
        else {
            // Place marker
            if (layerMarker.getVisible()) {
                // Marker object
                geometryPoint = new ol.geom.Point(e.coordinate)
                featureMarker.setGeometry(geometryPoint)
                labelElement.innerHTML = '<p><strong class="bold-small">Flood zone 1</strong><br/>(<abbr title="Easting and northing">EN</abbr> 123456/123456)</p>'
                layerMarker.getSource().clear()
                layerMarker.getSource().addFeature(featureMarker)
                label.setPosition(e.coordinate)
                map.addOverlay(label)
                //document.getElementsByClassName('ol-overlay-container')[0].style.visibility = 'visible'
                document.getElementsByClassName('map')[0].classList.add('has-overlay')
            }
            // Enable delete
            deleteFeatureElement.disabled = false
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

        /*
        if (resolution < 5) { 
            layerOpacity = 0.6 
        }
        else if (resolution < 10) { 
            layerOpacity = 0.7 
        }
        else if (resolution < 20) { 
            layerOpacity = 0.85 
        } 
        else if (resolution < 30) {
            layerOpacity = 1
        }
        */

        layerOpacity = 1
        
        console.log(resolution)
        
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