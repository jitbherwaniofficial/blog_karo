const { Router } = require('express');
const multer = require('multer')
const path = require('path');
const Blog = require('../model/blog');
const Comment = require('../model/comment');

const router = Router();


// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, path.resolve(`./public/uploads`))
//     },
//     filename: function (req, file, cb) {
//       const fileName = `${Date.now()}-${file.originalname}`;
//       cb(null, fileName)
//     }
//   })
  
// const upload = multer({ storage: storage })

const FILE_TYPE_MAP = {
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg',
}


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Not A Valid Image Type');
        if(isValid){
            uploadError = null;
        }
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
})
const uploadOption = multer({ storage: storage })


router.get('/add-new', (req,res) => {
    return res.render('addBlog', {
        user: req.user,
    })
});

router.get('/:id', async(req,res) => {
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    const comments = await Comment.find({blogId: req.params.id}).populate("createdBy");
    return res.render("blog", {
        user: req.user,
        blog:blog,
        comments: comments
    })
})

router.post('/', uploadOption.single("coverImage"),async(req,res) => {
    const file = req.file;
    if(!file){
        return res.status(400).send("No Image in the Request");
    }

    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    const {title, body } = req.body;
    const blog = await Blog.create({
        body,
        title,
        createdBy: req.user._id,
        coverImageURL: `${basePath}${fileName}`
        // coverImageURL: `/uploads/${req.file.filename}`
    })
    return res.redirect(`/blog/${blog._id}`)
})

router.post('/comment/:blogId', async (req,res) => {
    await Comment.create({
        content: req.body.content,
        blogId: req.params.blogId,
        createdBy: req.user._id
    })
    return res.redirect(`/blog/${req.params.blogId}`)
})


module.exports = router;