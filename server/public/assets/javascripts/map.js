
// Preset values

var defaultBoundingBox = [[-5.72,49.96],[1.77,55.81]]
var minIconResolution = 300

// Setup fullscreen container and key elements

var mapContainer = document.querySelector('.map-container')
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
                        <span class="key-symbol key-symbol-zone3"></span>
                        Zone 3
                    </span>
                </li>
                <li>
                    <span class="key-feature-label">                            
                        <span class="key-symbol key-symbol-zone3-benefitting">
                            <svg width="100%" height="100%" viewBox="0 0 26 19" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <pattern id="hatch" width="5" height="5" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                                        <line x1="0" y1="0" x2="0" y2="10" style="stroke:#2E358B; stroke-width:5" />
                                    </pattern>
                                </defs>
                                <rect x="1" y="1" width="24" height="17" stroke="#2E358B" stroke-width="2" fill="url(#hatch)" />
                            </svg>
                        </span>
                        Zone 3 - Areas benefitting from flood defences
                    </span>
                </li>
                <li>
                    <span class="key-feature-label"><span class="key-symbol key-symbol-zone2"></span>Zone 2</span>
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

mapContainerInner.appendChild(key)

mapContainer.appendChild(mapContainerInner)

// Reference require to redraw map
var map, extent

// Reference requried to redraw extent
var sourceTargetAreas

