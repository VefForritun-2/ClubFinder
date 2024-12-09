import { getUserData,createClub,getPreferences, editClub, getClubData, club_preferences } from "@/app/library/actions"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { isNumberObject } from "util/types"

export default async function Page({params}: {params:Promise<{User:string}>}){
    const cookie = await cookies()
    const userData = await getUserData(cookie.get("haveSignedIn")?.value)
    const user = (await params).User
    const ownedClubsType = (await params).ownedClubs // ignore-a þetta
    const prefernces = await getPreferences()


    if (cookie.has("haveSignedIn") && user === userData.user_name){
        if (ownedClubsType === "newClub"){

            return (<div>
                <h1>test with new club!</h1>
                
                <form action={createClub}>

                    <label htmlFor="clubName">club name:</label>
                    <input name="clubName" id="clubName" required/>

                    <label htmlFor="description">description:</label>
                    <textarea name="description" id="description" required></textarea>

                    <label htmlFor="logo">logo:</label>
                    <input type="file" name="logo" id="logo"/>

                    <label htmlFor="categories">categories:</label>
                    <div id="categories">{/* við getum breyt þetta til option element og finna eih leið til að sækja multiple values */}
                    {prefernces?.map((a)=><div key={a.id}><input type="checkbox" name={a.preference}/> {a.preference}</div>)}
                    </div>

                    <button type="submit">create club!</button>
                </form>
            </div>)
        }
        
        else if (!isNaN(ownedClubsType)){

            const clubData = await getClubData(Number(ownedClubsType)) 
            const clubCategory = await club_preferences(clubData.id)
            const a = await getPreferences()
            let listOfClubCategory = []

            for (let x of clubCategory){
                listOfClubCategory.push(x.preference_id)
            }

            return (<div>
                <h1>test with already made club!</h1>
                <h3>
                <form action={editClub}>

                    <input type="hidden" name="clubId" defaultValue={ownedClubsType} />

                    <label htmlFor="clubName">club name:</label>
                    <input name="clubName" id="clubName" defaultValue={clubData.name} required/>

                    <label htmlFor="description">description:</label>
                    <textarea name="description" id="description" defaultValue={clubData.description} required></textarea>

                    <label htmlFor="logo">logo:</label>
                    <input type="file" name="logo" id="logo"/>

                    <label htmlFor="categories">categories:</label>
                    <div id="categories">{/* við getum breyt þetta til option element og finna eih leið til að sækja multiple values */}
                    {prefernces?.map((a) => {
                        if (listOfClubCategory.includes(a.id)){
                            return <div key={a.id}><input type="checkbox" name={a.preference} defaultChecked /> {a.preference}</div>
                        }

                        return <div key={a.id}><input type="checkbox" name={a.preference}/> {a.preference}</div>
                        })}
                    </div>

                    <button type="submit">Save changes!</button>
                </form>
                </h3>
            </div>)}
        
    
    }
    else{
        redirect("/logIn-SignUp/log_in")
    }
    
}