// Para JS
//common JSes antigua y mas compatible que es la que se usa en este proyecto
//Es Module es la que se usa en otros proyectos y se necesita IMPORT y FROM

const express=require('express');
const mongoose= require('mongoose');
//const bodyparser=require('body-parser');
const cookieParser=require('cookie-parser');
const User=require('./models/user');
const db=require('./config/config').get(process.env.NODE_ENV);
const { auth } = require('./middleware/auth');


const app=express();
// app use
//Aqui hubo cambios!!
app.use(express.urlencoded({extended : false}));
app.use(express.json());
app.use(cookieParser());

// database connection
mongoose.Promise=global.Promise;
mongoose.connect(db.DATABASE,{ useNewUrlParser: true,useUnifiedTopology:true },function(err){
    if(err) console.log(err);
    console.log("database is connected");
});


// adding new user (sign-up route)
app.post('/api/register', async function(req,res){//todo los endpoints al backend empiezan con api
   // taking a user
   if(req.body.password!=req.body.password2)return res.status(400).json({message: "password not match"});
   const newuser=new User(req.body);
  // console.log(newuser);

  const user= await User.findOne({email: newuser.email});
  if(user) return res.status(400).json({ auth : false, message :"email exits"});
  try {
    const user =await newuser.save();
      res.status(200).json({
               succes:true,
               user : user
           });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success : false});
  }

   });



// login user
app.post('/api/login',async function(req,res){
    //Solo se usa LET cuando se redeclara un valor
    //let token=req.cookies.auth;

    const token=req.cookies.auth;
    //Para evitar el uso de callnacj usamos funciones asincronas
    //Manrejammos trycatch
    //Manehamos donde exista y ya eta logeado
    
    try {
        const user= await User.findByToken(token);
        if(user) return res.status(400).json({
            error :true,
            message:"You are already logged in"
        });
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:error});
    }


    try {
        const user=  awaitUser.findOne({'email':req.body.email});
        if(!user) return res.status(400).json({isAuth : false, message : ' Auth failed'});
        const {e, isMatch}=user.comparepassword(req.body.password);
        if(!isMatch && e) return res.status(400).json({ isAuth : false,message : "Auth failed"});

        await user.generateToken();
        return res.status(200).cookie("auth", user.token).json({
            isAuth:true,
            id:user_id,
            email:user.email
        });
 
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:error});
    }

//]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]

            });

//logout user
 app.get('/api/logout',auth,async function(req,res){

    try {
        await req.user.deleteToken();
        res.sendStatus(200);
    } catch (error) {
        return res.status(500).json({msg:error });
    }

    }); 

// get logged in user
app.get('/api/profile',auth,function(req,res){
        res.json({
            isAuth: true,
            id: req.user._id,
            email: req.user.email,
            name: req.user.firstname + req.user.lastname
            
        })
});


app.get('/',function(req,res){
    res.status(200).send("Welcome to login , sign-up api");
});

// listening port
const PORT=process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log("app is live at ${PORT}");
});