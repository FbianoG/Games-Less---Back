import { Router } from 'express'
import { createUser, deleteStore, getGame, getGames, getUserGames, getUserStore, includeUserGames, includeUserStore, login, searchGames, verifyUser } from '../controllers/controller'
import { verifyToken } from '../middlewares/jwt';
const router = Router();

// Routes --->
router.post('/login', login)
router.post('/createUser', createUser)

router.get('/getGames', getGames)
router.get('/getGame', getGame)
router.get('/searchGames', searchGames)
router.get('/getUserGames', verifyToken, getUserGames)
// router.get('/verifyUser', verifyToken, verifyUser)
router.post('/includeUserGames', verifyToken, includeUserGames)
router.post('/includeUserStore', verifyToken, includeUserStore)
router.post('/deleteStore', verifyToken, deleteStore)
router.get('/getUserStore', verifyToken, getUserStore)

export default router