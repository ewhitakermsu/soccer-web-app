import axios from "axios";

const instance = axios.create({
    //Sets a default base URL for future API calls to reduce repetitive code
    baseURL: "http://localhost:3000",
}); 

//The interceptor automatically includes line 12 for every request
instance.interceptors.request.use((config) => {
  //Retrieves the token from local storage after login
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default instance;

//I am going to have to use and import axios instance everywhere that I would have used basic axios