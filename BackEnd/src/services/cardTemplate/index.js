import express from 'express';
import cardTemplateRoutes from './cardTemplate.routes.js';

const app = express.Router();

app.use('/api/card-templates', cardTemplateRoutes);

export default app;
