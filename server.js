var express = require('express');
var bodyParser = require("body-parser");
let fetch = require('node-fetch');
var app = express();
var server = require("http").Server(app);

var Web3 = require("Web3")
var web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/"))
const awaitTransactionMined = require ('await-transaction-mined');
require('dotenv').config();
const API_URL = process.env.API_URL;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3NFT = createAlchemyWeb3(API_URL);
const contractEnby = require("./artifacts/contracts/Enby.sol/Enby.json")
const POK_ABI =  require("./contracts/POK.json")
const POK_contract = "0x1c136599D594F2dB66BA5392eba26588FEC15EB5"
const POK_c_ins = new web3NFT.eth.Contract(POK_ABI, POK_contract)
const contractDraggle = require("./artifacts/contracts/Draggle.sol/Draggle.json")
const contractAddressEnby = "0x050e5D5235a453D1c02271cE56b14586b4C6c9AE"
const contractAddressDraggle = "0x74CA414c4793A54e0c0812E3119fE62C925Eebbb"
const contractList = [
    {
        contract: contractEnby,
        address: contractAddressEnby
    },
    {
        contract: contractDraggle,
        address: contractAddressDraggle
    }
]
const nftContractList = [
    new web3NFT.eth.Contract(contractList[0].contract.abi, contractList[0].address),
    new web3NFT.eth.Contract(contractList[1].contract.abi, contractList[1].address)
]
app.set("view engine","ejs");
app.set("views","./views");
app.use(express.json());
app.use(express.static("public"));
app.use("/scripts", express.static(__dirname + "/node_modules/web3.js-browser/build/"))
app.use(bodyParser.urlencoded({extend: true}))
var session = require('express-session')
const {response} = require("express");
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))

app.get('/', async (req, res) => {
    user_data = req.session.user_data
    current_user = req.session.current_user
    if(!user_data){
        user_data = "{}"
    }
    if(!current_user){
        current_user = null
    }
    console.log("sesstion:" + req.session.current_user)
    res.render("home", {
        current_user: current_user,
        user_data: JSON.parse(user_data)
    })
})

app.post('/login', (req,res) =>{
    if(!req.body.address){
        res.send(req.body);
    }else{
        req.session.current_user = req.body.address;
        fetch('http://localhost:3000/players?id=' + req.session.current_user).then(response => {
            return response.json();
        }).then(json => {
            if(!json[0]){
                res.send('not registers')
                fetch("http://localhost:3000/players", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    mode: 'cors',
                    credentials: 'same-origin',
                    body: JSON.stringify({
                        id: req.session.current_user
                    })
                });
                return;
            }
            if (json[0].id === req.session.current_user) {
                req.session.user_data = JSON.stringify(json[0])
                req.session.save()
                res.render("home", {
                    current_user: req.session.current_user,
                    user_data: json[0]
                })
            }else{
                current_user = null
                res.render("home", { current_user: null })
            }
        }).catch(err => {
            console.log(err);
            res.send(err)
        });
    }
})

app.post('/logout', (req,res) =>{
    current_user = null
    req.session.user_data = "{}"
    req.session.current_user = null
    res.render("home", {
        current_user: current_user,
        user_data: {}
    })
})

app.get('/game', (req, res) => {
    res.render("game")
})

app.get('/token_balance', async (req,res) => {
    if(!req.session.current_user){
        res.render("home",{
            current_user: null,
            user_data: {}
        })
        return;
    }
    json = await POK_c_ins.methods.balanceOf(req.session.current_user).call()
    res.send(json)
})

app.get('/play_pokemon', (req, res) => {
    user_data = req.session.user_data
    current_user = req.session.current_user
    if(!req.session.user_data){
        res.render("home", {
            current_user: null,
            user_data: {}
        })
        return;
    }
    fetch('http://localhost:3000/players?id=' + req.session.current_user).then(response => {
        return response.json();
    }).then(async (json) => {
        if (json[0].id === req.session.current_user) {
            let pok = await POK_c_ins.methods.balanceOf(req.session.current_user).call()
            json[0].pok = pok;
            console.log(json[0])
            req.session.user_data = JSON.stringify(json[0])
            req.session.save()
            await res.render("pokemon", {
                current_user: req.session.current_user,
                user_data: json[0],
                monsters: await getMonster(req.session.current_user)
            })
        }else{
            current_user = null
            res.render("home", { current_user: null })
        }
    }).catch(err => {
        console.log(err);
        res.render("404")
    });
})

