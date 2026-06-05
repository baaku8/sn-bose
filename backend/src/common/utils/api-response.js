//for standardization of API Response.

class APIResponse{

    static ok(res,message,data=null){
        return res.status(200).json({
            success:true,
            message,
            data
        })
    }

    static create(res,message,data=null){
        return res.status(201).json({
            success:true,
            message,
            data
        })
    }
    
}

export default APIResponse;