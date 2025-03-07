import express from 'express';
import { Sequelize, DataTypes } from 'sequelize';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3000;

const API_KEY = process.env.API_KEY;

const sequelize = new Sequelize(process.env.DATABASE_URI, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // necessário para alguns provedores de hospedagem
        }
    }
});


const Blog = sequelize.define('Blog', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    age: {
        type: DataTypes.INTEGER
    }
}, {
    timestamps: true // adiciona automaticamente createdAt e updatedAt
});

async function reorganizeIds() {
    try {
        const transaction = await sequelize.transaction();

        try {

            await sequelize.query('CREATE TABLE "Blogs_temp" AS SELECT title, author, description, age, "createdAt", "updatedAt" FROM "Blogs" ORDER BY "createdAt";', { transaction });

            await sequelize.query('TRUNCATE TABLE "Blogs" RESTART IDENTITY;', { transaction });

            await sequelize.query('INSERT INTO "Blogs" (title, author, description, age, "createdAt", "updatedAt") SELECT title, author, description, age, "createdAt", "updatedAt" FROM "Blogs_temp";', { transaction });

            await sequelize.query('DROP TABLE "Blogs_temp";', { transaction });

            await transaction.commit();
            console.log('Todos os IDs foram reorganizados sequencialmente');
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Erro ao reorganizar IDs:', error);
    }
}


sequelize.sync()
    .then(async () => {
        console.log("PostgreSQL database & tables created!")
        try {
            const count = await Blog.count();

            if (count > 0) {
                await sequelize.query(`
                        SELECT setval(pg_get_serial_sequence('"Blogs"', 'id'), 
                        (SELECT MAX(id) FROM "Blogs"));
                    `);
                console.log("Sequência de IDs atualizada com sucesso!");
            }
            else {
                // Se não houver registros, reinicia a sequência do 1
                await sequelize.query(`ALTER SEQUENCE "Blogs_id_seq" RESTART WITH 1;`);
                console.log("Sequência de IDs reiniciada para 1!");
            }
        }
        catch (err) {
            console.error("Erro ao ajustar sequência de IDs:", err);
        }
    })
    .catch(err => console.error("Error syncing database:", err));

// Middleware para verificar autenticação em métodos não-GET
app.use((req, res, next) => {
    if (req.method === 'GET') {
        return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: "Unauthorized. Missing or invalid token."
        });
    }

    const token = authHeader.split(' ')[1];

    if (token !== API_KEY) {
        return res.status(401).json({
            message: "Unauthorized. Invalid token."
        });
    }

    next();
})



//GET pelo ID
app.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findByPk(req.params.id);
        if (!blog) return res.status(404).send({ message: "Blog not Found" })
        res.send(blog);
    }
    catch (err) {
        res.status(500).send({ error: err.message })
    }
})

// GET ALL
app.get('/', async (req, res) => {
    try {
        const blogs = await Blog.findAll({ order: [['id', 'ASC']] });
        res.send(blogs);
    }
    catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Rota DELETE
app.delete('/:id', async (req, res) => {
    try {
        const blog = await Blog.findByPk(req.params.id);
        if (!blog) return res.status(404).send({ message: "Blog not Found" });

        await blog.destroy();
        await reorganizeIds();
        res.send({ message: "Blog deleted successfully" });
    }
    catch (err) {
        res.status(500).send({ error: err.message });
    }

})

// Rota PUT (atualizar)
app.put('/:id', async (req, res) => {

    try {
        const blog = await Blog.findByPk(req.params.id);
        if (!blog) return res.status(404).send({ message: "Blog não encontrado" });

        await blog.update({
            title: req.body.title,
            author: req.body.author,
            description: req.body.description,
            age: req.body.age
        });

        res.send(blog);
    }
    catch (err) {
        res.status(500).send({ error: err.message });
    }

})


// Rota POST (criar)
app.post('/', async (req, res) => {
    try {
        const blog = await Blog.create({
            title: req.body.title,
            author: req.body.author,
            description: req.body.description,
            age: req.body.age
        });

        res.status(201).send(blog);
    }
    catch (err) {
        res.status(500).send({ error: err.message });
    }
})

app.post('/admin/reorganize-ids', async (req, res) => {
    try {
        await reorganizeIds();
        res.status(200).send({ message: "IDs reorganizados com sucesso" });
    }
    catch (err) {
        res.status(500).send({ error: err.message });
    }
});


app.listen(port, () => {
    console.log(`🚀 Server running on Port ${port}`)
});


