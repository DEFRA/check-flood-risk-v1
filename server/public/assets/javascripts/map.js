// Map component
var Map = (function() {

    //
    // Private properties
    //

    var _sourceFloodZones, _sourceTargetAreas, _sourceRiverLevels, _sourceLocator, _sourceShape
    var _layerTile, _layerFloodZones, _layerTargetAreas, _layerRiverLevels, _layerLocator, _layerShape
    var _elementMap, _elementMapContainer, _elementMapContainerInner, _elementKey
    var _options
    var _drawingStarted = false, _drawingFinished = false
    var map, overlay

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

            var targetArea = _options.targetAreaStates.find(x => x.id == feature.getId())

            if (targetArea) {

                if (resolution <= _options.minIconResolution) {

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

            var riverLevel = _options.riverLevelStates.find(x => x.id == feature.getId())
            
            source = '/public/icon-locator-green-2x.png'

            if (riverLevel) {

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
    var addFeatureLocator = function (coordinate, copy) {
       
        // Update and show overlay
        overlay.getElement().innerHTML = copy
        overlay.setPosition(coordinate)
        document.querySelector('.ol-overlay').style.display = 'block'

        // Add marker
        var featureLocator = new ol.Feature()
        var point = new ol.geom.Point(coordinate)
        featureLocator.setGeometry(point)
        _layerLocator.getSource().clear()
        _layerLocator.getSource().addFeature(featureLocator)
        _layerLocator.setVisible(true)

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
    var applyGreyscale = function (context) {
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

    //
    // Public methods
    //
    
    var init = function (options) {

        //
        // Map to DOM elements
        //

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
            hasZoomReset: false,
            hasKey: false,
            hasSearch: false
        }
        _options = Object.assign({}, defaults, options)

        //
        // Map to DOM elements
        //

        _elementMap = document.querySelector('.map')
        _elementMapContainer = document.querySelector('#map').firstElementChild
        _elementMapContainerInner = _elementMapContainer.firstElementChild

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
        _sourceFloodZones = new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url: _options.floodZonesJSON,
            projection: 'EPSG:3857'
        })

        // Target areas source
        _sourceTargetAreas = new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url: _options.targetAreasJSON,
            projection: 'EPSG:3857'
        })

        // River levels source
        _sourceRiverLevels = new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url: _options.riverLevelsJSON,
            projection: 'EPSG:3857'
        })

        // Locator source
        _sourceLocator = new ol.source.Vector()

        // Shape source
        _sourceShape = new ol.source.Vector()

        //
        // Define layers
        //

        // Background map layer
        _layerTile = new ol.layer.Tile({
            source: new ol.source.OSM()
        })

        // Flood zones layer
        _layerFloodZones = new ol.layer.Vector({
            renderMode: 'image',
            source: _sourceFloodZones,
            style: styleFeatures
        })

        // Target areas layer
        _layerTargetAreas = new ol.layer.Vector({
            renderMode: 'hybrid',
            source: _sourceTargetAreas,
            style: styleFeatures
        })

        // River levels layer
        _layerRiverLevels = new ol.layer.Vector({
            source: _sourceRiverLevels,
            style: styleFeatures
        })

        // Locator layer
        _layerLocator = new ol.layer.Vector({
            source: _sourceLocator,
            style: styleInteractiveFeatures,
            visible: true
        })

        // Shape layer
        _layerShape = new ol.layer.Vector({
            source: _sourceShape,
            style: styleInteractiveFeatures,
            visible: false
        })

        //
        // Define buttons
        //

        // Search component
        var elementSearch = document.createElement('div')
        elementSearch.innerHTML =
            '<label for="map-search">Find location</label>' +
            '<input id="map-search" type="search" title="Find location">' +
            '<button type="submit">Search</button>'
        elementSearch.className = 'map-search'
        
        // Key toggle button
        if (_options.hasKey) {
            _elementKey = document.querySelector('.map-key')
            document.querySelector('.map-control-key').addEventListener('click', function(e) {
                e.preventDefault()
                _elementKey.classList.toggle('map-key-open')
            })
        }

        // Zoom buttons
        var elementZoom = document.createElement('button')
        elementZoom.appendChild(document.createTextNode('Zoom'))
        elementZoom.className = 'ol-zoom'
        var zoom = new ol.control.Zoom({
            element: elementZoom
        })

        // Zoom reset button
        var elementZoomReset = document.createElement('button')
        elementZoomReset.appendChild(document.createTextNode('Zoom reset'))
        elementZoomReset.className = 'ol-zoom-reset ol-control-group'
        elementZoomReset.setAttribute('title','Reset location')
        elementZoomReset.addEventListener('click', function(e) {
            e.preventDefault()
        })
        var zoomReset = new ol.control.Control({
            element: elementZoomReset
        })

        // Fullscreen button
        var elementFullScreen = document.createElement('button')
        elementFullScreen.appendChild(document.createTextNode('Full screen'))
        elementFullScreen.className = 'ol-full-screen'
        elementFullScreen.addEventListener('click', function(e) {
            e.preventDefault()
            // Fullscreen view
            if (_elementMapContainerInner.classList.contains('map-container-inner-fullscreen')) {
                _elementMapContainerInner.classList.remove('map-container-inner-fullscreen')
                history.back()
            }
            // Default view
            else {
                _elementMapContainerInner.classList.add('map-container-inner-fullscreen')
                state = {'view':'map'}
                url = addOrUpdateParameter(location.pathname + location.search, 'view', 'map')
                title = document.title
                history.pushState(state, title, url)
            }
            this.classList.toggle('ol-full-screen-open')
            map.updateSize()
        })
        var fullScreen = new ol.control.Control({ // Use fullscreen for HTML Fullscreen API
            element: elementFullScreen
        })

        // Draw shape button
        var elementDrawShape = document.createElement('button')
        elementDrawShape.innerHTML = '<span>Draw shape</span>'
        elementDrawShape.className = 'ol-draw-shape ol-control-group'
        elementDrawShape.setAttribute('title','Start drawing a new shape')
        elementDrawShape.addEventListener('click', function(e) {
            e.preventDefault()
            // Hide locator layer and show shape layer
            _layerLocator.setVisible(false)
            _layerShape.setVisible(true)
            // Set button disabled properties
            this.disabled = true
            elementDeleteFeature.disabled = true
            elementPlaceLocator.disabled = false
            // Add shape interactions
            map.addInteraction(snap)
            map.addInteraction(modifyPolygon)
            // Hide locator overlay if exists
            if(_layerLocator.getSource().getFeatures().length){
                document.querySelector('.ol-overlay').style.display = 'none'
            }
            // Enable delete if shape has already been drawn (feature and geometry exist)
            if(_layerShape.getSource().getFeatures().length){
                elementDeleteFeature.disabled = false
            }
            // Add shape feature and interactions if shape has not yet been drawn
            else {
                _layerShape.getSource().addFeature(new ol.Feature())
                map.addInteraction(draw)
            }
        })
        var drawShape = new ol.control.Control({
            element: elementDrawShape
        })

        // Place locator button
        var elementPlaceLocator = document.createElement('button')
        elementPlaceLocator.innerHTML = '<span>Place marker</span>'
        elementPlaceLocator.className = 'ol-place-locator ol-control-group'
        elementPlaceLocator.setAttribute('title','Place a marker to identify features')
        elementPlaceLocator.disabled = true
        elementPlaceLocator.addEventListener('click', function(e) {
            e.preventDefault()
            // End drawing if started
            if(_drawingStarted){
                draw.finishDrawing()
            }
            // Delete existing polygon feature if it has no geometry
            if(_layerShape.getSource().getFeatures().length) {
                if(!_layerShape.getSource().getFeatures()[0].getGeometry()) {
                    _layerShape.getSource().clear()
                }
            }
            // Reset draw properties
            _drawingStarted = false
            _drawingFinished = false
            // Remove shape interactions
            map.removeInteraction(draw)
            map.removeInteraction(snap)
            map.removeInteraction(modifyPolygon)
            // Hide shape layer and show locator layer
            _layerShape.setVisible(false)
            _layerLocator.setVisible(true)
            // Set button disabled properties
            this.disabled = true
            elementDrawShape.disabled = false
            elementDeleteFeature.disabled = true
            // Show locator overlay if exists
            if(_layerLocator.getSource().getFeatures().length){
                document.querySelector('.ol-overlay').style.display = 'block'
            }
            // Enable delete if feature on this layer exists and show overlay
            if(_layerLocator.getSource().getFeatures().length){
                elementDeleteFeature.disabled = false
            }
        })
        var placeLocator = new ol.control.Control({
            element: elementPlaceLocator
        })

        // Draw undo
        var elementDrawUndo = document.createElement('button')
        elementDrawUndo.innerHTML = 'Undo'
        elementDrawUndo.className = 'ol-draw-undo ol-control-group'
        elementDrawUndo.setAttribute('title','Undo the last change')
        elementDrawUndo.disabled = true
        elementDrawUndo.addEventListener('click', function(e) {
            e.preventDefault()
        })
        var drawUndo = new ol.control.Control({
            element: elementDrawUndo
        })

        // Draw redo
        var elementDrawRedo = document.createElement('button')
        elementDrawRedo.innerHTML = 'Redo'
        elementDrawRedo.className = 'ol-draw-redo ol-control-group'
        elementDrawRedo.setAttribute('title','Redo the last change')
        elementDrawRedo.disabled = true
        elementDrawRedo.addEventListener('click', function(e) {
            e.preventDefault()
        })
        var drawRedo = new ol.control.Control({
            element: elementDrawRedo
        })

        // Delete button
        var elementDeleteFeature = document.createElement('button')
        elementDeleteFeature.innerHTML = '<span>Delete</span>'
        elementDeleteFeature.className = 'ol-draw-delete ol-control-group'
        elementDeleteFeature.setAttribute('title','Delete the shape or marker')
        elementDeleteFeature.addEventListener('click', function(e) {
            e.preventDefault()
            this.disabled = true
            // If shape layer
            if(_layerShape.getVisible()) {
                _layerShape.getSource().clear()
                // End drawing if started
                if(_drawingStarted){
                    draw.finishDrawing()
                }
                _drawingStarted = false
                _drawingFinished = false
                // Add shape feature and interactions
                _layerShape.getSource().addFeature(new ol.Feature())
                map.addInteraction(draw)
                map.addInteraction(snap)
                map.addInteraction(modifyPolygon)
            }
            // If locator layer
            else {
                // Remove marker and overlay
                _layerLocator.getSource().clear()
                overlay.getElement().innerHTML = ''
                document.querySelector('.ol-overlay').style.display = 'none'
            }
        })
        var deleteFeature = new ol.control.Control({
            element: elementDeleteFeature
        })

        //
        // Create overlay object
        //

        var elementOverlay = document.createElement('div')
        elementOverlay.classList.add('ol-overlay-inner')
        overlay = new ol.Overlay({
            element: elementOverlay,
            positioning: 'bottom-left',
            insertFirst: false,
            className: 'ol-overlay ol-control-group'
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
            source: _sourceShape,
            style: styleDrawModify
        })
        var draw = new ol.interaction.Draw({
            source: _sourceShape,
            type: 'Polygon',
            style: styleDraw,
            condition: function(e) {
                // Hack to tackle finishDrawing with zero coordinates bug
                if (e.type == 'pointerdown') {
                    _drawingStarted = true
                } else {
                    _drawingStarted = false
                }
                return true
            }
        })
        var snap = new ol.interaction.Snap({
            source: _sourceShape
        })

        // Define view object
        var view = new ol.View({
            center: ol.proj.fromLonLat(_options.lonLat),
            enableRotation: false,
            zoom: _options.zoom
        })

        // Add search control
        if (_options.hasSearch) {
            _elementMapContainerInner.appendChild(elementSearch)
        }

        // Add key control
        else if (_options.hasKey) {
            // Create key dynamically
        }

        // Add controls to map
        var customControls = [fullScreen]
        if (_options.hasZoomReset) {
            customControls.push(zoomReset)
        }
        customControls.push(zoom)
        if (_options.hasDrawing) {
            customControls.push(deleteFeature)
        }
        if (_options.hasUndoRedo) {
            _elementMap.classList.add('has-undoredo')
            customControls.push(drawRedo, drawUndo)
        }
        if (_options.hasDrawing) {
            customControls.push(drawShape,placeLocator)
        }
        var controls = ol.control.defaults({
            zoom: false,
            rotate: false,
            attribution: false
        }).extend(customControls)

        // Add layers to map
        var layers = [_layerTile]
        if (_options.floodZonesJSON != '') {
            layers.push(_layerFloodZones)
        }
        if (_options.targetAreasJSON != '') {
            layers.push(_layerTargetAreas)
        }
        if (_options.riverLevelsJSON != '') {
            layers.push(_layerRiverLevels)
        }
        if (_options.hasDrawing) {
            layers.push(_layerShape)
        }
        if (_options.hasDrawing || _options.hasLocator) {
            layers.push(_layerLocator)
        }
        
        // Add fullscreen class before map is rendered
        if (getParameterByName('view') == 'map') {
            _elementMapContainerInner.classList.add('map-container-inner-fullscreen')
        }

        // Render map
        map = new ol.Map({
            target: 'map-container-inner',
            interactions: interactions,
            controls: controls,
            layers: layers,
            view: view
        })
        
        // Add overlay element
        map.addOverlay(overlay)

        // Wrap bottom controls in container so position can be controlled with CSS
        var elements = document.querySelectorAll('.ol-control-group, .ol-zoom')
        if (elements.length) {
            var parent = elements[0].parentNode
            var wrapper = document.createElement('div')
            wrapper.className = 'ol-control-group'
            for (i=0; i<elements.length; i++) {
                elements[i].classList.remove('ol-control-group')
                wrapper.appendChild(elements[i])
            }
            //parent.(wrapper, parent.lastChild)
            parent.appendChild(wrapper)
        }

        // Add initial locator and overlay
        if (_options.hasLocator || _options.hasDrawing) {
            var coordinate = ol.proj.transform(_options.lonLat, 'EPSG:4326', 'EPSG:3857')
            addFeatureLocator(coordinate, '<p><strong class="bold-small">Mytholmroyd</strong></p>')
        }

        //
        // Map events
        //

        // Close key or place locator if map is clicked
        map.on('click', function(e) {
            // Close key
            if (_options.hasKey) {
                if (_elementKey.classList.contains('map-key-open')) {
                    _elementKey.classList.remove('map-key-open') 
                    return  
                } 
            }
            // If doesnt have key or key is closed place locator
            if(_options.hasLocator || _options.hasDrawing) {
                if (_layerLocator.getVisible()) {
                    // locator object
                    addFeatureLocator(e.coordinate, '<p><strong class="bold-small">Flood zone 1</strong><br/>(<abbr title="Easting and northing">EN</abbr> 123456/123456)</p>')
                }
                // Enable delete
                elementDeleteFeature.disabled = false
            }
        })

        // Set start drawing flag
        draw.on('drawShape', function (e) {
            _drawingStarted = true
        })

        // Deactivate draw interaction after first polygon is finished
        draw.on('drawend', function (e) {
            _drawingStarted = false
            coordinates = e.feature.getGeometry().getCoordinates()[0]
            // Polygon is too small reset buttons and interaction feature type
            if (coordinates.length < 4) {
                elementDrawShape.disabled = false
                e.feature.setGeometry(null)
            } 
            // Polygon is ok
            else {
                elementDeleteFeature.disabled = false
                elementDrawShape.disabled = true
                _drawingFinished = true
                feature = e.feature
                map.removeInteraction(this)
            }
        })

        // Keyboard controls
        document.addEventListener('keydown', function(e) {

            // Finish drawing polygon escape key pressed
            if (e.keyCode === 27) {

                // Escape drawing a polygon if it is not already finished
                if (_layerShape.getVisible() && !_drawingFinished) {
                    // Clear an reenable draw button 
                    if (!_drawingStarted) {
                        map.removeInteraction(draw)
                        map.removeInteraction(snap)
                        map.removeInteraction(modifyPolygon)
                        elementDrawShape.disabled = false
                    } 
                    // finishDrawing can now be called safely
                    else {
                        draw.finishDrawing()
                    }
                }

            }

            // Constrain tab key to 'key' when its open
            else if (e.keyCode === 9) {

                var context
                // Context is map key
                if (_elementKey.classList.contains('map-key-open')) {
                    context = _elementKey
                }
                // Context is map fullscreen view
                else if (_elementMapContainerInner.classList.contains('map-container-inner-fullscreen')) {
                    context = _elementMapContainerInner
                }
                // Context is default
                else {
                    context = null
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

        // Set initial focus to first focusable element if map is fullscreen
        window.onload = function() {
            if (getParameterByName('view') == 'map') {
                focusElement = _elementMapContainerInner.querySelectorAll('button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')[0]
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
            _layerFloodZones.setOpacity(layerOpacity)
            _layerTargetAreas.setOpacity(layerOpacity)
        })

        // Toggle fullscreen view on browser history change
        window.onpopstate = function(e) {    
            if (e && e.state) {
                _elementMapContainerInner.classList.add('map-container-inner-fullscreen')
                elementFullScreen.classList.add('ol-full-screen-open')
            }
            else {
                _elementMapContainerInner.classList.remove('map-container-inner-fullscreen')
                elementFullScreen.classList.remove('ol-full-screen-open')
            }
            map.updateSize()
        }

    }

    return {
        init: init
    }

})()