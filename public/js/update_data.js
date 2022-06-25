const web3 = new Web3(window.ethereum);
$(document).ready(function () {
    update();
})
function update(){
    if(!user.id){
        return;
    }
    fetch('http://localhost:9000/token_balance').then(response => {
        return response.json();
    }).then(json => {
        user.pok = json;
        $("#eth_pocket").html(user.pok/10**10)
    }).catch(err => {
        console.log(err);
        res.send(err)
    });
    setTimeout(update,2000 /* 2 seconds */)
}