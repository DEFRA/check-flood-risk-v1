const utilities = require('../utilities/utilities.js')
var data = require('../data/data.json')

// Get a location by its name
exports.getProperty = function(path, premises, postcode, scenario, error) {

	premises = premises || ''
	postcode = postcode.replace(/-/g, ' ') || ''
	scenario = scenario || 'a'
	error = error || false

	var model = {}, property = []

	// Form values to model
	model['premises'] = premises
	model['postcode'] = postcode
	model['scenario'] = scenario
	model['path'] = path

	// Try to set postcode to object
	postcode = data.postcode.find( x => x.path == postcode.replace(/ /g,'-').toLowerCase() )
	
	// Tidy inputs
	premises = premises.toLowerCase()
	scenario = scenario.toLowerCase()

	// Set country properties if postcode exists
	if (typeof postcode === 'object') {
		var countryCode , countryName
		switch(postcode.country) {
			case 's':
				countryCode = 's'
				countryName = 'Scotland'
				break
			case 'w':
				countryCode = 'w'
				countryName = 'Wales'
				break
			case 'ni':
				countryCode = 'ni'
				countryName = 'Northern Ireland'
				break
			default:
				countryCode = 'e'
				countryName = 'England'
		}
		model['countryCode'] = countryCode
		model['countryName'] = countryName

		// Set is England boolean
		if (countryCode == 'e') {
			model['isEngland'] = true
		} else {
			model['isEngland'] = false
		}

		// FInd only firstlines that match the postcode
		if (premises != '') {

			// Filter first lines that match the premises
			firstLine = data.firstLine.filter(function(x){
				// If premises containes a name, flat or apartment
				if (isNaN(x.premises)) {
					var premisesStreet = x.premises.concat(', ' + x.street).toLowerCase()
					return premisesStreet.includes(premises.toLowerCase()) ? true : false
				} 
				// If premises is a number
				else {
					return x.premises.toLowerCase() == premises.toLowerCase() ? true : false
				}
			})

			// Filter first lines premises matches that match the postcode
			firstLine = firstLine.filter(x => x.postcodeId == postcode.id)

			// If firstLine(s) found build property/address list
			if (firstLine.length) {
				firstLine.forEach(function (item) {
					// Add comma to non number premises
					itemPremises = isNaN(item.premises) ? item.premises + ', ' : item.premises
					// Get street
					itemStreet = item.street
					// Get postcode for address
					itemPostcode = postcode.name
					// Get town for postcode
					itemTown = data.town.find( x => x.id == postcode.townId).name
					// Concatenate the address
					address = itemPremises + ' ' + itemStreet + ', ' + itemTown + ', ' + itemPostcode
					// Create the path
					path = address.replace(/,\s+/g,'/').replace(/\s+/g, '-').toLowerCase()
					// Add item to list
					property.push({ 'address' : address, 'path' : path })
				})
				model['property'] = property
			}

		}
	}

	// Set has existing address boolean
	if (model['property']) {
		model['hasExistingAddress'] = true
	} else {
		model['hasExistingAddress'] = false
	}
	
	// Set is single result boolean
	if (model['property']) {
		if (model.property.length == 1) {
			model['isSingle'] = true
		} 
	} else {
		model['isSingle'] = false
	}

	// If no existing address add error details
	if (!model.hasExistingAddress) {
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