app.post('/verify', (req, res) => {
    if(!req.body.random || !req.body.hash){
        res.send("failed");
    }else{
        let account = web3.eth.accounts.recover(req.body.random, req.body.hash)
        res.send(account)
    }
})

app.post('/sent', async (req, res) => {
    res.json(await sent_eth(PUBLIC_KEY, req.body.to, req.body.value, null))
})

app.post('/buy', async (req, res) => {
    res.json(await sent_eth(req.body.from, req.body.to, req.body.value, req.body.private_key))
})

app.get("/contract_data", async (req, res) => {
    if(!req.session.current_user){
        res.render("home", {
            current_user: null,
            user_data: {}
        })
        return;
    }
    if(!req.query.amount){
        res.send("failed");
    }else{
        let data = await POK_c_ins.methods.transfer(PUBLIC_KEY, req.query.amount).encodeABI()
        res.send(data);
    }
})

app.get("/valid_transaction", async (req,res)=>{
    if(!req.query.tx){
        res.send("failed");
        return;
    }else{
        const minedTxReceipt = await awaitTransactionMined.awaitTx(web3NFT, req.query.tx, {interval: 60000});
        res.send("Ok")
        return;
    }
})

server.listen(9000, () => console.log('Server runing on port 9000'))





async function sent_eth(from, to, value, private_key) {
    require('dotenv').config();
    const {API_URL, PRIVATE_KEY} = process.env;
    const {createAlchemyWeb3} = require("@alch/alchemy-web3");
    const web3 = createAlchemyWeb3(API_URL);
    private_key = private_key == null ? PRIVATE_KEY : private_key

    const nonce = await web3.eth.getTransactionCount(from, 'latest'); // nonce starts counting from 0

    const transaction = {
        'to': "0x1c136599D594F2dB66BA5392eba26588FEC15EB5",
        'gas': 53000,
        'from': '0xbCB90E966C4B740ED1c0f8D6b4a6FDFaECe9615F',
        'maxPriorityFeePerGas': 1000000108,
        'nonce': nonce,
        'data': await POK_c_ins.methods.transfer(to, value*(10**10)).encodeABI()
        // optional data field to send message or execute smart contract
    };
    const signedTx = await web3.eth.accounts.signTransaction(transaction, private_key)

    return web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (error, hash) {
        if (!error) {
            console.log("🎉 The hash of your transaction is: ",
                hash,
                "\n Check Alchemy's Mempool to views the status of your transaction!");
        } else {
            console.log("❗Something went wrong while submitting your transaction:", error)
        }
    });
}




async function get_user_info(address){
    return await fetch('http://localhost:3000/players?id=' + address).then(response => {
        return response.json();
    }).then(json => {
        if (json[0].id === address) {
            console.log("success")
            return json[0]
        }else{
            return "err"
        }
    }).catch(err => {
        return "err"
    });
}
async function getMonster(address){
    let result = [
        await nftContractList[0].methods.balanceOf(address).call(),
        await nftContractList[1].methods.balanceOf(address).call()
    ]
    let final = ""
    for (let i = 0; i < result.length; i++) {
        if(result[i] === "1") {
            final+= "contract=" + contractList[i].address +"&"
        }
    }

    let data = await fetch('http://localhost:3000/monsters?' + final.substring(0,final.length -1)).then(response => {
        return response.json();
    }).then(json => {
        return json;
    }).catch(err => {
        return err;
    });

    final = ""
    for (let i = 0; i < data.length; i++) {
        final += "monster_id=" + data[i].id + "&"
    }

    let energies = await fetch("http://localhost:3000/energy?" + final + "player_id=" +address).then(response => {
        return response.json();
    }).then(json => {
        return json;
    }).catch(err => {
        return err;
    });

    for (let i = 0; i < data.length; i++) {
        data[i].energy = energies[i].energy
        data[i].e_id = energies[i].id
    }
    return data
}
