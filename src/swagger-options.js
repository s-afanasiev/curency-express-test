const PORT = process.env.PORT || 3000;
module.exports = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Test Currency API',
        version: '1.0.0',
        description: 'API description',
      },
      servers: [
        {
          url: `http://localhost:${PORT}`,
        },
      ],
    },
    apis: ['./server.js'], // Путь к файлам, содержащим комментарии JSDoc
  };