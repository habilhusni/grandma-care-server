const express     = require('express');
const router      = express.Router();
const userControl = require('../controller/userController');
const auth        = require('../helper/auths');
const passport    = require('passport');

router.get('/users', auth.authenticate, userControl.getUser);
router.get('/users/:userId', auth.authenticate, userControl.getOneUser);
router.get('/users/:userId/panic', auth.authenticate, userControl.panicButton);
router.post('/signup', userControl.createUser);
router.post('/login', passport.authenticate('local', { session: false }), userControl.login);
router.put('/users/:userId/add/:friendEmail', auth.authenticate, userControl.addFriend);
router.put('/users/:userId', auth.authenticate, userControl.updateUser);
router.put('/users/:userId/location/:latitude/:longitude', auth.authenticate, userControl.updateLocation);
router.put('/users/:userId/accelero/:x/:y/:z', auth.authenticate, userControl.updateSensor);
router.delete('/users/:userId', auth.authenticate, userControl.delUser);
router.delete('/users/:userId/remove/:friendId', auth.authenticate, userControl.removeFriend);

module.exports = router;
