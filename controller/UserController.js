const router = require("express").Router();
const UserModel = require('../dbmodel/db');
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

    const data = await UserModel.findOne({ user_id: id });

    if(data){
        res.render('data',{data});
    }else{
        let msg="No user Found, Please register First"
        res.render('Register');
    }

  

    
  })

router.get('/register',async (req,res)=>{
    res.render('Register');
})  

router.post('/register', async (req, res) => {
    const uid = req.body.userId;
    const name = req.body.userName;
    const bankaccount = req.body.BankAccount;

    const user = await UserModel.findOne({ user_id: uid });

    if (user) {
        let msg = "User Id already registered";
        res.render('Register', { msg });
    } else {
        try {
            await insertData(req, res);
        } catch (error) {
            console.error("Error in insertData:", error);
            res.status(500).send('Internal Server Error');
        }
    }
});

async function insertData(req, res) {
    try {
        let bankid = req.body.BankAccount;
        if (ifsc.validate(bankid) == false) {
            let msg = "Invalid IFSC";
            res.render('Register', { msg });
            return;
        }

        const result = await ifsc.fetchDetails(bankid);

        request(`https://api.openweathermap.org/data/2.5/weather?q=${result.CITY}&appid=4de4db30a24565b1ba581198fbedf9e4`, async (err, response, body) => {
            if (err) {
                console.error("Error in Weather API request:", err);
                res.status(500).send('Internal Server Error');
                return;
            }

            if (response.statusCode === 200) {
                let data = JSON.parse(body);
                const user = new UserModel({
                    user_id: req.body.userId,
                    user_name: req.body.userName,
                    bank_accounts: req.body.BankAccount,
                    name: req.body.userName,
                    accounts: {
                        bank: result.BANK,
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
                });

                await user.save();
                console.log("done registration", user);
                res.render('home', {});
            } else {
                console.error("Weather API returned non-200 status code:", response.statusCode);
                res.status(500).send('Internal Server Error');
            }
        });
    } catch (error) {
        console.log("error in fetching bank data", error);
        res.status(500).send('Internal Server Error');
    }
}





 module.exports = router;
