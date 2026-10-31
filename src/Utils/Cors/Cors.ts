import { CorsOptions } from "cors";
import { env } from "../../config/config.service";


const WhiteList = env.WHITE_LIST.split(",");

export  const corsOption:CorsOptions = {
    origin: (origin,callback)=>{
        if(!origin){
            return callback(null,true);
        }
        if(WhiteList.includes(origin)){
            return callback( null,true);
        }
        return callback(new Error("Not allowed by CORS"));
    }
}