// Set default extent
extent = ol.extent.boundingExtent(defaultBoundingBox)
extent = ol.proj.transformExtent(extent, ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'))

var init = function() {

    var selectedId = ''

    // lon lat center
    var centre = [-1.464854,52.561928]

    // layerOpacity setting for all image layers
    var layerOpacity = 1, selectedBdrWidth = 10, resolution;

    // Source for target areas

    // JSON for features
    var targetAreasJSON = '/public/data/target-areas.json';

    // Function used to style individual features
    var styleFunction = function(feature, resolution) {

        var target = targetAreaStates.find(x => x.id == feature.getId())

        if (target) {

            if (resolution <= minIconResolution) {

                // No warning or alert colourse
                var strokeColour = 'transparent';
                var fillColour = 'transparent';
                // Stroke width used to improve display when target areas are small
                var strokeWidth = 2;
                var zIndex = 1;

                // Warning or severe warning colours
                if (target.state == 1 || target.state == 2) {
                    strokeColour = '#e3000f';
                    fillColour = '#e3000f';
                    zIndex = 3;
                    source = '/public/icon-flood-warning-small-2x.png';
                }

                // Alert area colours
                else if (target.state == 3) {
                    strokeColour = '#f18700';
                    fillColour = '#f18700';
                    zIndex = 2;
                    source = '/public/icon-flood-alert-small-2x.png';
                }

                // Warning removed colours
                else if (target.state == 4) {
                    strokeColour = '#6f777b';
                    fillColour = '#6f777b';
                    zIndex = 3;
                    source = '';
                }

                // Generate style
                var style = new ol.style.Style({
                    fill: new ol.style.Fill({ color: fillColour }),			
                    stroke: new ol.style.Stroke({ color: strokeColour, width: strokeWidth, miterLimit: 2, lineJoin: 'round' }),
                    zIndex: zIndex 
                });

            } else {

                // Icon image source
                var source = '';

                // Warning or severe warning colours
                if (target.state == 1 || target.state == 2) {
                    zIndex = 3;
                    source = '/public/icon-flood-warning-small-2x.png';
                }

                // Alert area colours
                else if (target.state == 3) {
                    zIndex = 2;
                    source = '/public/icon-flood-alert-small-2x.png';
                }

                // Warning removed colours
                else if (target.state == 4) {
                    zIndex = 3;
                    source = '';
                }

                // Generate style
                var style = new ol.style.Style({
                    image: new ol.style.Icon({
                        src: source,
                        size: [68, 68],
                        anchor: [0.5, 1],
                        scale: 0.5
                    }),
                    zIndex: zIndex 
                });

            }

        }

        console.log(feature.getId())
        return style;
    };

    // Style: Selected feature border
    var styleSelected = new ol.style.Style({
        stroke: new ol.style.Stroke({ color: '#ffbf47', width: selectedBdrWidth, miterLimit: 2, lineJoin: 'round' })
        //stroke: new ol.style.Stroke({ color: '#005ea5', width: selectedBdrWidth, miterLimit: 2, lineJoin: 'round' })
    });

    // Add target area features to source
    sourceTargetAreas = new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        url: targetAreasJSON,
        projection: 'EPSG:3857'
    });

    // Source for features intersecting with selected feature
    var sourceIntersect = new ol.source.Vector({
        projection: 'EPSG:3857'
    });

    // Layer: All target areas
    var targetAreas = new ol.layer.Image({
        source: new ol.source.ImageVector({
            source: sourceTargetAreas,
            // Use custom style function to colour individual features accordingley
            style: styleFunction
        }),
        opacity: layerOpacity
    });

    // Layer: Only target areas that intersect with selected target area
    var targetAreasIntersecting = new ol.layer.Image({
        source: new ol.source.ImageVector({
            source: sourceIntersect,
            // Use custom style function to colour individual features accordingley
            style: styleFunction
        }),
        opacity: layerOpacity
    });

    // Layer: Background map
    var tile = new ol.layer.Tile({
        source: new ol.source.OSM()
    });

    // Layer: A background map clipped to selected feature multi polygon
    var tileSelected = new ol.layer.Tile();

    //  Selected feature and selected feature extent objects
    var featureSelected, featureSelectedExtent;

    // The map view object
    var view = new ol.View({
        center: ol.proj.fromLonLat(centre),
        enableRotation: false,
        zoom: 9
    });

    // Add river level features if available
    var sourceLevels = new ol.source.Vector();
    if (!isEmpty(levelsJSON)) {
        sourceLevels.addFeatures(new ol.format.GeoJSON({
            featureProjection:'EPSG:3857'
        }).readFeatures(levelsJSON))
    }

    // Add river levels layer
    var levelStyle = new ol.style.Style({
        image: new ol.style.Icon({
            src: '/public/icon-locator-blue-2x.png',
            size: [53, 71],
            anchor: [0.5, 1],
            scale: 0.5
        })
    })
    var levels = new ol.layer.Image({
        source: new ol.source.ImageVector({
            source: sourceLevels,
            style: levelStyle
        })
    })

    // Zoom buttons

    var zoomElement = document.createElement('button')
    zoomElement.appendChild(document.createTextNode('Zoom'))
    zoomElement.className = 'ol-zoom'
    var zoom = new ol.control.Zoom({
        element: zoomElement
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

    // Zoom reset button

    var zoomResetElement = document.createElement('button')
    zoomResetElement.appendChild(document.createTextNode('Zoom reset'))
    zoomResetElement.className = 'ol-zoom-reset'
    zoomResetElement.setAttribute('title','Reset location')
    var zoomReset = new ol.control.Control({
        element: zoomResetElement
    })

    // Interactions

    var interactions = ol.interaction.defaults({
        altShiftDragRotate:false, 
        pinchRotate:false
    })

    // Add and remove controls

    var controls = ol.control.defaults({
        zoom: false,
        rotate: false,
        attribution: false
    }).extend([
        fullScreen,
        zoomReset,
        zoom
    ])

    // Render map
    map = new ol.Map({
        target: 'map-container-inner',
        interactions: interactions,
        controls: controls,
        // Layer order:
        // 1. Background map
        // 2. All target areas coloured accordingley
        // 3. Selected border that straddles the selected feature then
        //    another copy of the background clipped inside the selected feature
        // 4. Only target areas that intersect with the slected feature also
        //    clipped inside the selected feature
        //layers: [tile, targetAreas, tileSelected, targetAreasIntersecting, levels],
        layers: [tile, targetAreas],
        view: view
    })

    //
    // Map events
    //

    // Draw the outer glow (border) then
    // add a background map that is clipped to the selected feature
    tileSelected.on('precompose', function(e){
        if (featureSelected) {
            // Save initial clipping state of canvas
            e.context.save()
            // Draw the selected border
            e.vectorContext.drawFeature(featureSelected, styleSelected)
            if (resolution > 19) {
                e.vectorContext.drawFeature(featureSelected, styleFunction(featureSelected,resolution))
            }
            // Set this polygon as a clipping mask for this layers background map
            e.context.clip()
        }	
    });

    // Restore the canvas so no subsequent content is clipped/masked
    tileSelected.on('postcompose', function(e) {
        e.context.restore()
    })

    // Clip intersect features to the shape of the selected feature
    targetAreasIntersecting.on('precompose', function(e){
        if (featureSelected) {
            // Save initial clipping state of canvas
            e.context.save()
            // Draw the selected feature with no/transparent border
            e.vectorContext.drawFeature(featureSelected, new ol.style.Style({
                stroke: new ol.style.Stroke({ color: 'transparent', width: 0, miterLimit: 2, lineJoin: 'round' })
            }))
            // Set this polygon as a clipping mask for this layers features
            e.context.clip()
        }
    })
    
    // Restore the canvas so no subsequent content is clipped/masked
    targetAreasIntersecting.on('postcompose', function(e){
        e.context.restore()
    })

    // Update layer opacity setting for different map resolutions
    map.on('moveend', function(){

        resolution = map.getView().getResolution()

        layerOpacity = 1
        targetAreas.setZIndex(0)

        if (resolution > minIconResolution) { targetAreas.setZIndex(99) }
        else if (resolution > 19) { layerOpacity = 0.85 } 
        else if (resolution > 9) { layerOpacity = 0.7 }
        
        targetAreas.setOpacity(layerOpacity)
        targetAreasIntersecting.setOpacity(layerOpacity)
    });


    // Change pointer type and highlight style
    map.on('pointermove', function (e) {
        var pixel = map.getEventPixel(e.originalEvent)
        var hit = map.hasFeatureAtPixel(pixel)
        map.getViewport().style.cursor = hit ? 'pointer' : ''
    });

    // When main source has loaded if there is a selected feature
    // generate intersecting features source and
    // add OSM background map to tileSelected source
    // set extent to features
    sourceTargetAreas.on('change', function(e){

        // Set center or extent
        if (lonLat.length) {
            map.getView().setCenter(ol.proj.fromLonLat(lonLat))
        } else {
            map.getView().fit(extent, map.getSize())
        }

        // Set selected target area
        if (selectedId) {
            if(e.target.getState() === 'ready'){
                featureSelected = source.getFeatureById(selectedId);
                featureSelectedExtent = featureSelected.getGeometry().getExtent();
                tileSelected.setSource(new ol.source.OSM());
                sourceTargetAreas.forEachFeatureIntersectingExtent(featureSelectedExtent, function(feature) {
                    featureType = feature.getGeometry().getType();
                    if (featureType == 'MultiPolygon') {
                        sourceIntersect.addFeature(feature);
                    }
                });
                //map.getView().fit(featureSelectedExtent);
            }
        } else {
            //map.getView().fit(sourceTargetAreas.getExtent());
        }

    })

}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

init()