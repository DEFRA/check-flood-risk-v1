// Global variables
var url, lonLat, zoom, path, point, geoJson

// Codec used for compression
var codec

// Reference required to redraw map
var map, layerShape, label

var init = function() {

    // Default values
    url = [location.protocol, '//', location.host, location.pathname].join('')
    lonLat = getParameterByName('lonLat') || ''
    zoom = getParameterByName('zoom') || 15
    path = getParameterByName('path') || ''
    geoJson = { }
    
    // Map properties from html classes
    hasKey = document.querySelector('.map').classList.contains('map-has-key')

    // JSON for features
    var floodZonesJSON = '/public/data/flood-zones.json';

    //
    // Add html elements to map
    //

    // Setup fullscreen container and key (legend) elements

    var mapContainer = document.querySelector('.map').children[0]
    var mapContainerInner = document.createElement('div')
    mapContainerInner.classList.add('map-container-inner')
    mapContainerInner.id = 'map-container-inner'

    // Add key

    var key = document.createElement('div')
    key.classList.add('map-key')
    //key.classList.add('map-key-open')

    var keyToggle = document.createElement('button')
    keyToggle.innerHTML = '<span>Key</span>'
    keyToggle.setAttribute('title','Find out what the features are')
    keyToggle.classList.add('map-control','map-control-key')
    keyToggle.addEventListener('click', function(e) {
        e.preventDefault()
        key.classList.toggle('map-key-open')
    })

    var keyContainer = document.createElement('div')
    keyContainer.classList.add('map-key-container')

    var keyHeading = document.createElement('div')
    keyHeading.classList.add('map-key-heading')
    keyHeading.innerHTML = '<h2 class="bold-medium">Key</h2>'

    var keyFeatures = document.createElement('div')
    keyFeatures.classList.add('map-key-features')
    keyFeatures.innerHTML = `
        <ul>
            <li class="key-feature key-section">
                <div class="multiple-choice-key">
                    <input id="flood-zones" name="flood-zones" type="checkbox" value="flood-zones" checked>
                    <label for="flood-zones">Flood risk zones</label>
                </div>
                <ul class="key-feature-group">
                    <li>
                        <span class="key-feature-label">
                            <span class="key-symbol key-symbol-zone3">
                                <svg width="100%" height="100%" viewBox="0 0 26 19" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="0" y="0" width="100%" height="100%" fill="#464D95" />
                                </svg>
                            </span>
                            Zone 3
                        </span>
                    </li>
                    <li>
                        <span class="key-feature-label">                            
                            <span class="key-symbol key-symbol-zone3-benefitting">
                                <svg width="100%" height="100%" viewBox="0 0 26 19" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <pattern id="hatch" width="5" height="5" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                                            <line x1="0" y1="0" x2="0" y2="10" style="stroke:#464D95; stroke-width:5" />
                                        </pattern>
                                    </defs>
                                    <rect x="1" y="1" width="24" height="17" stroke="#464D95" stroke-width="2" fill="url(#hatch)" />
                                </svg>
                            </span>
                            Zone 3 - Areas benefitting from flood defences
                        </span>
                    </li>
                    <li>
                        <span class="key-feature-label">
                            <span class="key-symbol key-symbol-zone2">
                                <svg width="100%" height="100%" viewBox="0 0 26 19" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="0" y="0" width="100%" height="100%" fill="#ABD6FF" />
                                </svg>
                            </span>
                            Zone 2
                        </span>
                    </li>
                    <!--
                    <li>
                        <span class="key-feature-label"><span class="key-symbol key-symbol-zone1"></span>Zone 1</span>
                    </li>
                    -->
                </ul>
            </li>
            <li class="key-feature">
                <div class="multiple-choice-key">
                    <input id="flood-defence" name="flood-defence" type="checkbox" value="flood-defence" checked>
                    <label for="flood-defence">
                        <span class="key-feature-label">
                            <span class="key-symbol key-symbol-flood-defence">
                                <svg width="100%" height="100%" viewBox="0 0 26 19" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="0" y="6" width="100%" height="7" fill="#F47738" />
                                </svg>
                            </span>
                            Flood defence
                        </span>
                    </label>
                </div>
            </li>
            <li class="key-feature">
                <div class="multiple-choice-key">
                    <input id="main-river" name="main-river" type="checkbox" value="main-river" checked>
                    <label for="main-river">
                        <span class="key-feature-label">
                            <span class="key-symbol key-symbol-main-river">
                                <svg width="100%" height="100%" viewBox="0 0 26 19" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="0" y="6" width="100%" height="7" fill="#2B8CC4" />
                                </svg>
                            </span>
                            Main river
                        </span>
                    </label>
                </div>
            </li>
            <li class="key-feature">
                <div class="multiple-choice-key">
                    <input id="flood-storage" name="flood-storage" type="checkbox" value="flood-storage" checked>
                    <label for="flood-storage">
                        <span class="key-feature-label">
                            <span class="key-symbol key-symbol-flood-storage">
                                <svg width="100%" height="100%" viewBox="0 0 26 19" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <pattern id="dots" x="0" y="0" width="7" height="7" patternUnits="userSpaceOnUse" >
                                            <circle cx="2.5" cy="2.5" r="2.5" style="stroke: none; fill: #2B8CC4" />
                                        </pattern>
                                    </defs>
                                    <rect x="0" y="0" width="100%" height="100%" fill="url(#dots)" />
                                </svg>
                            </span>
                            Flood storage area
                        </span>
                    </label>
                </div>
            </li>
        </ul>
    `

    var keyCopyright = document.createElement('div')
    keyCopyright.innerHTML = '\u00A9 <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    keyCopyright.classList.add('map-key-copyright')

    keyContainer.appendChild(keyHeading)
    keyContainer.appendChild(keyFeatures)
    keyContainer.appendChild(keyCopyright)
    key.appendChild(keyToggle)
    key.appendChild(keyContainer)

    if (hasKey) {
        mapContainerInner.appendChild(key)
    }

    // Add inner comtainer
    mapContainer.appendChild(mapContainerInner)

    // Start drawing boolean used to address finishDrawing bug
    var drawingStarted = false
    var drawingFinished = false

    // Set up compression codec
    codec = JsonUrl('lzma')

    // Style function for flood zones
    var styleFunctionFloodZones = function(feature, resolution) {

        // Defaults
        var strokeColour = 'transparent';
        var fillColour = 'transparent';
        var zIndex = 1

        //Flood zone 1
        if (feature.get('type') == 3) {
            fillColour = '#464D95';
            zIndex = 3;
        }

        // Flood zone 2
        else if (feature.get('type') == 2) {
            fillColour = '#ABD6FF';
            zIndex = 2;
        }

        // Generate style
        var styleFloodZones = new ol.style.Style({
            fill: new ol.style.Fill({ color: fillColour }),			
            stroke: new ol.style.Stroke({ color: strokeColour, width: 0, miterLimit: 2, lineJoin: 'round' }),
            zIndex: zIndex 
        })

        return styleFloodZones

    }

    // Style function for interactions
    var styleFunctionInteractions = function(feature, resolution) {
        
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
        // Markey style
        var styleMarker = new ol.style.Style({
            image: new ol.style.Icon({
                src: '/public/icon-locator-blue-2x.png',
                size: [53, 71],
                anchor: [0.5, 1],
                scale: 0.5
            })
        })

        if (featureType == 'Polygon') {
            return [styleDrawComplete, styleDrawCompleteGeometry]
        } else if (featureType == 'Point') {
            return [styleMarker]
        }

    }

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

    // Source: flood zones
    var sourceFloodZones = new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        url: floodZonesJSON,
        projection: 'EPSG:3857'
    })

    // Source: marker
    var sourceMarker = new ol.source.Vector()

    // Source: shape
    var sourceShape = new ol.source.Vector()
    sourceShape.addFeature(new ol.Feature())

    // Layer: background map
    var tile = new ol.layer.Tile({
        source: new ol.source.OSM()
    })

    // Layer: flood zones
    var layerFloodZones = new ol.layer.Image({
        source: new ol.source.ImageVector({
            source: sourceFloodZones,
            // Use custom style function to colour individual features accordingley
            style: styleFunctionFloodZones
        }),
        opacity: 0.7
    })

    // Layer: marker
    layerMarker = new ol.layer.Vector({
        source: sourceMarker,
        style: styleFunctionInteractions,
        visibility: false
    })
    layerMarker.setVisible(false)

    // Layer: shape
    layerShape = new ol.layer.Vector({
        source: sourceShape,
        style: styleFunctionInteractions,
        visibility: false
    })
    layerShape.setVisible(false)

    // The map view object
    var view = new ol.View({
        center: ol.proj.fromLonLat(centre),
        enableRotation: false,
        zoom: zoom
    });

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
        // Add shape interactions
        map.addInteraction(draw)
        map.addInteraction(snap)
        map.addInteraction(modifyPolygon)
        // Hide marker and show shape
        this.disabled = true
        placeMarkerElement.disabled = false
        layerMarker.setVisible(false)
        layerShape.setVisible(true)
        document.getElementsByClassName('ol-overlay-container')[0].style.visibility = 'hidden'
        document.getElementsByClassName('map')[0].classList.remove('has-overlay')
        deleteFeatureElement.disabled = true
        // Enable delete if feature on this layer exists
        if(layerShape.getSource().getFeatures()[0].getGeometry()){
            deleteFeatureElement.disabled = false
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
        document.getElementsByClassName('ol-overlay-container')[0].style.visibility = 'visible'
        document.getElementsByClassName('map')[0].classList.add('has-overlay')
        deleteFeatureElement.disabled = true
        // Enable delete if feature on this layer exists
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
        // If marker layer
        if(layerShape.getVisible()) {
            layerShape.getSource().clear()
            drawingStarted = false
            drawingFinished = false
        }
        // If shape layer
        else {
            layerMarker.getSource().clear()
            map.removeOverlay(label)
            document.getElementsByClassName('map')[0].classList.remove('has-overlay')
        }
        // Update url
        //feature = new ol.Feature()
        //updateUrl(feature)
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

    // Marker
    var featureMarker = new ol.Feature()

    // Setup interactions
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

    // Add and remove controls

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

    // Render map

    map = new ol.Map({
        target: 'map-container-inner',
        interactions: interactions,
        controls: controls,
        layers: [tile, layerFloodZones, layerShape, layerMarker],
        view: view
    })

    // Setup

    // Add feature from path
    if (path) {
        codec.decompress(path).then(result => {
            // Check for valid geoJson
            feature = new ol.format.GeoJSON().readFeature(result)
            layerShape.getSource().getFeatures()[0].setGeometry(feature.getGeometry())
            map.addInteraction(snap)
            map.addInteraction(modifyPolygon)
            drawShapeElement.disabled = true
            deleteFeatureElement.disabled = false
            drawingStarted = true
            drawingFinished = true
            layerShape.setVisible(true)
        })
    } 
    // Add initial locator
    else {
        var pointLonLat = ol.proj.transform(map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326')
        pointLonLat[0] = pointLonLat[0].toFixed(6)
        pointLonLat[1] = pointLonLat[1].toFixed(6)
        document.getElementById('point').value = pointLonLat
        centreCoordinate = ol.proj.transform(centre, 'EPSG:4326','EPSG:3857')
        featureMarker.setGeometry(new ol.geom.Point(centreCoordinate))
        layerMarker.getSource().addFeature(featureMarker)
        label.setPosition(centreCoordinate)
        map.addOverlay(label)
        layerMarker.setVisible(true)
        document.getElementsByClassName('ol-overlay-container')[0].style.visibility = 'visible'
        document.getElementsByClassName('map')[0].classList.add('has-overlay')
    }

    //
    // Map events
    //

    // Update url when zoom changes
    map.on('moveend', function(e) {
        //updateUrl(feature)
    })

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
                // Set form value
                point = ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326')
                document.getElementById('point').value = point
                // Marker object
                geometryPoint = new ol.geom.Point(e.coordinate)
                featureMarker.setGeometry(geometryPoint)
                labelElement.innerHTML = '<p><strong class="bold-small">Flood zone 1</strong><br/>(<abbr title="Easting and northing">EN</abbr> 123456/123456)</p>'
                layerMarker.getSource().clear()
                layerMarker.getSource().addFeature(featureMarker)
                label.setPosition(e.coordinate)
                map.addOverlay(label)
                document.getElementsByClassName('ol-overlay-container')[0].style.visibility = 'visible'
                document.getElementsByClassName('map')[0].classList.add('has-overlay')
            }
            // Enable delete
            deleteFeatureElement.disabled = false
        }

        // Get layer if needed
        /*
        map.forEachLayerAtPixel(e.pixel, function(layer){ 
            if( layer === tile ) {
            } 
        })
        */
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
            updateUrl(feature)
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

    // Update url when feature has been modified
    modifyPolygon.on('modifyend',function(e){
        // Get the modified feature
        var features = e.features.getArray(), counter
        for (i = 0; i < features.length; i++) {
            var rev = features[i].getRevision()
            if (rev > 1) {
                counter = i
                break
            }
        }
        feature = features[counter]
        updateUrl(feature)
    })

    // Apply greyscale filter.
    /*
    tile.on('postcompose', function(event) {
        greyscale(event.context);
    })
    */

}

