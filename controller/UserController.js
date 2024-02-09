const router = require("express").Router();
const {UserModel} = require('../dbmodel/db');
const mongoose=require('mongoose');
const ejs = require("ejs");
const ifsc=require('ifsc');
const request=require('request');
const path=require('path');

const viewsPath = path.join(__dirname);




router.get('/',(req,res)=>{
    res.render('home');

})

router.get('/getDetail',(req,res)=>{
    res.render('ViewData')
})

router.post('/getDetail',(req,res)=>{
    const id=req.body.userId;
    

    res.redirect(`/getDetail/${id}`);
})

router.get('/getdetail/:id',async (req,res)=>{
    const id=req.params.id;
    let data;
   try {
   data = await UserModel.findOne({ user_id: id });
  
  console.log(data);
} catch (error) {
 
  console.error("89",error);
}


    if(data){
      
        res.render('data',{data});
    }else{
        let msg="No user Found, Please register First"
        res.render('Register',{msg});
    }

  

    
  })

router.get('/register',async (req,res)=>{
    res.render('Register');
})  

router.post('/register',async (req,res)=>{
    const uid=req.body.userId;
    const name=req.body.userName;
    const bankaccount=req.body.BankAccount;
   
    const user = await UserModel.findOne({ user_id: uid });

    if(user){
        let msg="User Id already registered";
        res.render('Register',{msg})
    }else{
        await insertData(req,res);
    }

    
  })


  async function insertData(req,res){

   try{ let bankid=req.body.BankAccount;
    if(ifsc.validate(bankid)==false){
        let msg="Invalid IFSC";
        res.render('Register',{msg});
    }
    await ifsc.fetchDetails(bankid).then(function(result) {
        request(`https://api.openweathermap.org/data/2.5/weather?q=${result.CITY}&appid=4de4db30a24565b1ba581198fbedf9e4`,(err,response,body)=>{
            if (err) {
                console.error("Error in Weather API request:", err);
                // Handle the error response to the client if needed
                res.status(500).send('Internal Server Error');
                return;
            }


            if(response.statusCode===200){

                let data=JSON.parse(body);
                const user= new UserModel({
                        user_id:req.body.userId,
                        user_name: req.body.userName,
                        bank_accounts: req.body.BankAccount,
                        name: req.body.userName,
                        accounts: {
                          bank:result.BANK,
                          branch: result.BRANCH,
                          address: result.ADDRESS,
                          city: result.CITY,
                          district: result.DISTRICT,
                          state: result.STATE,
                          bank_code: result.BANKCODE,
                          weather: {
                            temp: data.main.temp,
                            humidity: data.main.humidity
                          }
                        }
                })
                
            
                user.save()
                .then(result => {
                    
                    console.log("done registration",result);
                    let data="registration done";
                    res.render('home',{})
                  })
                  .catch(err => {
                    
                    console.error("Faild to register db",err);
                  });


                

            }else {
                
                console.error("Weather API returned non-200 status code:", response.statusCode);
                
                res.status(500).send('Internal Server Error');
            }
        }) 


     });
   }catch(error){
    console.log("error in fetching bank data",error)
   }

 }





 module.exports = router;
