import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';

// Obtendo a chave secreta do ambiente
const secretKey = process.env.SECRET_KEY;

// Função para criar um token JWT
const createToken = async (user: any) => {
    if (!secretKey) throw new Error('Chave do token está vazia.');
    const token = jwt.sign({ id: user }, secretKey, { expiresIn: '1h' });
    return token;
}

// Middleware para verificar o token JWT
async function verifyToken(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) return res.status(401).json({ auth: false, message: 'É necessário fazer login para acessar esta página.' });

    try {
        if (!secretKey) throw new Error('Chave do token está vazia.');
        const decoded: any = jwt.verify(token, secretKey);
        (req as any).user = decoded
        next();
    } catch (error) {
        return res.status(401).json({ auth: false, message: 'Sessão expirada. Faça login novamente.' });
    }
}

export { createToken, verifyToken }