init()

// Function to get query string parameter
function getParameterByName(name) {
    var v = window.location.search.match(new RegExp('(?:[\?\&]'+name+'=)([^&]+)'))
    return v ? v[1] : null
}

// function applies greyscale to every pixel in canvas
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

// Update url
function updateUrl(feature) {

    // Set current map centre and reduce decimal places
    var centreLonLat = ol.proj.transform(map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326')
    centreLonLat[0] = centreLonLat[0].toFixed(6)
    centreLonLat[1] = centreLonLat[1].toFixed(6)
    document.getElementById('lonLat').value = centreLonLat

    // Set current zoom level
    zoom = map.getView().getZoom().toFixed(2)
    document.getElementById('zoom').value = zoom

    // We have a new or modified feature
    if (feature) {
        // Write feature as GeoJson
        var writer = new ol.format.GeoJSON()
        geoJson = writer.writeFeature(feature,{
            featureProjection : 'EPSG:4326',
            decimals : 6 // This should reduce size of data and still gives +- 4inch precision
        })
        // Compress the String and update the url
        codec.compress(geoJson).then(result => {
            path = result
            document.getElementById('path').value = path
            // Add or update path in url
            //history.replaceState(null, null, url + '?lonLat=' + centreLonLat + '&zoom=' + zoom + '&path=' + path)
            
        })
    }
    
    // We don't have a feature
    else {
        // Clear the path value
        document.getElementById('path').value = ''
        // Remove path from url
        // history.replaceState(null, null, url + '?lonLat=' + centreLonLat + '&zoom=' + zoom)
        
    }

<<<<<<< HEAD
}

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

=======
}
>>>>>>> b275c85e6eaa70541766f76de6d65c5623db99bd
