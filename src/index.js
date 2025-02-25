import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const { Schema } = mongoose;

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.error("Error when trying to connect the DB", error))


const blogSchema = new Schema({
    title: String,

    author: String,

    description: String,

    age: Number,
});


const Blog = mongoose.model('Blog', blogSchema);


//GET pelo ID
app.get('/blog/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
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
        const blogs = await Blog.find();
        res.send(blogs);
    }
    catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Rota DELETE
app.delete('/blog/:id', async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) return res.status(404).send({ message: "Blog not Found" })
        res.send(blog);
    }
    catch (err) {
        res.status(500).send({ error: err.message });
    }

})

// Rota PUT (atualizar)
app.put('/blog/:id', async (req, res) => {

    try {
        const blog = await Blog.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            author: req.body.author,
            description: req.body.description,
            age: req.body.age
        },
            { new: true }
        )
        if (!blog) return res.status(404).send({ message: "Blog não encontrado" });
        res.send(blog);
    }
    catch (err) {
        res.status(500).send({ error: err.message });
    }

})


// Rota POST (criar)
app.post('/blog', async (req, res) => {
    try {
        const blog = new Blog({
            title: req.body.title,
            author: req.body.author,
            description: req.body.description,
            age: req.body.age,
        });

        await blog.save();

        res.status(201).send(blog);
    }
    catch (err) {
        res.status(500).send({ error: err.message });
    }
})


app.listen(port, () => {
    mongoose.connect(process.env.MONGO_URL);
    console.log(`🚀 Server running on Port ${port}`)
});


