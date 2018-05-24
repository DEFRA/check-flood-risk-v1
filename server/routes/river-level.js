module.exports = [
	{
		method: 'GET',
		path: '/river-level',
		config: {
			handler: function (request, reply) {

				var model = {}

				return reply.view('river-levels/river-level', {
					'pageTitle' : 'River level - GOV.UK',
					'model' : {}
				})

			}
		}
	}
]