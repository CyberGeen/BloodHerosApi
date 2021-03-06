//requirement :
require('dotenv').config();
const express =  require('express');
const Joi =  require('joi'); //class
const mongoose = require('mongoose');
const cors = require('cors')

//db connection and configuration
mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error' , (error) => console.error(error))
db.once('open' , () => console.log('Data base Connected'))

//app init
const app = express();

//middleware
app.use(express.json());
//handling core problem (allowing acc from multiple server)
//TODO: once deployed we specify who get it and what methodes they are allowed to use
app.use(cors({
    origin: "*"
}))

//routers
//-----------users Router-------------------
const userRouter = require('./routers/user')
app.use('/user' , userRouter)
//-----------posts Router-------------------
const postRouter = require('./routers/post')
app.use('/post' , postRouter)
//-----------create Router------------------
const createRouter = require('./routers/create')
app.use('/create' , createRouter)
//------------reports Router---------------
const reportRouter = require('./routers/reports')
app.use('/reports' , reportRouter)


//temp state 
state = [
    {user_name:'1' , email:'1' , password:'1' , info:'1'} ,
    {user_name:'2' , email:'2' , password:'2' , info:'2'} ,
    {user_name:'3' , email:'3' , password:'3' , info:'3'} 
]

app.get('/' , (req , res) => {
    res.send(state);
});


//making the port dynamic depending on the enviement
const port = process.env.PORT || 3000;
//lessen to req (param , func runs when lessening)
app.listen(port, () => console.log(`listening on port ${port}`));