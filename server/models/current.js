var data = require('../data/data.json')

// Get risk summary by location and scenario
exports.getSummary = function(path, scenario) {

	var
		town, 
		postcode, 
		postcodes,  
		location,

		intersectingTarget = {},
		warningsSevere = [], // Nearby
		warnings = [], // Nearby
		alerts = [], // Nearby
		targetAreaAll = [], // Nearby
		levels = [], // Levels for impact area
		impacts = [], // Current impacts in this area
		levelState = 'normal', // Level state summary
		riskTypes = [], // List of risk types
		riskTypesString, // Formatted string of risk types

		hasPostcode = false,
		hasRisk = false,
		hasRiskRiver = false,
		hasRiskCoast = false,
		hasRiskResovoir = false,
		hasRiskSurface = false,
		hasRiskRiverCoastOrResovoir = false,
		hasImpacts = false,

		hasWarningSevere = false, // Nearby
		hasWarning = false, // Nearby
		hasAlert = false, // Nearby
		hasAlertOrWarning = false, // Nearby
		hasTargetArea = false, // Nearby

		hasIntersectWarningSevere = false,
		hasIntersectWarning = false,
		hasIntersectAlert = false,
		hasIntersectAlertOrWarning = false,
		hasIntersectTarget = false,

		targetAreaStates = [],
		riverLevelStates = [],
		levelsJSON,
		lonLat = []

	// Set levelsJSON empty structure
	levelsJSON = { 'type': 'FeatureCollection', 'features': [] }

	// Find in towns
	town = data.town.find(
		x => x.path === path
	)

	// If town find all postcodes for location
	if (town) {
		postcodes = data.postcode.filter(x => x.townId === town.id)
		lonLat = town.lonLat
	}

	// If postcode find in postcodes
	if (!town) {
		postcode = data.postcode.find(
			x => x.path === path
		)
		postcodes = [postcode]
		town = data.town.find(
			x => x.id === postcode.townId
		)
	}

	// Set location
	location = town.name;
	if (postcode) {
		location = postcode.name + ', ' + town.name
		lonLat = postcode.lonLat
		hasPostcode = true
	}

	// Add intersections for postcode if applicable
	if (postcode) {
		var intersectingTargetWarning = data.targetArea.find(x => x.id == postcode.intersectingWarning)
		var intersectingTargetAlert = data.targetArea.find(x => x.id == postcode.intersectingAlert)
		if (intersectingTargetAlert) {
			// Intersets with a target alert area
			hasIntersectTarget = true
			if (intersectingTargetAlert.scenario.find(x => x.id == scenario && x.severity == 3)) {
				// Intersects with a current alert
				intersectingTarget = intersectingTargetAlert
				targetAreaStates.push({ "id" : intersectingTarget.id, "state" : 3 })
				targetAreaAll.push(intersectingTarget)
				hasIntersectAlert = true
			}	
		}
		if (intersectingTargetWarning) {
			// Intersets with an target warning area
			hasIntersectTarget = true
			if (intersectingTargetWarning.scenario.find(x => x.id == scenario && x.severity == 1)) {
				// Intersects with a current severe warning
				intersectingTarget = intersectingTargetWarning
				targetAreaStates.push({ "id" : intersectingTarget.id, "state" : 1 })
				targetAreaAll.push(intersectingTarget)
				hasIntersectWarningSevere = true
			} else if (intersectingTargetWarning.scenario.find(x => x.id == scenario && x.severity == 2)) {
				// Intersects with a current warning
				intersectingTarget = intersectingTargetWarning
				targetAreaStates.push({ "id" : intersectingTarget.id, "state" : 2 })
				targetAreaAll.push(intersectingTarget)
				hasIntersectWarning = true
			}
		}
	}

	// Add nearby targets, severe warnings, warnings and alerts for postcodes
	if (postcodes) {
		for (var key in data.targetArea) {
			var targetArea = data.targetArea[key]
			for (var key in postcodes) {
				if (postcodes[key].targetAreas.indexOf(targetArea.id) > -1) {
					// Add nearby severe warning, excluding intersecting severe warning
					if (warningsSevere.indexOf(targetArea) == -1 && targetArea != intersectingTarget && targetArea.scenario.find(x => x.id == scenario && x.severity == 1)) {
						targetAreaAll.push(targetArea)
						warningsSevere.push(targetArea)
						targetAreaStates.push({ "id" : targetArea.id, "state" : 1 })
						hasWarningSevere = true
					}
					// Add nearby warning, excluding intersecting warning
					if (warnings.indexOf(targetArea) == -1 && targetArea != intersectingTarget && targetArea.scenario.find(x => x.id == scenario && x.severity == 2)) {
						warnings.push(targetArea)
						targetAreaAll.push(targetArea)
						targetAreaStates.push({ "id" : targetArea.id, "state" : 2 })
						hasWarning = true
					}
					// Add nearby alert, excluding 1/4 scenario 
					if (alerts.indexOf(targetArea) == -1 && targetArea.scenario.find(x => x.id == scenario && x.severity == 3) && !(!hasIntersectWarning && !hasIntersectWarningSevere && hasIntersectAlert)) {
						alerts.push(targetArea)
						targetAreaAll.push(targetArea)
						targetAreaStates.push({ "id" : targetArea.id, "state" : 3 })
						hasAlert = true
					}
				}
			}
		}
	}

	// Add river levels for target area and set general level state (Normal, above or below)
	for (var key in data.level) {
		var level = data.level[key]
		for (var key in targetAreaAll) {
			var targetArea = targetAreaAll[key]
			if (targetArea.levels.indexOf(level.id) > -1 && !levels.find(x => x.id == level.id)) {
				// Add level
				levels.push({ 
					'id' : level.id,
					'name' : level.name,
					'river' : level.river,
					'path' : level.path,
					"coordinates" : level.coordinates,
					'gain' : level.scenario.find(x => x.id == scenario).gain,
					'state' : level.scenario.find(x => x.id == scenario).state
				})
				levelsJSON.features.push({
					'type': 'Feature',
					'id': level.id,
					'properties': {
						'name': level.name,
						'river': level.river,
						'path' : level.path
					},
					'geometry': {
						'type': 'Point',
						'coordinates':level.coordinates
					}
				})
				var state = level.scenario.find(x => x.id == scenario).state
				if (state == 'above') {
					levelState = 'above'
				} else if (state == 'below') {
					levelState = 'below'
				}
			}
		}
	}

	// Add all river levels
	for (var key in data.level) {
		var level = data.level[key]
		var state = level.scenario.find(x => x.id == scenario).state
		riverLevelStates.push({ "id" : level.id, "state" : state })
	}

	// Add impacts
	if (levels.length) {
		for (var key in data.impact) {
			var impact = data.impact[key]
			var levelTrigger = levels.find(x => x.id == impact.levelId)
			var impactTargetArea = data.targetArea.find(x => x.id == impact.targetAreaId)

			// Check for nearby level and target area
			if (levelTrigger && impactTargetArea) {
				// Check level trigger is above normal range
				if(levelTrigger.state == 'above') {
					impacts.push(impact)
					hasImpacts = true
				}
			}
		}
	}

	// Add risk types and set booleans
	if (postcodes) {
		var tmpRiskTypeIds = []
		for (var key in postcodes) {
			var riskTypeIds = postcodes[key].riskTypes
			for (var key in riskTypeIds) {
				var riskTypeId = data.riskType.find(x => x.id == riskTypeIds[key]).id
				if (tmpRiskTypeIds.indexOf(riskTypeId) == -1) {
					tmpRiskTypeIds.push(riskTypeId)
				}
				if (riskTypeId == 1) {
					hasRiskRiver = true
					hasRiskRiverCoastOrResovoir = true
				}
				if (riskTypeId == 2) {
					hasRiskCoast = true
					hasRiskRiverCoastOrResovoir = true
				}
				if (riskTypeId == 3) {
					hasRiskResovoir = true
					hasRiskRiverCoastOrResovoir = true
				}
				if (riskTypeId == 4 ) {
					hasRiskSurface = true
				}
				hasRisk = true
			}
		}
		// Order risktypes as per data source
		for (var key in data.riskType) {
			if (tmpRiskTypeIds.indexOf(data.riskType[key].id) > -1) {
				riskTypes.push(data.riskType[key].name)
			}
		}
	}

	// Build risk types string
	if (riskTypes.length) {
		var tmpRiskTypes = riskTypes
		for (var key in tmpRiskTypes) {
			switch (tmpRiskTypes[key]) {
				case 'river' :
					tmpRiskTypes[key] = 'rivers'
					break
				case 'river' :
					tmpRiskTypes[key] = 'the sea'
					break
				case 'river' :
					tmpRiskTypes[key] = 'resovoirs'
					break
				case 'river' :
					tmpRiskTypes[key] = 'surface water'
					break
			}
		}
		riskTypesString = tmpRiskTypes.join(', ').replace(/,(?!.*,)/gmi, ' or ')
	}
	
	// Set intersect alert or warning boolean
	if (hasIntersectAlert || hasIntersectWarning || hasIntersectWarningSevere) {
		hasAlertOrWarning = true
		hasIntersectAlertOrWarning = true
	}

	// Set has nearby target area and alert or wanring booleans
	if (hasAlert || hasWarning || hasWarningSevere) {
		hasAlertOrWarning = true
		hasTargetArea = true
	}

	// Build model and return
	return {

		scenario,
		path, // Url parameter
		location, // Full location name
		warningsSevere, // List of nearby severe warnings
		warnings, // List of nearby warnings
		alerts, // List of nearby alerts
		targetAreaAll, // List of nearby target areas
		intersectingTarget, // The intersecting target area

		levelState, // Above, normal or below
		levels, // Levels that impact location
		impacts, // List of nearby impacts

		targetAreaStates, // Openlayers list of states for each target area
		riverLevelStates, // Opelayers list of states for all river levels
		levelsJSON, // Openlayers feature collection
		lonLat, // Openlayers location centroid

		hasRisk,
		hasRiskRiverCoastOrResovoir,
		riskTypesString,

		hasPostcode, // Check if postcode or town
		hasImpacts, // Nearby impacts
		
		hasWarningSevere,
		hasWarning,
		hasAlert,
		hasAlertOrWarning,
		hasTargetArea,

		hasIntersectWarningSevere,
		hasIntersectWarning,
		hasIntersectAlert,
		hasIntersectAlertOrWarning,
		hasIntersectTarget

	}

}

// Get a location by its name
exports.getLocationPathFromValue = function(name, scenario) {
	var location
	// Find in towns
	location = data.town.find(
		x => x.name.toLowerCase() === name.toLowerCase()
	)
	// If not a town check postcodes
	if (!location) {
		location = data.postcode.find(
			x => x.name.toLowerCase() === name.toLowerCase()
		)
	}
	// If location exists build model and return
	if (location) {	
		return location.path
	}
	return ''
}