export const corsOptions = {
    origin: 'https://game-less.vercel.app',
    methods: 'GET,PUT,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true
}