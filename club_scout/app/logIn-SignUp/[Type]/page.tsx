import { sign_up,sign_in,getPreferences } from "@/app/library/actions" //þarf ekki .tsx
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import errorMessage from "@/app/components/errorMessage"
import styles from "@/app/button.module.css"


export async function Form(props :{type: string}){

  const {type} = props
  const preferences = await getPreferences()

  if (type==="log_in"){
    return(
      <form style={{display: "grid",gridTemplateColumns:"1fr",justifyItems:"center",margin: "auto",width: "10%", textAlign: "center"}} action={sign_in}>
        
        <h3>Username</h3>
        <input id="username" name="username" required></input>
      
        <h3>Password</h3>
        <input type="password" id="password" name="password" required></input>

        <button type="submit" className={styles.submitButton}>Sign in</button>

        <p>Don't have an account? <a href="/logIn-SignUp/sign_up">Sign up</a></p> {/* Link to sign-up */}

      </form>
    )
  }
  else if (type==="sign_up"){
    return(
      <form style={{display: "grid",gridTemplateColumns:"1fr",justifyItems:"center",margin: "auto",width: "50%", textAlign: "center"}} action={sign_up}>

        <h3>Username</h3>
        <input id="username" name="username" required></input>

        <h3>Password</h3>
        <input type="password" id="password" name="password" required></input>

        <h3>Re-enter your password</h3>
        <input type="password" id="passwordCheck" name="passwordCheck" required></input>

        <label htmlFor="categories">categories:</label>
        <div id="categories">{/* við getum breyt þetta til option element og finna eih leið til að sækja multiple values */}
        {preferences?.map((a)=><div key={a.id}><input type="checkbox" name={a.preference}/> {a.preference}</div>)}
        </div>

        <button type="submit" className={styles.submitButton}>Sign up</button>

        <p>Already have an account? <a href="/logIn-SignUp/log_in">Log in</a></p> {/* Link to log-in */}

      </form>
    )
  }
  else{
    console.log("fail")
    redirect("/")
  }
  
}

export default async function Page({params}: {params: Promise<{Type:string}>}){

  const type = (await params).Type//nafnið af þetta og nafnið á dynamic route þarf að vera eins
  const cookie = await cookies()
  let error = <div></div>

  if (cookie.has("haveSignedIn")){
    redirect("/profile/"+cookie.get("haveSignedIn")?.value)
  }

  if (cookie.has("error")){
    error = await errorMessage(String(cookie.get("error")?.value))
  }

  return (
    <div>
      <h1>ClubScout</h1>
      <Form type={type} />
      {error}
    </div>
)
}