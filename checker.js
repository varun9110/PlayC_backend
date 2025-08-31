const fetch = require('node-fetch');
const open = require('open');

// const url = 'https://prenotami.esteri.it/Services/Booking/5373';
const url = 'https://google.com';

const headers = {
    'Cookie': '_pk_id.E1e0Ge2p6l.5f67=999ed7c716543204.1750735358.; Lyp1CWKh=A4ER-Z-XAQAA4lu310GGaKJrin6-XPw3ptXrgiwIp7YzA4S0h2sp69e6RBg-AbiUpSuucp7CwH8AAEB3AAAAAA==; _Culture=2; BIGipServerpool_prenotami.esteri.it=rd21o00000000000000000000ffffc0a806e8o443; _pk_ref.E1e0Ge2p6l.5f67=%5B%22%22%2C%22%22%2C1750800956%2C%22https%3A%2F%2Fconstoronto.esteri.it%2F%22%5D; _pk_ses.E1e0Ge2p6l.5f67=1; .cookie.=524lh6sBqLvGJQOvSmfjTJC4NgfPPHzj2enKZFhauqqHVypHa3j5ZCIPWwQu-mmPeOPk4IcnNE_R-dBOZIEG7ujDynDHJ1cxM0fd8WuVtzBKM7VPuXZ1buIMDIfrGiKKMC62MBCdtDr4EoIWlZuyHryeTRyY74L1-Fq7CcXTBVzU82sWwje-XuCahlrn1687ZUZPBQ9Gvo8ge95klhdYhFzEkabJ2jrc8ix99MClOFw6B3LXyInz92NDhPR4CTZPn6xfKlLXoeQZQvtg19Gbrg1YGmxiJ7BbvIBFgMz13q9RG3I0-CFgP8W9e9TecMc8HYxuulqwN-_qW2psoUyBTWXm4C8CPJDycX3STdGWYn84kP1HPxpy8QPUTja0Hs0cFUc9zB70nCcXrBJAfWbhkKQskwB9nsqP0OlXVVss63XsW3eH9xYaSSv5oI6WW4ImdnBDjJCfOhmaIWx_6Y7oqR5pzjmRZb-ahRObmFh5orj0aCK3fz5_XEr9W31n39uj1mEB1JaYaqxniFOcU0w_f_Pzndbf7TXmWgXbtrXSeO6_A-8qlrnZrZ4NFldxJP-IGkPWgrle_I-unAS5x-rqf6Iw92sHqPD_K74t6WM86Ow; TS01a5ae52030=01574ed751a7ff2195559c8d0a7d96aa51fb16e6503a75474ae4937ba0ae1da4bac1ca9c5359d56bf9b4b57d91e1605290edf914ca; ASP.NET_SessionId=lc2hlswfmypearvqqojeajox; TS01a5ae52=01a6f07363a92bab408a6121f581cf5ee8341dc36de7e6e0b3708713fdf750ac76c2db942e9df7011eb5d951462a7cfb3aafddeab08411c891554c51a67ab228e6266df3751f9a0b1f35103eb92be24abf55e8a1014cc7ea410f2685b735f6408c24eb14ec84a5a3c93cb7ab8750ed535ba0f412e16e723d7513e4c309d2e439d96a187711; OClmoOot=A2l59Z-XAQAA-aSr5_j3JtdRtLxnISfmQPFw5db8vsjYYJ8HE5c5UzHlfT8lAbiUpSuucp7CwH8AAEB3AAAAAA|1|0|70da8199f3dac3269cdbb6fe2bc3d286e661bfa8; TS85ef4567027=085c4e0199ab20008048481444d86dec267ca4b87b636748cbd1d829314f732ea6a88cda8118c3ed080168a401113000d86b65aadbdcccebcc0da1eb57b7b62769d5623f5c500b83260df636d8e09fbfe5cfd7de386bce8ea10abe668c1a7a88',
    'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
};


const checkUrl = async () => {
  try {
    console.log("Making api call")
    const response = await fetch(url, { headers });

    if (response.status === 200) {
      console.log('🎉 200 OK received. Opening in browser...');
      await open(url);
      process.exit(); // Stop the script
    } else {
      console.log(`🔁 Status: ${response.status}. Retrying...`);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
};

// Keep trying every 10 seconds
setInterval(checkUrl, 10000);
