const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');

const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({blockchain});



const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

setTimeout(()=> pubsub.broadcastChain(),1000);

app.use(bodyParser.json());

app.get('/api/blocks', (req,res)=>{
    res.json(blockchain.chain);
})

app.post('/api/mine',(req,res)=>{
    const { data } = req.body;
    console.log('THIS IS DATA RECEIVED ON POST API/MINE', data)
    blockchain.addBlock({ data });
    res.redirect('/api/blocks');
})

const syncChains = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks`},(error,response,body)=>{
        console.log(`--------this is reques inside syncChains() from ${ROOT_NODE_ADDRESS}/api/blocks--------`)
        if(!error && response.statusCode === 200){
            const rootChain  = JSON.parse(body);
            console.log('Replace chain on a sync with', rootChain);
            blockchain.replaceChain(rootChain);
        }
    })
}


let PEER_PORT;

if(process.env.GENERATE_PEER_PORT === 'true'){
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random()*1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;

app.listen(PORT, () => {
    console.log(`Listening on local port ${PORT}`);
    if(PORT !== DEFAULT_PORT){
    console.log(`I called syncchains()!!!!!! where PORT is ${PORT} and DEFAULT PORT IS ${DEFAULT_PORT}`)
    syncChains();
    }
});
