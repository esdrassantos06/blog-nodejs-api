import express from 'express';
import { Sequelize, DataTypes } from 'sequelize';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3000;

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


sequelize.sync()
    .then(() => console.log("PostgreSQL database & tables created!"))
    .catch(err => console.error("Error syncing database:", err));


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
        const blogs = await Blog.findAll();
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


app.listen(port, () => {
    console.log(`🚀 Server running on Port ${port}`)
});


