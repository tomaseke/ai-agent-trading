import createTeam from "./aiteam.js";
import fs from 'fs';

export default async function analyzeToken(token) {
    const team = createTeam(token);
    const res = await team.start();
    fs.writeFileSync(`results/${token.name}`, JSON.stringify({...token, ...res}, null, 2));
    console.log(res, 'mmmmmm');
}

async function shouldIBuy() {
    
}