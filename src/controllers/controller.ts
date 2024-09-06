import { Response, Request } from "express";
import pool from "../dataBase/db";
import { createToken } from "../middlewares/jwt";
import { comparePassword, hashPassword } from "../middlewares/brcrypt";

const login = async (req: Request, res: Response) => {
    const client = await pool.connect()
    try {
        let { login, password } = req.body
        if (!login || !password) return res.status(400).json({ message: 'Preencha todos os campos' })
        login = login.toLowerCase()

        const query = 'SELECT * FROM users WHERE login = $1;'
        const loginUser = await client.query(query, [login])
        if (loginUser.rows.length === 0) return res.status(404).json({ message: 'Login ou senha inválidos.' })

        const comparePasswords = await comparePassword(password, loginUser.rows[0].password)
        if (!comparePasswords) return res.status(400).json({ message: 'Login ou senha inválidos.' })
        delete loginUser.rows[0].password
        const token = await createToken(loginUser.rows[0])
        return res.status(200).json({ user: loginUser.rows[0], token })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Erro interno de servidor' })
    } finally {
        client.release()
    }
}

const createUser = async (req: Request, res: Response) => {
    const client = await pool.connect()
    try {
        let { login, password } = req.body
        if (!login || !password) return res.status(400).json({ message: 'Preencha todos os dados' })
        login = login.toLowerCase()

        const queryExists = 'SELECT EXISTS (SELECT 1 FROM users WHERE login = $1);'
        const exists = await client.query(queryExists, [login])
        if (exists.rows[0].exists) return res.status(400).json({ message: "Este login já está cadastrado." })

        const passwordHashed = await hashPassword(password)
        const insertQuery = `
        INSERT INTO users (login, password, create_at) 
        VALUES ($1, $2, $3);
        `
        const now = new Date()
        const values = [login, passwordHashed, now]
        await client.query(insertQuery, values)
        return res.status(201).json({ message: 'Conta criada com sucesso.' })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Erro interno de servidor." })
    } finally {
        client.release()
    }
}

const verifyUser = async (req: Request, res: Response) => {
    const client = await pool.connect()
    const userId = (req as any).userId
    try {
        const query = 'SELECT * FROM users WHERE id = $1;'
        const loginUser = await pool.query(query, [userId])
        delete loginUser.rows[0].password
        return res.status(200).json(loginUser.rows[0])
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Erro interno de servidor' })
    } finally {
        client.release()
    }
}

const getGames = async (req: Request, res: Response) => {
    const client = await pool.connect()
    try {
        const query = 'SELECT * FROM games;' // 'games' é a tabela
        const findAll = await pool.query(query) // Executar o comando de pesquisa
        if (findAll.rows.length === 0) return res.status(404).json({ message: 'Não há dados no DataBase.' })
        return res.status(200).json(findAll.rows)
    } catch (error) {
        return res.status(500).json({ message: 'Erro interno de servidor' })
    } finally {
        client.release()
    }
}

const searchGames = async (req: Request, res: Response) => {
    const client = await pool.connect()
    try {
        const text = req.query.search
        console.log(req.query)
        const searchQuery = 'SELECT * FROM games WHERE name ILIKE $1;' // 'games' é o nome da tabela
        const searchValue = '%John%'; // Substring a ser pesquisada
        const response = await pool.query(searchQuery, [`%${text}%`]);
        return res.status(200).json(response.rows)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Erro interno de servidor.' })
    } finally {
        client.release()
    }
}

const getGame = async (req: Request, res: Response) => {
    const client = await pool.connect()
    try {
        const gameId = req.query.id
        const searchQuery = 'SELECT * FROM games WHERE id = $1;' // 'games' é o nome da tabela
        const response = await pool.query(searchQuery, [gameId]);
        return res.status(200).json(response.rows)
    } catch (error) {
        return res.status(500).json({ message: 'Erro interno de servidor.' })
    } finally {
        client.release()
    }
}

const getUserGames = async (req: Request, res: Response) => {
    const client = await pool.connect()
    try {
        const { id } = (req as any).user.id
        const searchQuery = 'SELECT * FROM user_games WHERE user_id = $1;'
        const ress = await client.query(searchQuery, [id])
        return res.status(200).json(ress.rows)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Error interno de servidor.' })
    } finally {
        client.release()
    }
}

const includeUserGames = async (req: Request, res: Response) => {
    const client = await pool.connect()
    try {
        const { userId, gameId } = req.body
        const queryExists = 'SELECT EXISTS (SELECT 1 FROM user_games WHERE user_id = $1 AND game_id = $2);'
        const exists = await client.query(queryExists, [userId, gameId])
        if (exists.rows[0].exists) return res.status(400).json({ message: "Você já possui este jogo." })

        const now = new Date()
        const insertQuery = `INSERT INTO user_games (user_id, game_id, create_at) VALUES ($1, $2, $3);`
        const values = [userId, gameId, now]
        await client.query(insertQuery, values)
        return res.status(201).json({ message: "Jogo comprado com sucesso." })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Erro interno de servidor." })
    } finally {
        client.release()
    }
}

const includeUserStore = async (req: Request, res: Response) => {
    const client = await pool.connect()
    try {
        const { userId, gameId } = req.body

        // Exists
        const queryExists = 'SELECT EXISTS (SELECT 1 FROM user_store WHERE user_id = $1 AND game_id = $2);'
        const exists = await client.query(queryExists, [userId, gameId])
        if (exists.rows[0].exists) return res.status(400).json({ message: "Este jogo já está em seu carrinho." })

        const insertQuery = `INSERT INTO user_store (user_id, game_id) VALUES ($1, $2);`
        const values = [userId, gameId]
        await client.query(insertQuery, values)
        return res.status(201).json({ message: "Jogo incluído em seu carrinho. " })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Erro interno de servidor." })
    } finally {
        client.release()
    }
}

const getUserStore = async (req: Request, res: Response) => {
    const client = await pool.connect()
    try {
        const { id } = (req as any).user.id
        const searchQuery = 'SELECT * FROM user_store WHERE user_id = $1;'
        const store = await client.query(searchQuery, [id])
        return res.status(200).json(store.rows)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Error interno de servidor.' })
    } finally {
        client.release()
    }
}

const deleteStore = async (req: Request, res: Response) => {
    const client = await pool.connect()
    try {
        const { game_id } = req.body
        const user_id = (req as any).user.id.id
        console.log(user_id, game_id)
        const queryDelete = 'DELETE FROM user_store WHERE user_id = $1 AND game_id = $2;'
        const af = await client.query(queryDelete, [user_id, game_id])
        return res.status(200).json({ message: 'Jogo removido da sua lista de desejos!' })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Erro interno de servido.' })
    } finally {
        client.release()
    }
}

export { getGames, searchGames, getGame, login, verifyUser, includeUserGames, getUserGames, createUser, includeUserStore, getUserStore, deleteStore }