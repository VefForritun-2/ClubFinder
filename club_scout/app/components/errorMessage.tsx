export default function errorMessage(errorMessage:string){
    return (
        <div style={{textAlign:"center"}}>
            <p style={{display: "inline-block",fontSize: "85%",color:"white",border:"red 1px solid",borderRadius:"20px",padding: "20px",marginTop: "10px",backgroundColor: "black"}}>ERROR: {errorMessage}</p>
        </div>
    )
    
}