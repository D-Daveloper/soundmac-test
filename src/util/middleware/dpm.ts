import axios from "axios";

// Function to get new access token
const getAccessToken = async () => {
  try {
    // const requestBody = {
    //   userName: process.env.DPM_USERNAME_V2,
    //   password: process.env.DPM_PASSWORD_V2,
    // };

    // // Calculate Content-Length
    // const contentLength = Buffer.byteLength(JSON.stringify(requestBody));

    // const response = await axios.post('https://app.dpmnetworks.com/access-token', requestBody, {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Accept-Language': 'en-US',
    //     'Host': 'app.dpmnetworks.com',
    //     'Content-Length': contentLength,
    //     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36'
    //   }
    // });

    // const accessToken = response.data.result.accessToken;
    // const refreshToken = response.data.result.refreshToken;
    // let token = await dpmToken.findOne({ userId: process.env.ADMIN_ID });
    // if(!token){
    //     const newToken = new dpmToken({
    //       userId: process.env.ADMIN_ID,
    //       accessToken: accessToken,
    //       refreshToken: refreshToken,
    //       tokenExpiry: new Date(Date.now() + 600000)  // Expiry in 10 mins
    //     });
    //     await newToken.save();  // Ensure this is awaited
    //     console.log("first access token:", newToken);
    //     // return accessToken;
    // }else{
    //     const updatedToken = {
    //       accessToken: accessToken,
    //       refreshToken: refreshToken,
    //       tokenExpiry: new Date(Date.now() + 600000) //Expiry in 10 mins
    //     };

    //     await dpmToken.findByIdAndUpdate(token._id, updatedToken);
    //     console.log("second access token:", accessToken)
    //     // return accessToken;
    // }
    // console.log(accessToken)
    // return accessToken;
  } catch (error) {
    console.log("Error getting access token:", error);
    console.log("Error getting access token:", error);
    // throw error;  // Handle the error appropriately
  }
};

export const getUPCs = async () => {
  try {
    return "test_"+Date.now();
    const accessToken = await getAccessToken();
    // console.log(accessToken);
    const response = await axios.get(`${process.env.DPM_URL}v2/upc/assign/${process.env.DPM_CLIENT_ID}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Host': 'portal.dpmnetworks.com',
        'Content-Type': 'application/json',
        'Accept-Language': 'en-US',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36' 
        // 'Content-Length': contentLength
      }
    });

    return response.data.upc_list[0];  // Assuming you need the first UPC
  } catch (error) {
    console.error("Error fetching client UPCs:", error);
    // throw error;
  }
};