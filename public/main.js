// Immediately invoked function expression
// to not pollute the global scope
wheelValues = ['snowman', 'dragon', 'unicorn', 'kuala', 'bug', 'dorphin', 'seen', 'frog'].reverse()
var divider = 360 / wheelValues.length;

(function() {
    const wheel = document.querySelector('.wheel');
    const startButton = document.querySelector('.button');
    let deg = 0;

    startButton.addEventListener('click', async () => {
        let account = sessionStorage.getItem('account');
        if(account == null) return;
        // Disable button during spin
        startButton.style.pointerEvents = 'none';
        // Calculate a new rotation between 5000 and 10 000
        deg = Math.floor(5000 + Math.random() * 5000);
        // Set the transition on the wheel
        wheel.style.transition = 'all 10s ease-out';
        // Rotate the wheel
        wheel.style.transform = `rotate(${deg}deg)`;
        // Apply the blur
        wheel.classList.add('blur');
        var index = Math.floor(((deg) % 360) / divider);
        fetch('http://localhost:9000/sent', {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({to: account, value: index})
        }).then(res => res.json())
            .then(res => console.log(res));
    });

    wheel.addEventListener('transitionend', () => {
        // Remove blur
        wheel.classList.remove('blur');
        // Enable button when spin is over
        startButton.style.pointerEvents = 'auto';
        // Need to set transition to none as we want to rotate instantly
        wheel.style.transition = 'none';
        // Calculate degree on a 360 degree basis to get the "natural" real rotation
        // Important because we want to start the next spin from that one
        // Use modulus to get the rest value from 360
        const actualDeg = deg % 360;
        // Set the real rotation instantly without animation
        wheel.style.transform = `rotate(${actualDeg}deg)`;
        let account = sessionStorage.getItem('account');
        if(account == null) return;
        web3.eth.getBalance(account, function(err, result) {
            if (err) {
                console.log(err)
            } else {
                $("#eth_count").html("Balance: "+ web3.utils.fromWei(result, "ether") + " ETH")
            }
        })
    });
})();
