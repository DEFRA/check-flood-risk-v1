const utilities = require('../utilities/utilities.js')
var data = require('../data/data.json')
var fuse = require('fuse.js')

// Get a location by its name
exports.getProperty = function(address, error) {

	address = address || ''
	error = error || false

	var model = {}, source = [], result = [], property = []

	// Define booleans
	model['hasAddress'] = false

	// Create array of all address objects
	for (var i = 0; i < data.firstLine.length; i++) {
		postcode = data.postcode.find(x => x.id == data.firstLine[i].postcodeId)
		town = data.town.find(x => x.id == postcode.townId)
		county = data.county.find(x => x.id == town.countyId)
		source.push(
			{
				'firstLine' : {
					'premises' : data.firstLine[i].premises,
					'street' : data.firstLine[i].street
				},
				'postcode' : postcode.name,
				'town' : town.name,
				'county' : county.name
			}
		)
	}	

	// Fuse fuzzy search
	var options = {
		shouldSort: true,
		threshold: 0.2,
		location: 0,
		distance: 100,
		maxPatternLength: 32,
		minMatchCharLength: 1,
		keys: [
			'firstLine.premises',
			'firstLine.street',
			'postcode',
			'town',
			'county'
		]
	}
	var f = new fuse(source, options)
	result = f.search(address);

	// Set has address flag
	if (result.length) {
		model['hasAddress'] = true
	}

	// Add input and results to model
	model['address'] = address
	model['result'] = result

	// If no existing address add error details
	if (!result.length) {
		model['isError'] = true
		model['errors'] = { 'address' : { 'type' : 'any.empty', 'message' : '' } }
	}

	// If error add error details
	if (error) {
		var errors
		if(error && error.data) {
			errors = utilities.extractValidationErrors(error) // the error field + message
		}
		model['isError'] = true
		model['errors'] = errors
	}

	// Return model
	return model

}