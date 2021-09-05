//requirement :
require('dotenv').config();
const express =  require('express');
const Joi =  require('joi'); //class
const mongoose = require('mongoose');

//db connection and configuration
mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error' , (error) => console.error(error))
db.once('open' , () => console.log('Data base Connected'))

//app init
const app = express();

//middleware
app.use(express.json());

//routers
//-----------users Router-------------------
const userRouter = require('./routers/user')
app.use('/user' , userRouter)


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
app.listen(port, () => console.log(`lessening on ${port}`));