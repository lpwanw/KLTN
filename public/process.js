const web3 = new Web3(window.ethereum);
$(document).ready(function () {
    renderMonsters()
    // fetch('http://localhost:3000/monsters?id_player=' + user).then(response => {
    //     return response.json();
    // }).then(json => {
    //     content = ''
    //     json.forEach(monster => {

    //     })
    //     $("#container").html(content)
    // }).catch(err => {
    //     console.log(err);
    // });


    $("#login").click(()=>{
        connect_MM().then(function (data){
            var rand = randomString(100);
            localStorage.setItem("address_wallet", data[0]);
            web3.eth.defaultAccount = data[0];
            web3.eth.personal.sign(rand, data[0], (error, hash) => {
                if(!error){
                    let account = web3.eth.accounts.recover(rand, hash)
                    $("#address").html("Wallet: "+ account)
                    document.getElementById("address_input").value=account;
                    document.getElementById("loginForm").submit();
                }else{
                    alert("Connect Metamask and refresh the page")
                    console.log(error)
                }
            })
        })
    })

    $("#logout").click(()=>{
        user = {}
        document.getElementById("loginForm").submit();
    })
});

async function connect_MM(){
    let accounts

    try {
        accounts = ethereum.request({ method: 'eth_requestAccounts' });
    }
    catch(err) {
        alert("Ethereum is missing please install")
    }

    return accounts
}

function randomString(long){
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < long; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function is_login(){
    if(localStorage.getItem('address_wallet') !== null){
        return true
    }
    return false
}
function renderMonsters(){
    // content = ''
    // if(!user){
    //     return
    // }
    // if(!cmonsters){
    //     content = "Hiện không có quái thú trong tủ đồ"
    //     $("#container").html(content)
    //     return;
    // }
    // cmonsters.forEach(monster => {
    //     content += `
    //             <div class="card mx-2" style="width: 18rem;">
    //                 <img class="card-img-top" src="${monster.avatar}" alt="Card image cap">
    //                     <div class="card-body">
    //                         <h5 class="card-title">${monster.name}</h5>
    //                         <p class="card-text">${monster.description}</p>
    //                         <a href="#" class="btn btn-primary">Go somewhere</a>
    //                     </div>
    //             </div>
    //          `
    // })
    // $("#container").html(content)
}