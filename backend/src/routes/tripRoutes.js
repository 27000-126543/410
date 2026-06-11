const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, tripController.publishTrip);
router.get('/', authMiddleware, tripController.getTripList);
router.get('/search', authMiddleware, tripController.searchTrips);
router.get('/my', authMiddleware, tripController.getMyDrivenTrips);
router.get('/:id', authMiddleware, tripController.getTripDetail);
router.put('/:id', authMiddleware, tripController.updateTrip);
router.put('/:id/cancel', authMiddleware, tripController.cancelTrip);
router.put('/:id/start', authMiddleware, tripController.startTrip);
router.put('/:id/complete', authMiddleware, tripController.completeTrip);

router.post('/:tripId/join', authMiddleware, tripController.requestJoinTrip);
router.put('/passengers/:tripPassengerId/handle', authMiddleware, tripController.handlePassengerRequest);
router.put('/passengers/:tripPassengerId/confirm', authMiddleware, tripController.passengerConfirmTrip);
router.put('/passengers/:tripPassengerId/board', authMiddleware, tripController.boardPassenger);

module.exports = router;
