import { Router } from 'express'
import { createUser, getGame, getGames, getUserGames, includeUserGames, login, searchGames, verifyUser } from '../controllers/controller'
import { verifyToken } from '../middlewares/jwt';
const router = Router();



router.get('/getGames', getGames)
router.get('/searchGames', searchGames)
router.get('/getGame', getGame)
router.post('/login', login)
router.get('/verifyUser', verifyToken, verifyUser)
router.post('/includeUserGames', verifyToken, includeUserGames)
router.post('/createUser', createUser)

router.get('/getUserGames', verifyToken, getUserGames)





export default router


